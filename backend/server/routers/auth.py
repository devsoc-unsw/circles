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
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN



from .auth_utility.session_token import SessionError, SessionStorage
from .auth_utility.middleware import HTTPBearer401, SessionTokenToValidUserID, ValidatedToken
from .auth_utility.oidc_requests import UserInfoResponse, exchange_and_validate, get_user_info
from .auth_utility.oidc_errors import OIDCError

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)
sessions = SessionStorage()
require_token = HTTPBearer401()
validated_uid = SessionTokenToValidUserID(session_store=sessions)

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
    state: str

@router.post("/login")
def exchange_authorization_code(data: ExchangeCodePayload) -> str:
    try:
        res = exchange_and_validate(data.code)
    except OIDCError as e:
        # TODO: finer grain error checks
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=f"Invalid code: {data.code}. Extra info: {e.error_description}"
        ) from e
    
    token_res, id_token = res

    # TODO: do some stuff with the id token here like user setup

    return sessions.new_session(token_res, id_token)

@router.delete("/logout")
def logout(token: Annotated[str, Security(require_token)]):
    try:
        sessions.destroy_session(token)
    except SessionError as e:
        # TODO: more fine grained error checking
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.description
        ) from e
    except OIDCError as e:
        # TODO: more fine grained error checking
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.error_description
        ) from e

@router.get("/info")
def user_info(user: Annotated[ValidatedToken, Security(validated_uid)]):
    return user.full_info
    
@router.get("/validatedUserID")
def get_validated_user_id(user: Annotated[ValidatedToken, Security(validated_uid)]) -> str:
    return user.user_id

@router.get("/checkToken")
def check_token(user: Annotated[ValidatedToken, Security(validated_uid)]):
    # TODO: check it is in database
    return
