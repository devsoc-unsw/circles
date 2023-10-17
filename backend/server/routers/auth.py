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
from secrets import token_urlsafe
from time import time
from typing import Annotated, Dict, Iterator, List, Literal, Optional, Tuple, TypedDict, cast
from fastapi import APIRouter, Cookie, Depends, HTTPException, Header, Request, Response, Security
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN

from .auth_utility.session_token import SessionError, SessionExpiredOIDC, SessionStorage
from .auth_utility.middleware import HTTPBearer401, SessionTokenValidator, ValidatedToken
from .auth_utility.oidc_requests import UserInfoResponse, exchange_and_validate, generate_oidc_auth_url, get_user_info
from .auth_utility.oidc_errors import OIDCError

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)
sessions = SessionStorage()
require_token = HTTPBearer401()
validated_uid = SessionTokenValidator(session_store=sessions)


class UnauthorizedModel(BaseModel):
    detail: str

class ForbiddenModel(BaseModel):
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
    code: str

class IdentityPayload(BaseModel):
    session_token: str

@router.delete("/killallsessions")
def kill_all_sessions():
    sessions.empty()

@router.get(
    "/identity", 
    response_model=IdentityPayload
)
def get_identity(res: Response, refresh_token: Annotated[Optional[str], Cookie()] = None):
    if refresh_token is None:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="User is not logged in."
        )

    # generate the new session token
    try:
        ref_tok, ref_exp, ses_tok = sessions.new_session_token(refresh_token)
    except SessionError as e:
        # can either be invalid session token, expired session token, or expired oidc pair
        # TODO: do we want to deal with the other random OIDC errors?
        res.delete_cookie("refresh_token")
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.description,
            headers={ "set-cookie": res.headers["set-cookie"] },
        ) from e

    # set the cookies and return the identity
    res.set_cookie(
        key="refresh_token", 
        value=ref_tok,
        # secure=True,
        httponly=True,
        # domain="circlesapi.csesoc.app",
        expires=datetime.fromtimestamp(ref_exp, tz=timezone.utc),
    )
    return IdentityPayload(session_token=ses_tok)

@router.get(
    "/auth_url",
    response_model=str
)
def create_auth_url(res: Response) -> str:
    # TODO: check if we want to encrypt this?
    # TODO: make the login page actually use this
    state = token_urlsafe(32)
    auth_url = generate_oidc_auth_url(state)
    expires_at = int(time()) + (5 * 60)

    res.set_cookie(
        key="next_auth_state", 
        value=state,
        # secure=True,
        httponly=True,
        # domain="circlesapi.csesoc.app",
        expires=datetime.fromtimestamp(expires_at, tz=timezone.utc),
    )
    return auth_url

@router.post(
    "/login", 
    response_model=IdentityPayload
)
def exchange_authorization_code(res: Response, data: ExchangeCodePayload) -> IdentityPayload:
    try:
        token_res = exchange_and_validate(data.code)
    except OIDCError as e:
        # TODO: finer grain error checks
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=f"Invalid code: {data.code}. Extra info: {e.error_description}"
        ) from e
    
    token_res, id_token = token_res

    # TODO: do some stuff with the id token here like user database setup

    # set the cookies and respond with the session token
    # TODO: I believe no errors possible here?
    ref_tok, ref_exp, ses_tok = sessions.new_login_session(token_res, id_token)

    # set the cookies and return the identity
    res.set_cookie(
        key="refresh_token", 
        value=ref_tok,
        # secure=True,
        httponly=True,
        # domain="circlesapi.csesoc.app",
        expires=datetime.fromtimestamp(ref_exp, tz=timezone.utc),
    )
    return IdentityPayload(session_token=ses_tok)

@router.delete("/logout")
def logout(res: Response, token: Annotated[str, Security(require_token)]):
    try:
        sessions.destroy_session(token)
        res.delete_cookie("refresh_token")
    except SessionError as e:
        # TODO: do we want to clear cookie here?
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.description
        ) from e

@router.get(
    "/userinfo",
    response_model=UserInfoResponse,
)
def user_info(res: Response, user: Annotated[ValidatedToken, Security(validated_uid)]):
    try:
        info = sessions.session_token_to_userinfo(user.token)
        return info
    except SessionExpiredOIDC as e:
        # OIDC has expired and could not be refreshed, hence will be logged out
        res.delete_cookie("refresh_token")
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.description,
            headers={ "set-cookie": res.headers["set-cookie"] },
        ) from e
    except SessionError as e:
        # just the session has expired, will need to call a /identity to continue
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.description
        ) from e

@router.get(
    "/validatedUser", 
    response_model=ValidatedToken,
    responses={
        HTTP_401_UNAUTHORIZED: { "model": UnauthorizedModel }
    },
)
def get_validated_user(user: Annotated[ValidatedToken, Security(validated_uid)]):
    return user

@router.get(
    "/checkToken", 
    response_model=None,
    responses={
        HTTP_401_UNAUTHORIZED: { "model": UnauthorizedModel },
        HTTP_403_FORBIDDEN: { "model": ForbiddenModel },
    },
)
def check_token(user: Annotated[ValidatedToken, Security(validated_uid)]):
    # TODO: check it is in database
    return
