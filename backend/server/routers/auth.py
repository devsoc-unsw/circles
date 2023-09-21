""" Routes to deal with user Authentication. """
from typing import Annotated, Dict, List, Literal, Optional, Tuple, TypedDict, cast
from fastapi import APIRouter, Depends, HTTPException, Header, Request, Security
from pydantic import BaseModel

from backend.server.routers.auth_utility.session_token import SessionStorage

from .auth_utility.middleware import HTTPBearer401, SessionTokenToValidUserID
from .auth_utility.oidc_requests import UserInfoResponse, exchange_auth_code_for_tokens, get_user_info

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)
sessions = SessionStorage()
require_token = HTTPBearer401()
validated_uid = SessionTokenToValidUserID(session_store=sessions)

class ExchangeCodePayload(BaseModel):
    code: str
    state: str

@router.post("/login")
def exchange_authorization_code(data: ExchangeCodePayload) -> str:
    res = exchange_auth_code_for_tokens(data.code, data.state)
    if res is None:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid code: {data.code}"
        )
    
    # TODO: do some stuff with the id token here like user setup
    return res[0]["access_token"]

@router.get("/info")
def user_info(token: str = Security(require_token)):
    return get_user_info(token, True)

@router.get("/validatedUserID")
def get_validated_user_id(user_id: Annotated[str, Security(validated_uid)]) -> str:
    return user_id

@router.get("/checkToken")
def check_token(user_id: str = Security(validated_uid)):
    # TODO: check it is in database
    return
