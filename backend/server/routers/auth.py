""" Routes to deal with user Authentication. """

from fastapi import APIRouter
import pyjwt

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

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
    pass

