""" Routes to deal with user Authentication. """
from typing import Annotated, Dict, List, Literal, Optional, Tuple, TypedDict, cast
from fastapi import APIRouter, Depends, HTTPException, Header, Request, Security
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN



from .auth_utility.session_token import SessionError, SessionStorage
from .auth_utility.middleware import HTTPBearer401, SessionTokenToValidUserID, ValidatedToken
from .auth_utility.oidc_requests import UserInfoResponse, exchange_and_validate, get_user_info
from .auth_utility.oidc_errors import OIDCError

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
    except OIDCError as e:
        # TODO: finer grain error checks
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=f"Invalid code: {data.code}. Extra info: {e.error_description}"
        ) from e
    
    token_res, id_token = res

    # TODO: do some stuff with the id token here like user setup

    return sessions.new_session(token_res, id_token)

@router.delete("/logout")
def logout(token: Annotated[str, Security(require_token)]):
    try:
        sessions.destroy_session(token)
    except SessionError as e:
        # TODO: more fine grained error checking
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.description
        ) from e
    except OIDCError as e:
        # TODO: more fine grained error checking
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.error_description
        ) from e

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
