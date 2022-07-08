""" Routes to deal with user Authentication. """


from fastapi import APIRouter
from fastapi import HTTPException
from google.auth.transport import requests
from google.oauth2 import id_token
# import jwt

# TODO: Move this to a config file
CLIENT_ID = "1017197944285-i4ov50aak72667j31tuieffd8o2vd5md.apps.googleusercontent.com"

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

# TODO: Need to validate secret somehow


# TODO: Wrap this as a decorator aroudn proptected apis
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
        idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), CLIENT_ID
        )
    except ValueError:
        # Invalid Token
        raise HTTPException(
            status_code=400,
            detail=f"Invalid token: {token}"
        )
    return idinfo

# @router.post(
#     "/login",
#     responses={
#         200: {
#             "description": "take a token, and validate it and return back user info",
#             "content": {
#                 "application/json": {
#                       # Outdated TODO: update
#                     "example": {
#                         "token": "jwt..."
#                     }
#                 }
#             }
#         }
#     }
# )
# def auth_login(token: jwt):
#     if not validate_token(token):
#         return False
#     if not validate_login():
#         # Create new user
#         pass
#     return token
