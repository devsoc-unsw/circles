import json
from secrets import token_urlsafe
from time import time
from typing import Dict, Literal, NewType, Optional, Tuple, Union
from uuid import uuid4
from pydantic import BaseModel, PositiveInt

SessionID = NewType('SessionID', str)
SessionToken = NewType('SessionToken', str)
RefreshToken = NewType('RefreshToken', str)


class SessionTokenInfo(BaseModel):
    # the object stored against a session token in cache
    sid: SessionID              # id of the session behind this token
    uid: str                    # user who owns the session
    REMOVE_exp: int                   # time of expiry, will be replaced with a TTL on the cache

class RefreshTokenInfo(BaseModel):
    # object stored against the refresh token
    sid: SessionID              # id of the session behind this token
    # uid: str                    # user who owns the session
    REMOVE_exp: int                   # time of expiry, will be replaced with a TTL on the cache

class SessionOIDCInfo(BaseModel):
    access_token: str           # most recent access token
    raw_id_token: str           # most recent id token string
    refresh_token: str          # most recent refresh token
    validated_id_token: dict    # most recent valid id token object

class NotSetupSession(BaseModel):
    # object stored against the sid when session is not yet setup (brief time between during token generation)
    uid: str                    # for validation and back lookup
    setup: Literal[False]       # ensure that this can get parsed correctly

class SessionInfo(BaseModel):
    # object stored against the sid
    uid: str                      # for validation and back lookup
    oidc_info: SessionOIDCInfo
    curr_ref_token: RefreshToken  # the most recent refresh token, only one that should be accepted
    setup: Literal[True]          # ensure that this can get parsed correctly

class Database(BaseModel):
    session_tokens: Dict[SessionToken, SessionTokenInfo]
    refresh_tokens: Dict[RefreshToken, RefreshTokenInfo]
    sessions: Dict[SessionID, Union[NotSetupSession, SessionInfo]]

# TODO: DUMMY JSON LOADING
# MOVE TO A SPLIT BETWEEN REDIS AND MONGO
def load_db() -> Database:
    try:
        with open("sessions.json", "r", encoding="utf8") as f:
            res: dict = json.load(f)
            db = Database.parse_obj(res)
            print(db)
            return db
    except:
        return Database(
            session_tokens={},
            refresh_tokens={},
            sessions={},
        )

def save_db(db: Database) -> None:
    with open("sessions.json", "w", encoding="utf8") as f:
        json.dump(db.dict(), f, indent=2)
        print("Saved:")

def clear_db() -> None:
    with open("sessions.json", "w", encoding="utf8") as f:
        json.dump(Database(
            session_tokens={},
            refresh_tokens={},
            sessions={},
        ).dict(), f, indent=2)
        print("Cleared:")


# db interface function
# WARNING: these do not do any validation (other than ensuring the properties expected)
def new_token() -> str:
    return token_urlsafe(48)

def get_session_token_info(token: SessionToken) -> Optional[SessionTokenInfo]:
    db = load_db()
    info = db.session_tokens.get(token)
    if info is None:
        return None
    if info.REMOVE_exp <= int(time()):
        del db.session_tokens[token]
        return None
    return info

def get_refresh_token_info(token: RefreshToken) -> Optional[RefreshTokenInfo]:
    db = load_db()
    info = db.refresh_tokens.get(token)
    if info is None:
        return None
    if info.REMOVE_exp <= int(time()):
        del db.refresh_tokens[token]
        return None
    return info

def get_session_info(sid: SessionID) -> Optional[SessionInfo]:
    db = load_db()

    info = db.sessions.get(sid)
    if info is None or not isinstance(info, SessionInfo):
        return None  # wasn't setup or doesnt exist

    return info

def insert_new_session_token_info(sid: SessionID, uid: str, ttl_seconds: PositiveInt) -> Tuple[SessionToken, int]:
    # creates a new session, returning (token, expires_at)
    assert ttl_seconds > 0
    db = load_db()

    token = SessionToken(new_token())
    while token in db.session_tokens:
        print("session token collision:", token)
        token = SessionToken(new_token())

    # TODO: use set with NX instead of pregenerating the token, so we can ensure no race condition
    expires_at = int(time()) + ttl_seconds
    db.session_tokens[token] = SessionTokenInfo(
        sid=sid,
        uid=uid,
        REMOVE_exp=expires_at,
    )

    save_db(db)
    return (token, expires_at)

def insert_new_refresh_info(sid: SessionID, ttl_seconds: PositiveInt) -> Tuple[RefreshToken, int]:
    # creates a new session, returning (token, expires_at)
    assert ttl_seconds > 0
    db = load_db()

    token = RefreshToken(new_token())
    while token in db.session_tokens:
        print("refresh token collision:", token)
        token = RefreshToken(new_token())

    # TODO: use set with NX instead of pregenerating the token, so we can ensure no race condition
    expires_at = int(time()) + ttl_seconds
    db.refresh_tokens[token] = RefreshTokenInfo(
        sid=sid,
        REMOVE_exp=expires_at,
    )
    save_db(db)

    return (token, expires_at)

def setup_new_session(uid: str) -> SessionID:
    # allocates a new session, generating the id
    # does not setup the info, as this should be run before we have the curr token
    db = load_db()

    sid = SessionID(str(uuid4()))  # TODO: this should be unique
    db.sessions[sid] = NotSetupSession(uid=uid, setup=False)
    # TODO: also setup with a TTL, so that if we never get to setting it up, it dies

    save_db(db)
    return sid

def update_session(sid: SessionID, info: SessionOIDCInfo, curr_ref: RefreshToken) -> bool:
    # overwrites the session info for a given session id, returning whether it was successful
    # useful when refreshing a session (or a brand new session isnt setup yet)
    # does not work when the sid doesnt exist
    # TODO: can just use XX, also upgrade the TTL to REFRESH TTL + 1 day (for leeway)
    db = load_db()
    if sid not in db.sessions:
        return False

    db.sessions[sid] = SessionInfo(
        uid=db.sessions[sid].uid,
        oidc_info=info,
        curr_ref_token=curr_ref,
        setup=True
    )
    save_db(db)

    return True

def destroy_session(sid: SessionID) -> bool:
    # destroys all refresh tokens, session tokens, and the session 
    # TODO: detach it from the user
    db = load_db()
    if sid not in db.sessions:
        return False

    # delete all the related tokens
    # redis will be secondary indexed on the sid, so this wont be too horrible
    for rt in list(map(lambda e: e[0], filter(lambda e: e[1].sid == sid, db.refresh_tokens.items()))):
        del db.refresh_tokens[rt]
    for st in list(map(lambda e: e[0], filter(lambda e: e[1].sid == sid, db.session_tokens.items()))):
        del db.session_tokens[st]
    del db.sessions[sid]

    save_db(db)
    return True
