import os
from secrets import token_urlsafe
from typing import Dict, Tuple, TypedDict
from dotenv import load_dotenv
import jwt
from pydantic import BaseModel

from .constants import JWT_SECRET

from .oidc_requests import DecodedIDToken

class Session(BaseModel):
    access_token: str                   # most recent access token
    raw_id_token: str                   # most recent id token string
    refresh_token: str                  # most recent refresh token
    validated_id_token: DecodedIDToken  # most recent valid id token object
    token_exp: int                      # access token expiry time (best effort since not returned at refresh) 
    session_exp: int                    # session expiry time


UserID = str
SessionID = str
SessionStorage = Dict[UserID, Dict[SessionID, Session]]

class TokenPayload(TypedDict):
    uid: str
    sid: str

def generate_token(uid: str) -> Tuple[SessionID, str]:
    sid = token_urlsafe(32)
    return sid, jwt.encode(
        payload={ uid: uid, sid: sid },
        key=JWT_SECRET,
        algorithm="HS512"
    )

def decode_token(token: str) -> TokenPayload:
    return jwt.decode(
        jwt=token,
        key=JWT_SECRET,
        algorithms=["HS512"]
    )
