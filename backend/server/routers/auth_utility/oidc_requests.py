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
from .oidc_errors import OIDCTokenError, OIDCValidationError, OIDCUnknownError, OIDCUserInfoError

# csesoc_issuer_info = requests.get("https://id.csesoc.unsw.edu.au/.well-known/openid-configuration")
ISSUER = "https://id.csesoc.unsw.edu.au"
AUTH_ENDPOINT = "https://id.csesoc.unsw.edu.au/oauth2/auth"
TOKEN_ENDPOINT = "https://id.csesoc.unsw.edu.au/oauth2/token"
USERINFO_ENDPOINT = "https://id.csesoc.unsw.edu.au/userinfo"
REVOCATION_ENDPOINT = "https://id.csesoc.unsw.edu.au/oauth2/revoke"
REDIRECT_URI = "http://localhost:3000/login/success/csesoc"
JWKS_ENDPOINT = "https://id.csesoc.unsw.edu.au/.well-known/jwks.json"

SCOPES = "openid offline_access"

# TODO: move to pydantic and handle as validation errors

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
        
        # TODO: make sure issuer is correct 5.3.4

        raise OIDCUserInfoError.from_dict(resjson)
    except requests.exceptions.JSONDecodeError as e:
        print(res.status_code, res.text)
        raise OIDCUnknownError(
            error_description="UserInfo: Response was not json.",
            extra_info=res.text,
            status_code=res.status_code
        ) from e
    
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

        raise OIDCTokenError.from_dict(resjson)
    except requests.exceptions.JSONDecodeError as e:
        print(res.status_code, res.text)
        raise OIDCUnknownError(
            error_description="Exchange: Response was not json.",
            extra_info=res.text,
            status_code=res.status_code
        ) from e

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

        raise OIDCTokenError.from_dict(resjson)
    except requests.exceptions.JSONDecodeError as e:
        raise OIDCUnknownError(
            error_description="Refresh: Response was not json.",
            extra_info=res.text,
            status_code=res.status_code
        ) from e

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
    
    try:
        if res.ok:
            return
        resjson = res.json()

        raise OIDCTokenError.from_dict(resjson)
    except requests.exceptions.JSONDecodeError as e:
        print("status_code")
        print(res.status_code)
        print(res.text)
        raise OIDCUnknownError(
            error_description="Revoke: Response was not json.",
            extra_info=res.text,
            status_code=res.status_code
        ) from e

# 
# validation functions
#
# TODO: do we want to convert these all to Optional responses?
def validate_id_token(token: str) -> DecodedIDToken:
    jwkclient = jwt.PyJWKClient(JWKS_ENDPOINT)  # TODO: move this out?
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
        raise OIDCValidationError(
            error_description="Could not validate id_token",
        ) from e

def validated_refreshed_id_token(old_token: DecodedIDToken, new_token: str) -> DecodedIDToken:
    # https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokenResponse
    decoded = validate_id_token(new_token)

    if decoded["sub"] != old_token["sub"] or decoded["auth_time"] != old_token["auth_time"]:
        raise OIDCValidationError(
            error_description="Could not validate refreshed id_token, either sub or auth_time do not match.",
            extra_info=f"'{old_token['sub']}' != '{decoded['sub']}' or '{old_token['auth_time']}' != '{decoded['auth_time']}'"
        )

    return decoded

def exchange_and_validate(authorization_code: str) -> Tuple[TokenResponse, DecodedIDToken]:
    # https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
    tokensres = exchange_tokens(authorization_code)
    print("\n\nDEBUG: exchanged token for\n")
    pprint(tokensres)
    print()
    print()
    
    # TODO: handle these checks better, potentially move them too
    if tokensres.get("token_type", "").lower() != "bearer" or tokensres.get("scope", "").lower() != SCOPES:
        raise OIDCValidationError(
            error_description="Invalid token_type/scopes in exchange response.",
            extra_info=f"'token_type' != 'bearer' or 'scope' != '{SCOPES}'."
        )
    if "access_token" not in tokensres or "refresh_token" not in tokensres or "id_token" not in tokensres:
        raise OIDCValidationError(
            error_description="Exchange response is missing a token.",
        )

    # validate the id token
    # TODO: validate the access token
    id_token = validate_id_token(tokensres["id_token"])

    print("\n\nDEBUG: validated id_token\n")
    pprint(id_token)
    print()
    print()
    return (tokensres, id_token)

def refresh_and_validate(old_id_token: DecodedIDToken, refresh_token: str) -> Tuple[RefreshResponse, DecodedIDToken]:
    refreshed = refresh_access_token(refresh_token)
    # TODO: do i need to do bearer check?
    validated = validated_refreshed_id_token(old_id_token, refreshed["id_token"])
    return refreshed, validated
