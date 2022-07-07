""" Routes to deal with user Authentication. """

from fastapi import APIRouter
import jwt

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
    pass

def validate_token(token):
    """
        Take a token and validate that:
            - token not tampered
            - Token is not expired
            - email valid
        This does not check if the user is valid
    """
    return token

# Probably don't want to return a json, just a string
@router.post(
    "/login",
    responses={
        200: {
            "description": "take a token, and validate it",
            "content": {
                "application/json": {
                    "example": {
                        "token": "jwt..."
                    }
                }
            }
        }
    }
)
def auth_login(token: jwt):
    if not validate_token(token):
        return False
    if not validate_login():
        # Create new user
        pass
    return token
