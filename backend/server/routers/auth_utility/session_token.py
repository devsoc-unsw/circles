from collections import defaultdict
import json
from secrets import token_urlsafe
from time import time
from typing import DefaultDict, Dict, Optional, Tuple, TypedDict
import jwt
from pydantic import BaseModel, PositiveInt

from .constants import JWT_SECRET

from .oidc_requests import DecodedIDToken, OIDCError, TokenResponse, UserInfoResponse, refresh_and_validate, get_user_info, revoke_token

class Session(TypedDict):
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

def decode_token(token: str) -> Optional[TokenJWTPayload]:
    try:
        return jwt.decode(
            jwt=token,
            key=JWT_SECRET,
            algorithms=["HS512"]
        )
    except jwt.exceptions.InvalidTokenError as e:
        # TODO: handle better
        return None

# TODO: dummy tokens
class SessionStorage:
    def __init__(self, session_length: PositiveInt = 60 * 60 * 24 * 30) -> None:
        self.store: DefaultDict[UserID, Dict[SessionID, Session]] = defaultdict(lambda: {})
        self.__load()
        self.session_length = session_length

    def __save(self):
        # TODO: dummy saving
        with open("sessions.json", "w") as f:
            json.dump(self.store, f)
            print(f"Saved:\n{self.store}")

    def __load(self):
        # TODO: dummy saving
        with open("sessions.json", "r") as f:
            res = json.load(f)
            self.store = defaultdict(lambda: {})
            self.store.update(res)
            print(f"Loaded:\n{self.store}")

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
        self.__save()
        return jwtstr

    def __get_session_unchecked(self, session_token: str) -> Optional[Tuple[str, str, Session]]:
        # NOTE: ideally do not use this method
        ids = decode_token(session_token)
        if ids is None:
            return None
        if ids["uid"] not in self.store or ids["sid"] not in self.store[ids["uid"]]:
            # session did not exist
            return None
        return ids["uid"], ids["sid"], self.store[ids["uid"]][ids["sid"]]

    def __refresh_session(self, session_token: str):
        # NOTE: ideally dont use this directly, this is implicitly done if needed with a session_token_to_uid
        # tries to refresh the tokens behind the session, will delete it if it fails
        if (info := self.__get_session_unchecked(session_token)) is None:
            return
        uid, sid, session = info

        # TODO: make sure the session hasn't expired either

        try:
            res = refresh_and_validate(session["validated_id_token"], session["refresh_token"])
            if res is None:
                # TODO: i hate none checks
                raise Exception()
            refreshed, validated = res

            self.store[uid][sid] = Session(
                access_token=refreshed["access_token"],
                raw_id_token=refreshed["id_token"],
                refresh_token=refreshed["refresh_token"],
                validated_id_token=validated.copy(),
                session_exp=session["session_exp"],
            )
            self.__save()
        except:
            # TODO: better error checking
            self.destroy_session(session_token)
            return

    def destroy_session(self, session_token: str):
        # TODO: do we want abstract the first three lines?
        if (info := self.__get_session_unchecked(session_token)) is None:
            return
        uid, sid, session = info

        revoke_token(session["refresh_token"], 'refresh_token')
        del self.store[uid][sid]
        self.__save()

    def session_token_to_userinfo(self, session_token: str) -> Optional[UserInfoResponse]:
        if (info := self.__get_session_unchecked(session_token)) is None:
            return None
        uid, sid, session = info
        # TODO: make sure the session hasnt expired

        # validate their access tokens are still valid
        # TODO: should this be cached for a few seconds?
        # TODO: do i want to check the sub against our uid
        try:
            user_info = get_user_info(session["access_token"])
            # TODO: try refreshing
            return user_info
        except Exception as e:
            self.destroy_session(session_token)
            raise e
