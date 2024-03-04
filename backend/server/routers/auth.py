""" Routes to deal with user Authentication. """
from datetime import datetime, timezone
from time import time
from typing import Annotated, Dict, Optional, cast
from fastapi import APIRouter, Cookie, HTTPException, Response
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED


from .auth_utility.sessions.errors import SessionExpiredRefreshToken, SessionOldRefreshToken
from .auth_utility.sessions.storage import RefreshToken, SessionOIDCInfo
from .auth_utility.sessions.interface import get_oidc_info, logout_session, new_token_pair

# from server.routers.user import user_is_setup, default_cs_user, reset, set_user

# from .auth_utility.session_token import SessionError, SessionExpiredOIDC, SessionStorage
from .auth_utility.middleware import HTTPBearer401
from .auth_utility.oidc.requests import DecodedIDToken, get_user_info, refresh_and_validate, revoke_token
from .auth_utility.oidc.errors import OIDCInvalidGrant, OIDCInvalidToken

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
    "/identity", 
    response_model=IdentityPayload
)
def get_identity(res: Response, refresh_token: Annotated[Optional[RefreshToken], Cookie()] = None) -> IdentityPayload:
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

    print("new identity")
    print(datetime.now())
    print("session expires:", datetime.fromtimestamp(session_expiry))
    print("refresh expires:", datetime.fromtimestamp(refresh_expiry))

    # set the cookies and return the identity
    res.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        # secure=True,
        httponly=True,
        # domain="circlesapi.csesoc.app",
        expires=datetime.fromtimestamp(refresh_expiry, tz=timezone.utc),  
    )
    time()
    return IdentityPayload(session_token=new_session_token, exp=session_expiry, uid=uid)
