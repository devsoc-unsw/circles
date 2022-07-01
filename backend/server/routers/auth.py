""" Routes to deal with user Authentication. """

from fastapi import APIRouter

router = APIRouter(
    prefix="/courses",
    tags=["courses"],
)

