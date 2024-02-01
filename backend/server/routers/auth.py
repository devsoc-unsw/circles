""" Routes to deal with user Authentication. """
from fastapi import APIRouter

from server.routers.user import default_cs_user, reset, set_user

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post('/token')
def create_user_token(token: str):
    set_user(token, default_cs_user())
    reset(token)
