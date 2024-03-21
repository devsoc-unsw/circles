""" Routes to deal with user Authentication. """
from datetime import datetime, timezone
from typing import Annotated, Dict, Optional, cast
from fastapi import APIRouter, Cookie, HTTPException, Response
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_400_BAD_REQUEST

from .auth_utility.sessions.errors import SessionExpiredRefreshToken, SessionOldRefreshToken
from .auth_utility.sessions.storage import RefreshToken, SessionOIDCInfo
from .auth_utility.sessions.interface import get_oidc_info, logout_session, new_login_session, new_token_pair

from .auth_utility.middleware import HTTPBearer401, set_refresh_token_cookie
from .auth_utility.oidc.requests import DecodedIDToken, exchange_and_validate, get_user_info, refresh_and_validate, revoke_token, validate_authorization_response
from .auth_utility.oidc.errors import OIDCInvalidGrant, OIDCInvalidToken, OIDCTokenError, OIDCValidationError

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

@router.get(
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
        res.delete_cookie("refresh_token")
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
            revoke_token(oidc_info.refresh_token, "refresh_token")
            logout_session(sid)
            res.delete_cookie("refresh_token")
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

@router.post(
    "/login", 
    response_model=IdentityPayload
)
def login(res: Response, data: ExchangeCodePayload, next_auth_state: Annotated[Optional[str], Cookie()] = None) -> IdentityPayload:
    # TODO: i believe there can be errors before getting here?
    if next_auth_state is None:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="Cookie 'next_auth_state' was missing from request."
        )

    try:
        # validate params given in the payload
        auth_code = validate_authorization_response(next_auth_state, data.query_params)
        # exchange the auth code for tokens and validate them
        tokens, id_token = exchange_and_validate(auth_code)
    except (OIDCValidationError, OIDCTokenError) as e:
        # TODO: refine these error checks
        raise e from e

    # create new login session for user in db, generating new tokens
    uid = id_token["sub"]
    new_oidc_info = SessionOIDCInfo(
        access_token=tokens["access_token"],
        raw_id_token=tokens["id_token"],
        refresh_token=tokens["refresh_token"],
        validated_id_token=cast(dict, id_token),
    )
    new_session_token, session_expiry, new_refresh_token, refresh_expiry = new_login_session(uid, new_oidc_info)

    # set token cookies and return the identity response
    print("\n\nnew login", uid)
    print(datetime.now())
    print("session expires:", datetime.fromtimestamp(session_expiry))
    print("refresh expires:", datetime.fromtimestamp(refresh_expiry))

    # set the cookies and return the identity
    set_refresh_token_cookie(res, new_refresh_token, refresh_expiry)
    return IdentityPayload(session_token=new_session_token, exp=session_expiry, uid=uid)
