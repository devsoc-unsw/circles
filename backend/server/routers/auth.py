""" Routes to deal with user Authentication. """


from functools import wraps

from fastapi import APIRouter
from fastapi import HTTPException
from google.auth.transport import requests
from google.oauth2 import id_token
from time import time

from server.config import CLIENT_ID

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

# TODO: should have own type for jwt


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
    except ValueError:
        # Invalid Token
        raise HTTPException(
            status_code=400,
            detail=f"Invalid token: {token}"
        )
    return id_info

def require_login(protected_func):
    """
        Decorator to protect routes that need login.
        This will validate the token. On a successful validation,
        the `protected_func` will be called with the `token` kwarg
        replaced with the contents of the decoded token (dict).

        Example Usage:
            @router.method("/protected_route", responses={200: {}})
            @require_login
            def protected_route(token, *args, **kwargs):
                ...
                pass
        Note:
            - The protected funtion MUST have `token` as a kwarg
            - The token will come in as a string but, the `protected_func`
                must be able to handle it being converted to a dict
    """
    @wraps(protected_func)
    def wrapper_require_login(*args, **kwargs):
        # TODO: this should *actually* take kwargs["userData"]["token"] = ...
        # once userData is refactored
        kwargs["token"] = validate_token(kwargs["token"])
        # TODO: should also do login functionality
        return protected_func(*args, **kwargs)
    return wrapper_require_login


# TODO: document responses
@router.post("/login")
@require_login
def auth_login(token = ""):
    if not validate_user_exists(token):
        return auth_new_user()
    return token


@require_login
def auth_new_user(token):
    """
        Create a new user based off the token provided.
        Not its own route, as creation is indistinguishable to "/login"
    """
    
    creation_time = int(time())

    return {
        "creation_time": creation_time,
        "user_id": token["sub"],
        "token": token
    }

def validate_user_exists(token: str) -> bool:
    """
        Given a valid token, check if the associated user exists.
    """
    # TODO: should actually check inside of the  database once created
    return token["sub"] not in [None, ""]
