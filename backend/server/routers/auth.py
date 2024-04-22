""" Routes to deal with user Authentication. """
from typing import Annotated, Dict, Optional, cast
from datetime import datetime
from secrets import token_urlsafe
from time import time
from urllib.parse import parse_qs
from fastapi import APIRouter, Cookie, HTTPException, Response, Security
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR

from server.routers.user import default_cs_user, reset, set_user

from .auth_utility.sessions.errors import SessionExpiredRefreshToken, SessionExpiredToken, SessionOldRefreshToken
from .auth_utility.sessions.storage import RefreshToken, SessionOIDCInfo, SessionToken, clear_db, get_session_info as get_session_info_from_sid
from .auth_utility.sessions.interface import get_oidc_info, get_token_info, logout_session, new_login_session, new_token_pair

from .auth_utility.middleware import HTTPBearer401, set_next_state_cookie, set_refresh_token_cookie
from .auth_utility.oidc.requests import DecodedIDToken, exchange_and_validate, generate_oidc_auth_url, get_user_info, refresh_and_validate, revoke_token, validate_authorization_response
from .auth_utility.oidc.errors import OIDCInvalidGrant, OIDCInvalidToken, OIDCTokenError, OIDCValidationError

STATE_TTL = 10 * 60

class UnauthorizedErrorModel(BaseModel):
    detail: str

class ForbiddenErrorModel(BaseModel):
    detail: str

class ExchangeCodePayload(BaseModel):
    query_params: Dict[str, str]

class IdentityPayload(BaseModel):
    session_token: str
    exp: int
    uid: str

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

require_token = HTTPBearer401()

@router.post('/token')
def create_user_token(token: str):
    set_user(token, default_cs_user())
    reset(token)

@router.post(
    "/refresh", 
    response_model=IdentityPayload
)
def refresh(res: Response, refresh_token: Annotated[Optional[RefreshToken], Cookie()] = None) -> IdentityPayload:
    # refresh flow - returns a new identity given the circles refresh token
    if refresh_token is None or len(refresh_token) == 0:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="User is not logged in."
        )

    # generate the token pair
    # first get the oidc session details, this will check if it hasnt expired
    try:
        sid, uid, oidc_info = get_oidc_info(refresh_token)
    except (SessionExpiredRefreshToken, SessionOldRefreshToken) as e:
        # if old refresh token, will destroy the session on the backend
        set_refresh_token_cookie(res, None)
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.description,
            headers={ "set-cookie": res.headers["set-cookie"] },
        ) from e

    # then check if it is still valid with federated auth
    #   if not, refresh it and update the oidc session details
    new_oidc_info = oidc_info
    try:
        _ = get_user_info(oidc_info.access_token)  # TODO: update user details with this info
    except OIDCInvalidToken:
        # access token has expired, try refresh
        # will raise if could not refresh
        try:
            refreshed, validated = refresh_and_validate(cast(DecodedIDToken, oidc_info.validated_id_token), oidc_info.refresh_token)
            new_oidc_info = SessionOIDCInfo(
                access_token=refreshed["access_token"],
                raw_id_token=refreshed["id_token"],
                refresh_token=refreshed["refresh_token"],
                validated_id_token=cast(dict, validated),
            )
        except OIDCInvalidGrant as e:
            # refresh token has expired, any other errors are bad and should be handled else ways
            # revoke_token(oidc_info.refresh_token, "refresh_token")  # NOTE: if the fresh token is invalid, i give up
            logout_session(sid)
            set_refresh_token_cookie(res, None)
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail=e.error_description,
                headers={ "set-cookie": res.headers["set-cookie"] },
            ) from e

    # if here, the oidc session was still valid. Create the new token pair
    new_session_token, session_expiry, new_refresh_token, refresh_expiry = new_token_pair(sid, new_oidc_info)

    print("\n\nnew identity", uid, sid)
    print(datetime.now())
    print("session expires:", datetime.fromtimestamp(session_expiry))
    print("refresh expires:", datetime.fromtimestamp(refresh_expiry))

    # set the cookies and return the identity
    set_refresh_token_cookie(res, new_refresh_token, refresh_expiry)
    return IdentityPayload(session_token=new_session_token, exp=session_expiry, uid=uid)

@router.get(
    "/authorization_url",
    response_model=str
)
def create_auth_url(res: Response) -> str:
    state = token_urlsafe(32)
    auth_url = generate_oidc_auth_url(state)
    expires_at = int(time()) + STATE_TTL

    set_next_state_cookie(res, state, expires_at)
    return auth_url

@router.post(
    "/lolol"
)
def swap(ps: str) -> dict:
    return {k: v[0] for k, v in parse_qs(ps).items()}

@router.post(
    "/login", 
    response_model=IdentityPayload
)
def login(res: Response, data: ExchangeCodePayload, next_auth_state: Annotated[Optional[str], Cookie()] = None) -> IdentityPayload:
    if next_auth_state is None:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="Cookie 'next_auth_state' was missing from request."
        )

    try:
        # validate params given in the payload
        auth_code = validate_authorization_response(next_auth_state, data.query_params)
    except OIDCValidationError as e:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="Could not validate your params, please try again."
        ) from e

    try:
        # exchange the auth code for tokens and validate them
        tokens, id_token = exchange_and_validate(auth_code)
    except OIDCInvalidGrant as e:
        # the auth code was invalid
        set_next_state_cookie(res, None)
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="Invalid request, please try again.",
            headers={ "set-cookie": res.headers["set-cookie"] },
        ) from e
    except (OIDCTokenError, OIDCValidationError) as e:
        # might want to refine these error checks, but all are pretty bad
        print(e)
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not exchange tokens, contact admin please.",
        ) from e

    # create new login session for user in db, generating new tokens
    uid = id_token["sub"]
    new_oidc_info = SessionOIDCInfo(
        access_token=tokens["access_token"],
        raw_id_token=tokens["id_token"],
        refresh_token=tokens["refresh_token"],
        validated_id_token=cast(dict, id_token),
    )
    new_session_token, session_expiry, new_refresh_token, refresh_expiry = new_login_session(uid, new_oidc_info)

    # TODO: do some stuff with the id token here like user database setup

    print("\n\nnew login", uid)
    print(datetime.now())
    print("session expires:", datetime.fromtimestamp(session_expiry))
    print("refresh expires:", datetime.fromtimestamp(refresh_expiry))

    # set the cookies and return the identity
    set_next_state_cookie(res, None)
    set_refresh_token_cookie(res, new_refresh_token, refresh_expiry)
    return IdentityPayload(session_token=new_session_token, exp=session_expiry, uid=uid)

@router.delete(
    "/logout",
    response_model=None
)
def logout(res: Response, token: Annotated[SessionToken, Security(require_token)]):
    # delete the cookie first since this will always happen
    set_refresh_token_cookie(res, None)

    try:
        # get the user id and the session id from the token
        _, sid = get_token_info(token)
        session_info = get_session_info_from_sid(sid)
        assert session_info is not None

        revoke_token(session_info.oidc_info.refresh_token, "refresh_token")
    except SessionExpiredToken as e:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.description,
            headers={ "set-cookie": res.headers["set-cookie"] },
        ) from e
    except OIDCInvalidGrant as e:
        # invalid grant could happen if its expired thats fine
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.error_description,
            headers={ "set-cookie": res.headers["set-cookie"] },
        ) from e
    except OIDCTokenError as e:
        # cant imagine what error this could be, but if it happens, its bad
        print(e)
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Please contact server admin,something went wrong",
            headers={ "set-cookie": res.headers["set-cookie"] },
        ) from e

    # revoke the oidc session and kill the session
    assert logout_session(sid)

@router.get(
    "/test_token"
)
def test_token(token: Annotated[SessionToken, Security(require_token)]):
    try:
        return get_token_info(token)
    except SessionExpiredToken as e:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.description,
        ) from e

@router.delete(
    "/clear_sessions"
)
def clear_sessions():
    clear_db()
