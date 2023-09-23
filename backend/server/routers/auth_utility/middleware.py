from pprint import pprint
from typing import Any, Dict, List, Literal, Optional, Tuple, TypeVar, TypedDict, cast
from fastapi import HTTPException, Request, Security
from fastapi.security import HTTPBearer, OAuth2AuthorizationCodeBearer
from fastapi.security.base import SecurityBase
from fastapi.security.utils import get_authorization_scheme_param
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN
from fastapi.openapi.models import HTTPBearer as HTTPBearerModel
from fastapi.openapi.models import OAuthFlows as OAuth2FlowsModel
from fastapi.openapi.models import OAuth2 as OAuth2Model, OAuthFlowAuthorizationCode
from backend.server.routers.auth_utility.session_token import SessionStorage

from server.routers.auth_utility.oidc_requests import UserInfoResponse, get_user_info

def extract_bearer_token(request: Request) -> Optional[str]:
    authorization = request.headers.get("Authorization")
    scheme, credentials = get_authorization_scheme_param(authorization)
    if not (authorization and scheme and credentials and scheme.lower() == "bearer" and credentials != ""):
        return None
    return credentials

class ValidatedToken(BaseModel):
    token: str
    user_id: str
    full_info: UserInfoResponse

class HTTPBearer401(SecurityBase):
    # remake because of: https://github.com/tiangolo/fastapi/issues/10177
    def __init__(
        self,
        *,
        scheme_name: Optional[str] = None,
        auto_error: bool = True,
    ):
        self.model = HTTPBearerModel(bearerFormat="Bearer")
        self.scheme_name = scheme_name or self.__class__.__name__
        self.auto_error = auto_error

    async def __call__(
        self, request: Request
    ) -> Optional[str]:
        # get the token out of the header
        token = extract_bearer_token(request)
        if token is None:
            if self.auto_error:
                raise HTTPException(
                    status_code=HTTP_401_UNAUTHORIZED,
                    detail=f"Token was not given in correct format.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None
        return token

require_token = HTTPBearer401(auto_error=True)  # TODO: do this better, auto_error does not get transferred through
class SessionTokenToValidUserID:
    def __init__(self, *, session_store: SessionStorage, auto_error: bool = True):
        self.auto_error = auto_error
        self.sessions = session_store

    async def __call__(self, token: str = Security(require_token)) -> Optional[str]:
        # TODO: session convert
        # TODO: is sessionstorage taking too much responsibility?

        res = get_user_info("aslkjd")
        if res is None:
            return None
        return res["sub"]
