""" Routes to deal with user Authentication. """
from secrets import token_urlsafe
from typing import Annotated, Dict, Iterator, List, Literal, Optional, Tuple, TypedDict, cast
from fastapi import APIRouter, Depends, HTTPException, Header, Request, Response, Security
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

class IdentityPayload(BaseModel):
    session_token: str

@router.delete("/killallsessions")
def kill_all_sessions():
    sessions.empty()

@router.get("/identity", response_model=IdentityPayload)
def get_identity(req: Request, res: Response):
    refresh_token = req.cookies.get("refresh_token")
    if refresh_token is None:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="User is not logged in."
        )

    # generate the new session token
    try:
        ref_tok, ref_exp, ses_tok = sessions.new_session_token(refresh_token)
    except SessionError as e:
        # TODO: more fine grained error checking
        res.delete_cookie("refresh_token")
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.description
        ) from e
    except OIDCError as e:
        # TODO: more fine grained error checking
        res.delete_cookie("refresh_token")
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.error_description
        ) from e

    # set the cookies and return the identity
    res.set_cookie(
        key="refresh_token", 
        value=ref_tok,
        # secure=True,
        httponly=True,
        # domain="circlesapi.csesoc.app",
        expires=ref_exp,
    )
    return IdentityPayload(session_token=ses_tok)

@router.post("/login", response_model=IdentityPayload)
def exchange_authorization_code(req: Request, res: Response, data: ExchangeCodePayload) -> IdentityPayload:
    try:
        token_res = exchange_and_validate(data.code)
    except OIDCError as e:
        # TODO: finer grain error checks
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=f"Invalid code: {data.code}. Extra info: {e.error_description}"
        ) from e
    
    token_res, id_token = token_res

    # TODO: do some stuff with the id token here like user database setup

    # set the cookies and respond with the session token
    try:
        ref_tok, ref_exp, ses_tok = sessions.new_login_session(token_res, id_token)
    except SessionError as e:
        # TODO: more fine grained error checking
        res.delete_cookie("refresh_token")
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.description
        ) from e
    except OIDCError as e:
        # TODO: more fine grained error checking
        res.delete_cookie("refresh_token")
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=e.error_description
        ) from e

    # set the cookies and return the identity
    print("setting cookie")
    print(ref_tok)
    res.set_cookie(
        key="refresh_token", 
        value=ref_tok,
        httponly=True,
        # TODO: THIS IS NOT SETTING, CHECK CORS POLICY AND STUFF
        # secure=True,
        # domain="circlesapi.csesoc.app",
        # expires=ref_exp,
    )
    return IdentityPayload(session_token=ses_tok)

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

# @router.get("/info")
# def user_info(user: Annotated[ValidatedToken, Security(validated_uid)]):
#     return user.full_info

@router.get("/validatedUser", response_model=ValidatedToken)
def get_validated_user(user: Annotated[ValidatedToken, Security(validated_uid)]):
    return user

@router.get("/checkToken")
def check_token(user: Annotated[ValidatedToken, Security(validated_uid)]):
    # TODO: check it is in database
    return
