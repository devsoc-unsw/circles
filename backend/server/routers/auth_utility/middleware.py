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


from .session_token import SessionError, SessionInvalidToken, SessionStorage
from .oidc_requests import UserInfoResponse, get_user_info
from .oidc_errors import OIDCError

def extract_bearer_token(request: Request) -> Optional[str]:
    authorization = request.headers.get("Authorization")
    scheme, credentials = get_authorization_scheme_param(authorization)
    if not (authorization and scheme and credentials and scheme.lower() == "bearer" and credentials != ""):
        return None
    return credentials

class ValidatedToken(BaseModel):
    user_id: str
    token: str
    expires_at: int

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
class SessionTokenValidator:
    def __init__(self, *, session_store: SessionStorage):
        # TODO: do we want auto error?
        self.sessions = session_store

    async def __call__(self, token: str = Security(require_token)) -> ValidatedToken:
        try:
            uid, exp = self.sessions.check_session_token(token)
        except SessionError as e:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail=e.description,
                headers={"WWW-Authenticate": "Bearer"},
            ) from e

        return ValidatedToken(
            user_id=uid,
            token=token,
            expires_at=exp,
        )
