""" Routes to deal with user Authentication. """
from typing import Annotated, Dict, List, Literal, Optional, Tuple, TypedDict, cast
from fastapi import APIRouter, Depends, HTTPException, Header, Request, Security
from pydantic import BaseModel

from .auth_utility.middleware import HTTPBearerTokenVerifier, ValidatedToken
from .auth_utility.oidc_requests import exchange_auth_code_for_tokens, get_user_info

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)
require_token = HTTPBearerTokenVerifier()

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
    return res[0]

@router.get("/info")
def user_info(token: str = Security(require_token)):
    return get_user_info(token, True)

@router.get("/checkToken")
def check_token(token: str = Security(require_token)):
    # TODO: check it is in database
    return
