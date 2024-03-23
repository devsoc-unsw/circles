import json
from secrets import token_urlsafe
from time import time
from typing import Dict, Literal, NewType, Optional, Tuple, Union
from uuid import uuid4
from pydantic import BaseModel, PositiveInt

from server.sessionsdb import sdb
from redis.commands.search.query import Query

# FT.CREATE idx:uid ON HASH PREFIX 1 "stoken:" NOOFFSETS NOHL NOFIELDS NOFREQS STOPWORDS 0 SCHEMA uid TAG CASESENSITIVE
# FT.SEARCH idx:uid "@uid:{z5362383}" NOCONTENT VERBATIM
# FT.SEARCH idx:sid "@sid:{bf362dd3\\-046a\\-49e4\\-8d63\\-fd379f06a40f}" NOCONTENT VERBATIM
# HMGET stoken:Nj-C2n8JYS4imxlVn7WhSX5Pa0uRZ1awa1w_YA-vnN4jMXXqqKVb7HW9rNhfGako sid uid

SessionID = NewType('SessionID', str)  # TODO: make this back into a uuid
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
    refresh_tokens: Dict[RefreshToken, RefreshTokenInfo]
    sessions: Dict[SessionID, Union[NotSetupSession, SessionInfo]]

# TODO: DUMMY JSON LOADING
# MOVE TO A SPLIT BETWEEN REDIS AND MONGO
def load_db() -> Database:
    try:
        with open("sessions.json", "r", encoding="utf8") as f:
            res: dict = json.load(f)
            db = Database.parse_obj(res)
            return db
    except Exception:
        return Database(
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
            refresh_tokens={},
            sessions={},
        ).dict(), f, indent=2)
        print("Cleared:")


def form_key(token: SessionToken) -> str:
    return f"token:{token}"

def redis_get_token_info(token: SessionToken) -> Optional[SessionTokenInfo]:
    res = sdb.hmget(form_key(token), ["sid", "uid", "exp"])
    assert isinstance(res, list) and len(res) == 3

    sid, uid, exp = res[0], res[1], res[2]
    if sid is None or uid is None or exp is None:
        return None
    if int(exp) <= int(time()):
        return None

    return SessionTokenInfo(
        # sid=SessionID(UUID(hex=sid)),
        sid=sid,
        uid=uid,
        REMOVE_exp=int(exp)
    )

def redis_delete_token(token: SessionToken) -> bool:
    res = sdb.delete(token)
    assert isinstance(res, int)
    return res == 1

def redis_set_token_nx(token: SessionToken, info: SessionTokenInfo) -> bool:
    # tries and sets the information, returning whether it was successful
    # if can set first one, assume can set them all
    # TODO: figure out how to make this a transaction and/or redis func so it dont get deleted midway
    key = form_key(token)
    exists = sdb.hsetnx(name=key, key="sid", value=info.sid)

    assert isinstance(exists, int)
    if exists == 0:
        return False

    res = sdb.hset(name=key, mapping={
        "uid": info.uid,
        "exp": info.REMOVE_exp,
    })
    assert isinstance(res, int) and res == 2
    return True

def redis_delete_all_tokens(sid: SessionID) -> None:
    # FT.SEARCH idx:sid "@sid:{bf362dd3\\-046a\\-49e4\\-8d63\\-fd379f06a40f}" NOCONTENT VERBATIM
    # TODO: functionize this
    # look up all the keys
    all_matches = sdb.ft("idx:sid").search(
        # query=Query(f"@sid:{{{sid.hex}}}").no_content().verbatim(),
        query=Query(f"@sid:{{{sid}}}").no_content().verbatim(),
    )

    # the type bindings are wrong, the result has the shape
    #  {'attributes': [], 'total_results': 1, 'format': 'STRING', 'results': [{'id': '...', 'values': [...]}], 'warning': []}
    assert isinstance(all_matches, dict)
    if all_matches['total_results'] == 0:
        return

    # delete them all
    # NOTE: potentially this wont work after 1GB worth of keys...
    sdb.delete(*(m["id"] for m in all_matches["results"]))


# db interface function
# WARNING: these do not do any validation (other than ensuring the properties expected)
def new_token() -> str:
    return token_urlsafe(48)

def get_session_token_info(token: SessionToken) -> Optional[SessionTokenInfo]:
    info = redis_get_token_info(token)
    if info is None:
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

    expires_at = int(time()) + ttl_seconds
    info = SessionTokenInfo(
        sid=sid,
        uid=uid,
        REMOVE_exp=expires_at,
    )

    token = SessionToken(new_token())
    while not redis_set_token_nx(token, info):
        print("token collision", token)
        token = SessionToken(new_token())

    return (token, expires_at)

def insert_new_refresh_info(sid: SessionID, ttl_seconds: PositiveInt) -> Tuple[RefreshToken, int]:
    # creates a new session, returning (token, expires_at)
    assert ttl_seconds > 0
    db = load_db()

    token = RefreshToken(new_token())
    while token in db.refresh_tokens:
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

    # sid = SessionID(uuid4())  # TODO: this should be unique
    sid = SessionID(uuid4().hex)
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
    redis_delete_all_tokens(sid)
    for rt in list(map(lambda e: e[0], filter(lambda e: e[1].sid == sid, db.refresh_tokens.items()))):
        del db.refresh_tokens[rt]
    del db.sessions[sid]

    save_db(db)
    return True
