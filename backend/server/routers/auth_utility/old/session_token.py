from collections import defaultdict
import json
from secrets import token_urlsafe
from time import time
from typing import DefaultDict, Dict, List, Optional, Set, Tuple, TypedDict
import jwt
from pydantic import BaseModel, PositiveInt

from .constants import JWT_SECRET

from .oidc_requests import DecodedIDToken, TokenResponse, UserInfoResponse, refresh_and_validate, get_user_info, revoke_token
from .oidc_errors import OIDCInvalidGrant, OIDCInvalidToken

class SessionOIDCInfo(TypedDict):
    access_token: str                   # most recent access token
    raw_id_token: str                   # most recent id token string
    refresh_token: str                  # most recent refresh token
    validated_id_token: DecodedIDToken  # most recent valid id token object

class Session(TypedDict):
    oidc: SessionOIDCInfo
    # old_rids: List[str]                 # TODO: old ref tokens, used in reuse detection
    curr_rid: str                       # the accepted refresh token
    session_exp: int                    # session expiry time

class SessionTokenJWTPayload(TypedDict):
    uid: str                            # users unique id, given by csesoc auth
    sid: str                            # unique session id, one per oidc session (ie browser session)
    tid: str                            # unique token id, one per short lived session token dealt
    exp: int                            # expiry time of the token

class RefreshTokenJWTPayload(TypedDict):
    uid: str
    sid: str
    rid: str

class SessionError(Exception):
    # Base error
    def __init__(self, description: str):
        self.description = description

class SessionInvalidToken(SessionError):
    def __init__(self, token: str):
        super().__init__("Invalid session token, could not be decoded correctly.")
        self.token = token

class SessionExpiredToken(SessionError):
    def __init__(self, token: str):
        super().__init__("Expired session/refresh token, is too old or has already been destroyed.")
        self.token = token

class SessionExpiredOIDC(SessionError):
    def __init__(self, uid: str, sid: str):
        super().__init__("Could not refresh the OIDC tokens, they are expired or destroyed.")
        self.uid = uid
        self.sid = sid

SESSION_TOKEN_LIFETIME = 60 * 15            # 15 minutes
REFRESH_TOKEN_LIFETIME = 60 * 60 * 24 * 30  # 30 days

def generate_sid():
    return token_urlsafe(16)

def generate_tid():
    return token_urlsafe(32)

def generate_rid():
    return token_urlsafe(32)

def generate_session_token(uid: str, sid: str) -> str:
    tid = generate_tid()
    return jwt.encode(
        payload={ 
            "uid": uid, 
            "sid": sid,
            "tid": tid,
            "exp": int(time()) + SESSION_TOKEN_LIFETIME
        },
        key=JWT_SECRET,
        algorithm="HS512"
    )

def generate_refresh_token(uid: str, sid: str) -> Tuple[str, str]:
    rid = generate_rid()
    return rid, jwt.encode(
        payload={ 
            "uid": uid, 
            "sid": sid,
            "rid": rid,
        },
        key=JWT_SECRET,
        algorithm="HS512"
    )

def decode_session_token(token: str) -> SessionTokenJWTPayload:
    try:
        return jwt.decode(
            jwt=token,
            key=JWT_SECRET,
            algorithms=["HS512"],
            options={"verify_signature": True},
        )
    except jwt.exceptions.ExpiredSignatureError as e:
        raise SessionExpiredToken(
            token=token
        ) from e
    except jwt.exceptions.InvalidTokenError as e:
        raise SessionInvalidToken(
            token=token
        ) from e
    
def decode_refresh_token(token: str) -> RefreshTokenJWTPayload:
    try:
        return jwt.decode(
            jwt=token,
            key=JWT_SECRET,
            algorithms=["HS512"],
            options={"verify_signature": True},
        )
    except jwt.exceptions.InvalidTokenError as e:
        raise SessionInvalidToken(
            token=token
        ) from e

# TODO: dummy tokens
class SessionStorage:
    def __init__(self):
        # map of uid,sid -> session
        self.store: DefaultDict[str, Dict[str, Session]] = defaultdict(lambda: {})
        self.__load()
        # self.__save()

    def __save(self):
        # TODO: dummy saving
        with open("sessions.json", "w") as f:
            json.dump(self.store, f)
            print(f"Saved:")
            # print(f"{self.store}")
        pass

    def __load(self):
        # TODO: dummy saving
        with open("sessions.json", "r") as f:
            res = json.load(f)
            self.store = defaultdict(lambda: {})
            self.store.update(res)
            print(f"Loaded:")
            # print(f"{self.store}")
        pass

    def empty(self):
        self.store: DefaultDict[str, Dict[str, Session]] = defaultdict(lambda: {})
        self.__save()

    def __get_session_checked(self, uid: str, sid: str, ref_tok: str) -> Session:
        if uid not in self.store or sid not in self.store[uid]:
            raise SessionExpiredToken(token=ref_tok)

        # TODO: make sure the session hasn't past expired time either
        # should be done with expiry on jwt

        return self.store[uid][sid]

    def __new_oidc_session(self, token_res: TokenResponse, id_token: DecodedIDToken) -> Tuple[str, str, str, int]:
        # TODO: check if the token sid already exists, log them out if so
        uid = id_token["sub"]
        sid = generate_sid()
        rid, refresh_token = generate_refresh_token(uid, sid)

        # creates a new session, returning the session jwt token
        session = Session(
            oidc=SessionOIDCInfo(
                access_token=token_res["access_token"],
                raw_id_token=token_res["id_token"],
                refresh_token=token_res["refresh_token"],
                validated_id_token=id_token.copy(),
            ),
            session_exp = int(time()) + REFRESH_TOKEN_LIFETIME,
            curr_rid=rid,
            # old_rids=[]
        )

        assert sid not in self.store[uid]
        self.store[uid][sid] = session
        self.__save()
        return uid, sid, refresh_token, session["session_exp"]
    
    def __refresh_oidc_session(self, uid: str, sid: str):
        # tries to refresh the tokens behind the session
        assert uid in self.store and sid in self.store[uid]
        old_session = self.store[uid][sid]

        try:
            refreshed, validated = refresh_and_validate(old_session["oidc"]["validated_id_token"], old_session["oidc"]["refresh_token"])
        except OIDCInvalidGrant as e:
            # refresh token has expired, any other errors are bad and should be handled else ways
            # TODO: do we want to revoke?
            # TODO: do we want to rethrow all other OIDC errors?
            self.__delete_session(uid, sid)
            raise SessionExpiredOIDC(
                uid=uid,
                sid=sid,
            ) from e
        
        # reset oidc info
        old_session["oidc"] = SessionOIDCInfo(
            access_token=refreshed["access_token"],
            raw_id_token=refreshed["id_token"],
            refresh_token=refreshed["refresh_token"],
            validated_id_token=validated,
        )
        self.__save()

    def __check_or_refresh_oidc_session(self, uid: str, sid: str, refetch_on_refresh: bool = False) -> Optional[UserInfoResponse]:
        # checks if the oidc session is still valid
        # currently achieves this by requesting user info
        # will try also refresh if invalid
        # set refetch_on_refresh to true if userinfo is needed, and want it to refetch after a potential refresh
        assert uid in self.store and sid in self.store[uid]
        session = self.store[uid][sid]

        try:
            user_info = get_user_info(session["oidc"]["access_token"])
            return user_info
        except OIDCInvalidToken as e:
            # access token has expired, try refresh
            # will raise if could not refresh
            self.__refresh_oidc_session(uid, sid)

        # expect to be refreshed, try again if we actually need the userinfo
        if not refetch_on_refresh:
            return None

        try:
            user_info = get_user_info(session["oidc"]["access_token"])
            return user_info
        except OIDCInvalidToken as e:
            # this shouldn't really occur
            # TODO: do we want to revoke?
            self.__delete_session(uid, sid)
            raise SessionExpiredOIDC(
                uid=uid,
                sid=sid,
            ) from e

    def __delete_session(self, uid: str, sid: str):
        # deletes the underlying session, equivalent to a del and a save
        assert uid in self.store and sid in self.store[uid]
        del self.store[uid][sid]
        self.__save()



    def new_login_session(self, token_res: TokenResponse, id_token: DecodedIDToken) -> Tuple[str, int, str]:
        # creates an entire new login session, (for when a user has just logged in) 
        # returns a (refresh_token, refresh_expiry, session_token) trio
        # the refresh token is long lived, and to be stored on a cookie (with refresh_expiry if you want)
        # the session token is short lived, and to be stored in memory, and refreshed on each page refresh with /identity

        # TODO: do we want to check the fields of the tokens to see if they are still valid?
        uid, sid, refresh_token, refresh_expiry = self.__new_oidc_session(token_res, id_token)
        session_token = generate_session_token(uid, sid)
        return refresh_token, refresh_expiry, session_token
    
    def new_session_token(self, refresh_token: str) -> Tuple[str, int, str]:
        # creates a new short lived session token, given the refresh token
        # returns a (refresh_token, refresh_expiry, session_token) trio
        # this will be the new refresh token to replace the old one, and the new session token
        
        id = decode_refresh_token(refresh_token)
        session = self.__get_session_checked(id["uid"], id["sid"], refresh_token)

        # check session has not expired and the rids match
        if session["session_exp"] < int(time()):
            # TODO: destroy our inner session
            self.__delete_session(id["uid"], id["sid"])
            raise SessionExpiredToken(refresh_token)
        if id["rid"] != session["curr_rid"]:
            # either secret has been found, or replay attack?! (potentially unintentional due to race condition potentially?!)
            # TODO: check this
            self.__delete_session(id["uid"], id["sid"])
            raise SessionExpiredToken(refresh_token)
        
        # make sure that the oidc session is also still valid
        self.__check_or_refresh_oidc_session(id["uid"], id["sid"], refetch_on_refresh=False)

        # is a valid refresh token and session, generate new token pair and update session
        # we choose to keep the session expiry the same
        rid, refresh_token = generate_refresh_token(id["uid"], id["sid"])
        session_token = generate_session_token(id["uid"], id["sid"])

        session["curr_rid"] = rid
        self.__save()
        return refresh_token, session["session_exp"], session_token

    def check_session_token(self, session_token: str) -> Tuple[str, int]:
        # checks the session token if it is still valid, 
        # returning the underlying uid if so and its expiry time, and erroring if not
        id = decode_session_token(session_token)  # NOTE: should check token expiry time itself
        session = self.__get_session_checked(id["uid"], id["sid"], session_token)
        
        # check that the overall session has not also expired
        if session["session_exp"] < int(time()):
            # TODO: do we actually want to destroy our inner session here?
            self.__delete_session(id["uid"], id["sid"])
            raise SessionExpiredToken(session_token)
        
        # TODO: do we want to do any oidc checking here?
        # all good, return the underlying uid
        return id["uid"], id["exp"]


    def destroy_session(self, session_token: str):
        id = decode_session_token(session_token)  # NOTE: should check token expiry time itself
        session = self.__get_session_checked(id["uid"], id["sid"], session_token)

        # TODO: check that we dont care if the oidc and session have expired here

        # TODO: revoke can error
        revoke_token(session["oidc"]["refresh_token"], "refresh_token")

        self.__delete_session(id["uid"], id["sid"])

    def session_token_to_userinfo(self, session_token: str) -> UserInfoResponse:
        # returns the user info of the underlying oidc layer
        id = decode_session_token(session_token)
        self.__get_session_checked(id["uid"], id["sid"], session_token)  # just here to check session exists

        info = self.__check_or_refresh_oidc_session(id["uid"], id["sid"], refetch_on_refresh=True)
        assert info is not None  # TODO: if it fails, it throws, but still make this better 
        return info
