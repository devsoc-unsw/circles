import base64
from typing import Dict, List, Literal, Tuple, TypedDict
from urllib.parse import urlencode
import jwt
import requests

from .constants import CLIENT_ID, CLIENT_SECRET
from .errors import OIDCTokenError, OIDCValidationError, OIDCUnknownError, OIDCUserInfoError

OPENID_CONFIG = "https://id.csesoc.unsw.edu.au/.well-known/openid-configuration"
# csesoc_issuer_info = requests.get(OPENID_CONFIG)
ISSUER = "https://id.csesoc.unsw.edu.au"
AUTH_ENDPOINT = "https://id.csesoc.unsw.edu.au/oauth2/auth"
TOKEN_ENDPOINT = "https://id.csesoc.unsw.edu.au/oauth2/token"
USERINFO_ENDPOINT = "https://id.csesoc.unsw.edu.au/userinfo"
REVOCATION_ENDPOINT = "https://id.csesoc.unsw.edu.au/oauth2/revoke"
REDIRECT_URI = "http://localhost:3000/login/success/csesoc"
JWKS_ENDPOINT = "https://id.csesoc.unsw.edu.au/.well-known/jwks.json"

SCOPES = "openid offline_access"

REQUEST_TIMEOUT = 5

# TODO-OLLI(pm): should i move to pydantic and handle as validation errors
# TODO-OLLI(pm): should i add accepts json
# TODO-OLLI: move the above constants to a request to the config endpoint
# TODO-OLLI(pm): handle the raw request errors like timeout and cannot establish connection

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
    at_hash: str                # partial hash of access token
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

def generate_oidc_auth_url(state: str) -> str:
    params = urlencode({
        "client_id": CLIENT_ID,
        "response_type": "code",
        "scope": SCOPES,
        "redirect_uri": REDIRECT_URI,
        "state": state,
    })
    return f"{AUTH_ENDPOINT}?{params}"

def get_user_info(access_token: str) -> UserInfoResponse:
    # make a request to get user info, if this fails, the token is invalid
    res = requests.get(
        USERINFO_ENDPOINT,
        headers={ "Authorization": f"Bearer {access_token}" },
        timeout=REQUEST_TIMEOUT
    )

    try:
        resjson = res.json()
        if res.ok:
            return resjson

        raise OIDCUserInfoError.from_dict(resjson)
    except requests.exceptions.JSONDecodeError as e:
        print(res.status_code, res.text)
        raise OIDCUnknownError(
            error_description="UserInfo: Response was not json.",
            extra_info=res.text,
            status_code=res.status_code
        ) from e

def exchange_tokens(code: str) -> TokenResponse:
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
        },
        timeout=REQUEST_TIMEOUT
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
        },
        timeout=REQUEST_TIMEOUT
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
        },
        timeout=REQUEST_TIMEOUT
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
def validate_authorization_response(exp_state: str, query_params: Dict[str, str]) -> str:
    state = query_params.get("state")
    code = query_params.get("code")
    scope = query_params.get("scope")
    if state is None or state != exp_state:
        raise OIDCValidationError("State param was not as expected.", state)
    if code is None:
        raise OIDCValidationError("Code param was not present.")
    if scope is None or scope != SCOPES:
        raise OIDCValidationError("Scope param was not correct.", scope)

    return code

def compute_at_hash(access_token: str) -> str:
    # https://pyjwt.readthedocs.io/en/stable/usage.html#oidc-login-flow
    alg = jwt.get_algorithm_by_name("RS256")
    digest = alg.compute_hash_digest(access_token.encode())
    computed = base64.urlsafe_b64encode(digest[:(len(digest) // 2)]).rstrip(b"=")
    return computed.decode()

def validate_id_token(token: str, access_token: str) -> DecodedIDToken:
    # NOTE: we could move the jwkclient out but it is fine
    jwkclient = jwt.PyJWKClient(JWKS_ENDPOINT)
    signing_key = jwkclient.get_signing_key_from_jwt(token)

    try:
        decoded: DecodedIDToken = jwt.decode(
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

    # validate at_hash
    computed_at_hash = compute_at_hash(access_token)
    if decoded["at_hash"] != computed_at_hash:
        raise OIDCValidationError(
            error_description=f"Computed at_hash did not match, {decoded['at_hash']} != {computed_at_hash}",
        )
    return decoded

def validated_refreshed_id_token(old_token: DecodedIDToken, new_token: str, new_access_token: str) -> DecodedIDToken:
    # https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokenResponse
    decoded = validate_id_token(new_token, new_access_token)

    if decoded["sub"] != old_token["sub"] or decoded["auth_time"] != old_token["auth_time"]:
        raise OIDCValidationError(
            error_description="Could not validate refreshed id_token, either sub or auth_time do not match.",
            extra_info=f"'{old_token['sub']}' != '{decoded['sub']}' or '{old_token['auth_time']}' != '{decoded['auth_time']}'"
        )

    return decoded

def exchange_and_validate(authorization_code: str) -> Tuple[TokenResponse, DecodedIDToken]:
    # https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
    tokensres = exchange_tokens(authorization_code)

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
    id_token = validate_id_token(tokensres["id_token"], tokensres["access_token"])

    return (tokensres, id_token)

def refresh_and_validate(old_id_token: DecodedIDToken, refresh_token: str) -> Tuple[RefreshResponse, DecodedIDToken]:
    refreshed = refresh_access_token(refresh_token)

    # NOTE: do i need to do bearer check? i get token_type from refresh but idc, 
    # it should be the same as the initial exchange, and that is already validated
    # does not mention anywhere on the spec I should
    validated = validated_refreshed_id_token(old_id_token, refreshed["id_token"], refreshed["access_token"])
    return refreshed, validated

def get_userinfo_and_validate(id_token: DecodedIDToken, access_token: str) -> UserInfoResponse:
    info_res = get_user_info(access_token)

    # TODO-OLLI(pm): make sure aud is correct 5.3.2
    if info_res["sub"] != id_token["sub"] or info_res["iss"] != ISSUER:
        raise OIDCValidationError(
            error_description="UserInfo response sub or issuer were wrong"
        )

    return info_res
