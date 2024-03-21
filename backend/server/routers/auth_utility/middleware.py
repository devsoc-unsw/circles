from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, Request, Response
from fastapi.security.base import SecurityBase
from fastapi.security.utils import get_authorization_scheme_param
from fastapi.openapi.models import HTTPBearer as HTTPBearerModel
from starlette.status import HTTP_401_UNAUTHORIZED

def extract_bearer_token(request: Request) -> Optional[str]:
    authorization = request.headers.get("Authorization")
    scheme, credentials = get_authorization_scheme_param(authorization)
    if not (authorization and scheme and credentials and scheme.lower() == "bearer" and credentials != ""):
        return None
    return credentials

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
                    detail="Token was not given in correct format.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None
        return token

def set_refresh_token_cookie(res: Response, token: Optional[str] = None, expiry: Optional[int] = None) -> None:
    if token is not None and expiry is not None:
        res.set_cookie(
            key="refresh_token",
            value=token,
            # secure=True,
            httponly=True,
            # domain="circlesapi.csesoc.app",
            expires=datetime.fromtimestamp(expiry, tz=timezone.utc),
        )
    else:
        # nothing was given, delete it instead
        res.delete_cookie("refresh_token")

def set_next_state_cookie(res: Response, state: Optional[str] = None, expiry: Optional[int] = None) -> None:
    if state is not None and expiry is not None:
        res.set_cookie(
            key="next_auth_state",
            value=state,
            # secure=True,
            httponly=True,
            # path="/authorization_url",
            # domain="circlesapi.csesoc.app",
            expires=datetime.fromtimestamp(expiry, tz=timezone.utc),
        )
    else:
        res.delete_cookie("next_auth_state")
