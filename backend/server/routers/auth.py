""" Routes to deal with user Authentication. """
from fastapi import APIRouter

from server.routers.user import default_cs_user, reset, set_user

from functools import wraps
from time import time

from fastapi import APIRouter, Depends, HTTPException, Header
from google.auth.transport import requests  # type: ignore
from google.oauth2 import id_token  # type: ignore
from server.config import CLIENT_ID
from typing import Annotated, Dict, List, Literal, Optional, Tuple, TypedDict, cast
from fastapi import APIRouter, Depends, HTTPException, Header, Request, Security
from datetime import datetime, timezone
from time import time
from typing import Annotated, Dict, Optional, cast
from fastapi import APIRouter, Cookie, HTTPException, Response
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED

from server.routers.user import user_is_setup

from .auth_utility.sessions.errors import SessionExpiredRefreshToken, SessionOldRefreshToken
from .auth_utility.sessions.storage import RefreshToken, SessionOIDCInfo
from .auth_utility.sessions.interface import get_oidc_info, logout_session, new_token_pair

# from server.routers.user import user_is_setup, default_cs_user, reset, set_user

# from .auth_utility.session_token import SessionError, SessionExpiredOIDC, SessionStorage
from .auth_utility.middleware import HTTPBearer401
from .auth_utility.oidc.requests import DecodedIDToken, get_user_info, refresh_and_validate, revoke_token
from .auth_utility.oidc.errors import OIDCInvalidGrant, OIDCInvalidToken

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)
# sessions = SessionStorage()
require_token = HTTPBearer401()
# validated_uid = SessionTokenValidator(session_store=sessions)
# setup_uid = SessionTokenValidator(session_store=sessions, check_user_is_setup=user_is_setup)


class UnauthorizedErrorModel(BaseModel):
    detail: str

class ForbiddenErrorModel(BaseModel):
    detail: str

@router.post('/token')
def create_user_token(token: str):
    set_user(token, default_cs_user())
    reset(token)

def validate_login(token) -> bool:
    """
        Take a token and validate a login off the following criteria
            - token i
            - token has not expired (given in unix time)
            - email verified
            - email exists in our BE
    """
    return token


def validate_token(token: str):
    """
        Take a token and validate it using the google library.
        - NEVER trust the FE to validate the token.
        - NEVER manually decode the token w/ other libraries
        Note: This does not check if the user exists in our database,
            only that the token is of valid form

        Returns - Decoded token as dictionary with user info
        {
            # These fields are ALWAYS included
            "iss": (str) - "https://accounts.google.com" # 'https' optional,
            "sub": (str(int)) - google account ID,
            "azp": (str) - client_id of authorized presenter
            "aud": (str) - CLIENT_ID that the token is intended for,
            "iat": (int) - unix time for when token was issued
            "exp": (int) - unix time integer for expiry date of token
            # These fields *should* be included if use grants 'profile' and 'email' scope
            "email": (str) - user's email,
            "email_vefified": (bool) - had the user verified their email,
            "picture": (str) - url of user's profile picture,
            "given_name": (str) - user's given name,
            "family_name": (str) - user's family name,
            "locale": (str): 
        }
        More info at: "https://developers.google.com/identity/protocols/oauth2/openid-connect"
    """
    try:
        # TODO: if using multiple CLIENT_IDs then, must validate
        # that aud is valid
        id_info = id_token.verify_oauth2_token(
                token, requests.Request(), CLIENT_ID
        )
    except ValueError as err:
        # Invalid Token
        raise HTTPException(
            status_code=400,
            detail=f"Invalid token: {token}"
        ) from err
    return id_info

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
