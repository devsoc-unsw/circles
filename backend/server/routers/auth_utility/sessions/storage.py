import datetime
from secrets import token_urlsafe
from time import time
from typing import Literal, NewType, Optional, Tuple
from uuid import uuid4
from pydantic import BaseModel, PositiveInt
import pymongo
import pymongo.errors

from server.sessionsdb import sdb
from server.database import sessionsNewCOL, refreshTokensNewCOL
from redis.commands.search.query import Query

# FT.CREATE idx:uid ON HASH PREFIX 1 "stoken:" NOOFFSETS NOHL NOFIELDS NOFREQS STOPWORDS 0 SCHEMA uid TAG CASESENSITIVE
# FT.SEARCH idx:uid "@uid:{z5362383}" NOCONTENT VERBATIM
# FT.SEARCH idx:sid "@sid:{bf362dd3\\-046a\\-49e4\\-8d63\\-fd379f06a40f}" NOCONTENT VERBATIM
# HMGET stoken:Nj-C2n8JYS4imxlVn7WhSX5Pa0uRZ1awa1w_YA-vnN4jMXXqqKVb7HW9rNhfGako sid uid

SessionID = NewType('SessionID', str)  # TODO: make this back into a uuid
SessionToken = NewType('SessionToken', str)
RefreshToken = NewType('RefreshToken', str)

# in redis
class SessionTokenInfo(BaseModel):
    # the object stored against a session token in cache
    sid: SessionID              # id of the session behind this token
    uid: str                    # user who owns the session
    REMOVE_exp: int             # time of expiry, will be replaced with a TTL on the cache

# in mongo
class RefreshTokenInfo(BaseModel):
    # object stored against the refresh token
    sid: SessionID              # id of the session behind this token
    # uid: str                  # user who owns the session
    REMOVE_exp: int             # time of expiry, will be replaced with a TTL on the cache

# in mongo
class SessionOIDCInfo(BaseModel):
    access_token: str           # most recent access token
    raw_id_token: str           # most recent id token string
    refresh_token: str          # most recent refresh token
    validated_id_token: dict    # most recent valid id token object

# in mongo
class NotSetupSession(BaseModel):
    # object stored against the sid when session is not yet setup (brief time between during token generation)
    uid: str                    # for validation and back lookup
    setup: Literal[False]       # ensure that this can get parsed correctly
    REMOVE_exp: int             # time of expiry, will be replaced with a TTL on the cache

# in mongo
class SessionInfo(BaseModel):
    # object stored against the sid
    uid: str                      # for validation and back lookup
    oidc_info: SessionOIDCInfo
    curr_ref_token: RefreshToken  # the most recent refresh token, only one that should be accepted
    setup: Literal[True]          # ensure that this can get parsed correctly
    REMOVE_exp: int             # time of expiry, will be replaced with a TTL on the cache


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

    exp_res = sdb.expireat(key, info.REMOVE_exp)
    assert isinstance(exp_res, bool) and exp_res

    return True

BATCH_SIZE = 100
def redis_delete_all_tokens(sid: SessionID) -> None:
    # FT.SEARCH idx:sid "@sid:{bf362dd3\\-046a\\-49e4\\-8d63\\-fd379f06a40f}" NOCONTENT VERBATIM
    # TODO: functionize this
    # look up all the keys, do in patches of BATCH_SIZE
    while True:
        all_matches = sdb.ft("idx:sid").search(
            # query=Query(f"@sid:{{{sid.hex}}}").no_content().verbatim(),
            query=Query(f"@sid:{{{sid}}}").no_content().verbatim().paging(0, BATCH_SIZE),
        )

        # the type bindings are wrong, the result has the shape
        #  {'attributes': [], 'total_results': 1, 'format': 'STRING', 'results': [{'id': '...', 'values': [...]}], 'warning': []}
        assert isinstance(all_matches, dict)
        if all_matches['total_results'] > 0:
            # delete them all
            # NOTE: potentially this wont work after 1GB worth of keys...
            sdb.delete(*(m["id"] for m in all_matches["results"]))

        if all_matches['total_results'] <= BATCH_SIZE:
            return  # no more to delete

def mongo_get_refresh_token_info(token: RefreshToken) -> Optional[RefreshTokenInfo]:
    info = refreshTokensNewCOL.find_one({ 'token': token })

    if info is None:
        return None

    exp = int(info["expiresAt"].timestamp())
    if exp <= int(time()):
        return None

    return RefreshTokenInfo(
        sid=SessionID(info["sid"]),
        REMOVE_exp=exp,
    )

def mongo_insert_refresh_token_info(token: RefreshToken, info: RefreshTokenInfo) -> bool:
    try:
        refreshTokensNewCOL.insert_one({
            "token": token,
            "sid": info.sid,
            "expiresAt": datetime.datetime.fromtimestamp(info.REMOVE_exp, tz=datetime.timezone.utc),
        })
        return True
    except pymongo.errors.DuplicateKeyError:
        # token already existed
        return False

def mongo_delete_all_refresh_tokens(sid: SessionID) -> None:
    refreshTokensNewCOL.delete_many({ "sid": sid })

def mongo_get_session_info(sid: SessionID) -> Optional[SessionInfo]:
    session = sessionsNewCOL.find_one({ "sid": sid })

    if session is None or "currRefreshToken" not in session:
        # TODO: tag the dicts when we do guest tokens
        return None

    exp = int(session["expiresAt"].timestamp())
    if exp <= int(time()):
        return None

    return SessionInfo(
        uid=session["uid"],
        curr_ref_token=RefreshToken(session["currRefreshToken"]),
        oidc_info=SessionOIDCInfo(
            access_token=session["oidcInfo"]["accessToken"],
            raw_id_token=session["oidcInfo"]["rawIdToken"],
            refresh_token=session["oidcInfo"]["refreshToken"],
            validated_id_token=session["oidcInfo"]["validatedIdToken"],
        ),
        REMOVE_exp=exp,
        setup=True,
    )

def mongo_insert_not_setup_session(sid: SessionID, info: NotSetupSession) -> bool:
    # NOTE: should only be used to reserve the sid,
    # needed since we need a unique session id allocated before setting refresh token info
    # and we need a refresh token to set a full session info
    try:
        sessionsNewCOL.insert_one({
            "sid": sid,
            "uid": info.uid,
            "expiresAt": datetime.datetime.fromtimestamp(info.REMOVE_exp, tz=datetime.timezone.utc),
        })
        return True
    except pymongo.errors.DuplicateKeyError:
        # sid already existed
        return False

def mongo_update_session(sid: SessionID, expires_at: PositiveInt, curr_ref_token: RefreshToken, info: SessionOIDCInfo) -> bool:
    res = sessionsNewCOL.update_one(
        { "sid": sid },
        {
            "$set": {
                "expiresAt": datetime.datetime.fromtimestamp(expires_at, tz=datetime.timezone.utc), 
                "currRefreshToken": curr_ref_token,
                "oidcInfo": {
                    "accessToken": info.access_token,
                    "rawIdToken": info.raw_id_token,
                    "refreshToken": info.refresh_token,
                    "validatedIdToken": info.validated_id_token,
                }
            },
        },
        upsert=False,
    )

    return res.modified_count == 1

def mongo_delete_all_sessions(sid: SessionID) -> bool:
    res = sessionsNewCOL.delete_many({ "sid": sid })
    return res.deleted_count > 0 


# db interface function
# WARNING: these do not do any validation (other than ensuring the properties expected)
def new_token() -> str:
    return token_urlsafe(48)

def get_session_token_info(token: SessionToken) -> Optional[SessionTokenInfo]:
    info = redis_get_token_info(token)
    return info

def get_refresh_token_info(token: RefreshToken) -> Optional[RefreshTokenInfo]:
    info = mongo_get_refresh_token_info(token)
    return info

def get_session_info(sid: SessionID) -> Optional[SessionInfo]:
    info = mongo_get_session_info(sid)
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
        print("session token collision", token)
        token = SessionToken(new_token())

    return (token, expires_at)

def insert_new_refresh_info(sid: SessionID, ttl_seconds: PositiveInt) -> Tuple[RefreshToken, int]:
    # creates a new session, returning (token, expires_at)
    assert ttl_seconds > 0

    expires_at = int(time()) + ttl_seconds
    info = RefreshTokenInfo(
        sid=sid,
        REMOVE_exp=expires_at,
    )

    token = RefreshToken(new_token())
    while not mongo_insert_refresh_token_info(token, info):
        print("refresh token collision:", token)
        token = RefreshToken(new_token())

    return (token, expires_at)

def setup_new_session(uid: str, ttl_seconds: PositiveInt) -> SessionID:
    # allocates a new session, generating the id
    # does not setup the info, as this should be run before we have the curr token
    # the ttl should be specifically how long this fake session lasts, not the future real session
    assert ttl_seconds > 0

    # TODO: also setup with a TTL, so that if we never get to setting it up, it dies
    expires_at = int(time()) + ttl_seconds
    info = NotSetupSession(
        uid=uid,
        setup=False,
        REMOVE_exp=expires_at,
    )

    # sid = SessionID(uuid4())  # TODO: this should be unique
    sid = SessionID(uuid4().hex)
    while not mongo_insert_not_setup_session(sid, info):
        print("session id collision:", sid)
        sid = SessionID(uuid4().hex)

    return sid

def update_session(sid: SessionID, info: SessionOIDCInfo, curr_ref: RefreshToken, ttl_seconds: PositiveInt) -> bool:
    # overwrites the session info for a given session id, returning whether it was successful
    # useful when refreshing a session (or a brand new session isnt setup yet)
    # does not work when the sid doesnt exist
    assert ttl_seconds > 0
    return mongo_update_session(sid, int(time()) + ttl_seconds, curr_ref, info)

def destroy_session(sid: SessionID) -> bool:
    # destroys all refresh tokens, session tokens, and the session
    # redis will be secondary indexed on the sid, so this wont be too horrible
    redis_delete_all_tokens(sid)
    mongo_delete_all_refresh_tokens(sid)
    return mongo_delete_all_sessions(sid)
