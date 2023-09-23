import base64
import os
from pprint import pprint
from typing import Any, Dict, List, Literal, Optional, Tuple, TypedDict, cast
from dotenv import load_dotenv
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer, OAuth2AuthorizationCodeBearer
from fastapi.security.base import SecurityBase
from fastapi.security.utils import get_authorization_scheme_param
import jwt
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN
import requests

from .constants import CLIENT_ID, CLIENT_SECRET

# csesoc_issuer_info = requests.get("https://id.csesoc.unsw.edu.au/.well-known/openid-configuration")
ISSUER = "https://id.csesoc.unsw.edu.au"
AUTH_ENDPOINT = "https://id.csesoc.unsw.edu.au/oauth2/auth"
TOKEN_ENDPOINT = "https://id.csesoc.unsw.edu.au/oauth2/token"
USERINFO_ENDPOINT = "https://id.csesoc.unsw.edu.au/userinfo"
REVOCATION_ENDPOINT = "https://id.csesoc.unsw.edu.au/oauth2/revoke"
REDIRECT_URI = "http://localhost:3000/login/success/csesoc"
JWKS_ENDPOINT = "https://id.csesoc.unsw.edu.au/.well-known/jwks.json"

SCOPES = "openid offline_access"

class TokenResponse(TypedDict):
    access_token: str
    expires_in: int
    id_token: str
    refresh_token: str
    scope: Literal["openid offline_access"]
    token_type: Literal["bearer"]
    expires_at: int

class RefreshResponse(TypedDict):
    access_token: str
    expires_in: int
    id_token: str
    refresh_token: str
    scope: Literal["openid offline_access"]
    token_type: Literal["bearer"]

class DecodedIDToken(TypedDict):
    at_hash: str                # partial hash of access token  # TODO: read 3.2.2.9
    aud: list[str]              # audiences that token was intended for, seems to be hashed
    auth_time: int              # end user first authentication time
    exp: int                    # expiry time
    iat: int                    # id token issued at time
    iss: str                    # issuer identifier ("https://id.csesoc.unsw.edu.au")
    jti: str                    # unique id of the JWT
    rat: int                    # token request time
    sid: str                    # session id
    sub: str                    # unique identifier 

class UserInfoResponse(TypedDict):
    aud: List[str]
    auth_time: int
    iat: int
    iss: str
    rat: int
    sub: str

class OIDCError(Exception):
    # TODO: PLACEHOLDER - do better
    req_status_code: int
    error: Optional[str]
    error_description: Optional[str]

    def __init__(self, req_status_code: int, error: Optional[str], error_description: Optional[str]) -> None:
        self.req_status_code = req_status_code
        self.error = error
        self.error_description = error_description

#
# raw requests
#
def client_secret_basic_credentials() -> str:
    con = f"{CLIENT_ID}:{CLIENT_SECRET}".encode("utf-8")
    return base64.b64encode(con).decode("utf-8")


def get_user_info(access_token: str) -> UserInfoResponse:
    # make a request to get user info, if this fails, the token is invalid
    res = requests.get(
        USERINFO_ENDPOINT, 
        headers={ "Authorization": f"Bearer {access_token}" }  # TODO: should i add accepts json
    )

    try:
        resjson = res.json()
        if res.ok:
            return resjson

        # good kind of error, # TODO: handle the types of errors
        raise OIDCError(
            res.status_code,
            resjson.get("error"),
            resjson.get("error_description"),
        )
    except requests.exceptions.JSONDecodeError:
        raise OIDCError(
            res.status_code,
            "Response not JSON.",  # TODO: make special error
            res.text
        )
    
def exchange_tokens(code: str) -> TokenResponse:
    # TODO: figure out how we ought to use state?
    # https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint
    credentials = client_secret_basic_credentials()
    res = requests.post(
        TOKEN_ENDPOINT,
        headers={ 
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {credentials}",
        },
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
        }
    )
    try:
        resjson = res.json()
        if res.ok:
            return resjson

        # good kind of error, # TODO: handle the types of errors
        raise OIDCError(
            res.status_code,
            resjson.get("error"),
            resjson.get("error_description"),
        )
    except requests.exceptions.JSONDecodeError:
        raise OIDCError(
            res.status_code,
            "Response not JSON.",  # TODO: make special error
            res.text
        )

def refresh_access_token(refresh_token: str) -> RefreshResponse:
    # https://openid.net/specs/openid-connect-core-1_0.html#RefreshingAccessToken
    credentials = client_secret_basic_credentials()
    res = requests.post(
        TOKEN_ENDPOINT,
        headers={ 
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {credentials}",
        },
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "scope": SCOPES,
        }
    )

    try:
        resjson = res.json()
        if res.ok:
            return resjson

        # good kind of error, # TODO: handle the types of errors
        raise OIDCError(
            res.status_code,
            resjson.get("error"),
            resjson.get("error_description"),
        )
    except requests.exceptions.JSONDecodeError:
        raise OIDCError(
            res.status_code,
            "Response not JSON.",  # TODO: make special error
            res.text
        )

def revoke_token(token: str, token_type: Literal["access_token", "refresh_token"]):
    # https://www.rfc-editor.org/rfc/rfc7009
    credentials = client_secret_basic_credentials()
    res = requests.post(
        REVOCATION_ENDPOINT,
        headers={ 
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {credentials}",
        },
        data={
            "token": token,
            "token_type_hint": token_type,
        }
    )
    if res.ok:
        return
    
    try:
        resjson = res.json()

        # good kind of error, # TODO: handle the types of errors
        raise OIDCError(
            res.status_code,
            resjson.get("error"),
            resjson.get("error_description"),
        )
    except requests.exceptions.JSONDecodeError:
        raise OIDCError(
            res.status_code,
            "Response not JSON.",  # TODO: make special error
            res.text
        )

# 
# validation functions
#
# TODO: maybe remove the optional for these in favour of OIDC validation errors
def validate_id_token(token: str) -> Optional[DecodedIDToken]:
    # TODO: error check
    jwkclient = jwt.PyJWKClient(JWKS_ENDPOINT)
    signing_key = jwkclient.get_signing_key_from_jwt(token)

    try:
        return jwt.decode(
            token, 
            key=signing_key.key, 
            algorithms=["RS256"],
            audience=CLIENT_ID,
            issuer=ISSUER,
            options={"verify_signature": True},
        )
    except jwt.exceptions.InvalidTokenError as e:
        # TODO: handle better
        return None

def validated_refreshed_id_token(old_token: DecodedIDToken, new_token: str) -> Optional[DecodedIDToken]:
    # https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokenResponse
    # TODO: error hceck
    decoded = validate_id_token(new_token)

    if decoded is None:
        return None
    if decoded["sub"] != old_token["sub"]:
        return None
    if decoded["auth_time"] != old_token["auth_time"]:
        return None

    return decoded

def exchange_and_validate(authorization_code: str) -> Optional[Tuple[TokenResponse, DecodedIDToken]]:
    # https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
    tokensres = exchange_tokens(authorization_code)
    print("\n\nDEBUG: exchanged token for\n")
    pprint(tokensres)
    print()
    print()
    
    # TODO: handle these checks better, potentially move them too
    if tokensres.get("token_type", "").lower() != "bearer" or tokensres.get("scope", "").lower() != SCOPES:
        return None
    if "access_token" not in tokensres or "refresh_token" not in tokensres or "id_token" not in tokensres:
        return None

    # validate the id token
    # TODO: validate the access token
    id_token = validate_id_token(tokensres["id_token"])
    if id_token is None:
        return None

    print("\n\nDEBUG: validated id_token\n")
    pprint(id_token)
    print()
    print()
    return (tokensres, id_token)

def refresh_and_validate(old_id_token: DecodedIDToken, refresh_token: str) -> Optional[Tuple[RefreshResponse, DecodedIDToken]]:
    refreshed = refresh_access_token(refresh_token)
    validated = validated_refreshed_id_token(old_id_token, refreshed["id_token"])
    if validated is None:
        return None
    return refreshed, validated
