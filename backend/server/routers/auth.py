""" Routes to deal with user Authentication. """
from typing import Annotated, Dict, List, Literal, Optional, Tuple, TypedDict, cast
from fastapi import APIRouter, Depends, HTTPException, Header, Request, Security
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN


from .auth_utility.session_token import SessionStorage
from .auth_utility.middleware import HTTPBearer401, SessionTokenToValidUserID, ValidatedToken
from .auth_utility.oidc_requests import OIDCError, UserInfoResponse, exchange_and_validate, get_user_info

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
    try:
        res = exchange_and_validate(data.code)
        if res is None:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail=f"Invalid code: {data.code}"
            )
    except OIDCError as e:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.error_description
        )
    
    token_res, id_token = res
    # TODO: do some stuff with the id token here like user setup
    return sessions.new_session(token_res, id_token)

@router.delete("/logout")
def logout(token: Annotated[str, Security(require_token)]):
    sessions.destroy_session(token)

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
