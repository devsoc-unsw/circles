""" Routes to deal with user Authentication. """
from fastapi import APIRouter

from server.routers.user import default_cs_user, reset, set_user

from functools import wraps
from time import time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Header
from google.auth.transport import requests  # type: ignore
from google.oauth2 import id_token  # type: ignore
from server.config import CLIENT_ID

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

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

def validate_user_exists(token: dict[str, str]) -> bool:
    """
        Given a valid token, check if the associated user exists.
    """
    # TODO: should actually check inside of the  database once created
    return token["sub"] not in [None, ""]













def try_validate_csesoc_token(token: str):

    return None

def try_validate_google_token(token: str):
    try:
        return id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
    except ValueError:
        # Invalid Token
        return None

# TODO: all this is just dummy token validating for now
UserID = str
# will validate the token and return a unique user id that is used to store data against, raises 401 Unauthorized if token invalid
VALID_TOKENS = ['loltemptoken', 'emptytoken']
def extract_authenticated_user_id(token: str) -> UserID:
    user_data = try_validate_google_token(token)
    print(user_data)

    if token in VALID_TOKENS or user_data is not None:  # TODO: this should check token against our oidc endpoints
        # TODO: ideally we return something unique to the account,
        #       so if token reveals an account id, we can pair this in a tuple with provider
        #       and that would become our unique "UserID"?? 
        return token

    raise HTTPException(
        status_code=401,
        detail=f"Invalid token: {token}"
    )

# validates the token and checks if the underlying user already exists in the database, raises 403 Forbidden if user is not setup
SETUP_TOKENS = ['loltemptoken']
def extract_valid_user_id(token: str) -> UserID:
    id = extract_authenticated_user_id(token)
    if token in SETUP_TOKENS:  # TODO: actually check if the id exists in database
        return id
    
    raise HTTPException(
        status_code=403,
        detail=f"User behind token has not yet been setup: {token}"
    )

# checks if the token is valid, in which will return 200, or 401/403 depending on how invalid the token is
@router.get("/checkToken")
def check_token(token: str):
    extract_valid_user_id(token)

# TODO: remove... example route, the front facing route takes a token, not a user, but we get it as a valid user only
@router.get("/exampleTokenExtractionParams")
def exampleTokenExtractionParams(user: UserID = Depends(extract_valid_user_id)):
    print(user)
    return user

def extract_valid_user_id_from_header(x_token: Annotated[str, Header()]):
    return extract_valid_user_id(x_token)

@router.get("/exampleTokenExtractionHeader")
def exampleTokenExtractionHeader(user: UserID = Depends(extract_valid_user_id_from_header)):
    print(user)
    return user
