from collections import defaultdict
from secrets import token_urlsafe
from time import time
from typing import DefaultDict, Dict, Optional, Tuple, TypedDict
import jwt
from pydantic import BaseModel, PositiveInt

from .constants import JWT_SECRET

from .oidc_requests import DecodedIDToken, TokenResponse, refresh_access_token, refresh_and_validate, validated_refreshed_id_token

class Session(BaseModel):
    access_token: str                   # most recent access token
    raw_id_token: str                   # most recent id token string
    refresh_token: str                  # most recent refresh token
    validated_id_token: DecodedIDToken  # most recent valid id token object
    # token_exp: int                      # access token expiry time (best effort since not returned at refresh) 
    session_exp: int                    # session expiry time


UserID = str
SessionID = str

class TokenJWTPayload(TypedDict):
    uid: str
    sid: str

def generate_token(uid: str) -> Tuple[SessionID, str]:
    sid = token_urlsafe(32)
    return sid, jwt.encode(
        payload={ "uid": uid, "sid": sid },
        key=JWT_SECRET,
        algorithm="HS512"
    )

def decode_token(token: str) -> TokenJWTPayload:
    return jwt.decode(
        jwt=token,
        key=JWT_SECRET,
        algorithms=["HS512"]
    )

class SessionStorage:
    def __init__(self, session_length: PositiveInt = 60 * 60 * 24 * 30) -> None:
        self.store: DefaultDict[UserID, Dict[SessionID, Session]] = defaultdict(lambda: {})
        self.session_length = session_length

    def new_session(self, token_res: TokenResponse, id_token: DecodedIDToken) -> str:
        # creates a new session, returning the session jwt token
        session = Session(
            access_token = token_res["access_token"],
            raw_id_token = token_res["id_token"],
            refresh_token = token_res["refresh_token"],
            validated_id_token = id_token.copy(),
            # token_exp = -1,  # TODO: token_res["expires_at"]
            session_exp = int(time()) + self.session_length
        )

        # TODO: check if the token sid already exists, log them out if so
        # TODO: thoughts also on a max sessions?
        uid = id_token["sub"]
        sid, jwtstr = generate_token(uid)

        assert sid not in self.store[uid]
        self.store[uid][sid] = session
        return jwtstr

    def get_session_unchecked(self, session_token: str) -> Optional[Tuple[str, str, Session]]:
        # NOTE: ideally do not use this method
        ids = decode_token(session_token)
        if ids["uid"] not in self.store or ids["sid"] not in self.store[ids["uid"]]:
            # session did not exist
            return None
        return ids["uid"], ids["sid"], self.store[ids["uid"]][ids["sid"]]
    
    def refresh_session(self, session_token: str):
        # NOTE: ideally dont use this directly, this is implicitly done if needed with a session_token_to_uid
        # tries to refresh the tokens behind the session, will delete it if it fails
        if (info := self.get_session_unchecked(session_token)) is None:
            return
        uid, sid, session = info

        # TODO: make sure the session hasn't expired either

        try:
            res = refresh_and_validate(session.validated_id_token, session.refresh_token)
            if res is None:
                # TODO: i hate none checks
                raise Exception()
            refreshed, validated = res

            self.store[uid][sid] = Session(
                access_token=refreshed["access_token"],
                raw_id_token=refreshed["id_token"],
                refresh_token=refreshed["refresh_token"],
                validated_id_token=validated.copy(),
                session_exp=session.session_exp,
            )
        except:
            # TODO: better error checking
            del self.store[uid][sid]
            return
        
        
    # def session_token_to_user(self, session_token: str) -> Optional[Tuple[str, ]
