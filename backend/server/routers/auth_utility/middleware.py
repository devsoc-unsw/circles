from pprint import pprint
from typing import Any, Dict, List, Literal, Optional, Tuple, TypedDict, cast
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer, OAuth2AuthorizationCodeBearer
from fastapi.security.base import SecurityBase
from fastapi.security.utils import get_authorization_scheme_param
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN
from fastapi.openapi.models import HTTPBearer as HTTPBearerModel
from fastapi.openapi.models import OAuthFlows as OAuth2FlowsModel
from fastapi.openapi.models import OAuth2 as OAuth2Model, OAuthFlowAuthorizationCode

from server.routers.auth_utility.oidc_requests import UserInfoResponse, get_user_info

def extract_token(request: Request, auto_error: bool) -> Optional[str]:
    authorization = request.headers.get("Authorization")
    scheme, credentials = get_authorization_scheme_param(authorization)
    if not (authorization and scheme and credentials and scheme.lower() == "bearer" and credentials != ""):
        if auto_error:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail=f"Token was not given in correct format",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return None
    return credentials

class ValidatedToken(BaseModel):
    token: str
    user_id: str
    full_info: UserInfoResponse

class HTTPBearerTokenVerifier(SecurityBase):
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
        token = extract_token(request, self.auto_error)
        if token is None:
            return None
        
        return token
        
        # check token against userinfo route
        # info = get_user_info(token, self.auto_error)
        # if info is None:
        #     return None
        
        # return ValidatedToken(
        #     token=token,
        #     user_id=info["sub"],
        #     full_info=info,
        # )
