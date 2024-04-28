import datetime
from time import time
from typing import Literal, NewType, Optional, Union
from uuid import UUID
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

SessionID = NewType('SessionID', UUID)
SessionToken = NewType('SessionToken', str)
RefreshToken = NewType('RefreshToken', str)

# in redis
class SessionTokenInfoModel(BaseModel):
    # the object stored against a session token in cache
    sid: SessionID              # id of the session behind this token
    uid: str                    # user who owns the session
    exp: int                    # time of expiry, will be replaced with a TTL on the cache

# in mongo
class RefreshTokenInfoModel(BaseModel):
    # object stored against the refresh token
    sid: SessionID              # id of the session behind this token
    expires_at: int             # time of expiry, will be replaced with a TTL on the cache

# in mongo
class SessionOIDCInfoModel(BaseModel):
    access_token: str           # most recent access token
    raw_id_token: str           # most recent id token string
    refresh_token: str          # most recent refresh token
    validated_id_token: dict    # most recent valid id token object

# in mongo
class NotSetupSessionModel(BaseModel):
    # object stored against the sid when session is not yet setup (brief time between during token generation)
    uid: str                    # for validation and back lookup
    type: Literal['notsetup']   # ensure that this can get parsed correctly
    expires_at: int             # time of expiry, will be replaced with a TTL on the cache

# in mongo
class SessionInfoModel(BaseModel):
    # object stored against the sid
    uid: str                      # for validation and back lookup
    oidc_info: SessionOIDCInfoModel
    curr_ref_token: RefreshToken  # the most recent refresh token, only one that should be accepted
    type: Literal['csesoc']       # ensure that this can get parsed correctly
    expires_at: int               # time of expiry, will be replaced with a TTL on the cache

# in mongo
class GuestSessionInfoModel(BaseModel):
    # object stored against the sid
    uid: str                      # for validation and back lookup
    curr_ref_token: RefreshToken  # the most recent refresh token, only one that should be accepted
    type: Literal['guest']        # ensure that this can get parsed correctly
    expires_at: int               # time of expiry, will be replaced with a TTL on the cache

def form_key(token: SessionToken) -> str:
    return f"token:{token}"

def redis_get_token_info(token: SessionToken) -> Optional[SessionTokenInfoModel]:
    res = sdb.hmget(form_key(token), ["sid", "uid", "exp"])
    assert isinstance(res, list) and len(res) == 3

    sid, uid, exp = res[0], res[1], res[2]
    if sid is None or uid is None or exp is None:
        return None
    if int(exp) <= int(time()):
        return None

    return SessionTokenInfoModel(
        sid=SessionID(UUID(hex=sid)),
        uid=uid,
        exp=int(exp)
    )

def redis_set_token_nx(token: SessionToken, info: SessionTokenInfoModel) -> bool:
    # tries and sets the information, returning whether it was successful
    # if can set first one, assume can set them all
    # TODO: figure out how to make this a transaction and/or redis func so it dont get deleted midway
    key = form_key(token)
    exists = sdb.hsetnx(name=key, key="sid", value=info.sid.hex)

    assert isinstance(exists, int)
    if exists == 0:
        return False

    res = sdb.hset(name=key, mapping={
        "uid": info.uid,
        "exp": info.exp,
    })
    assert isinstance(res, int) and res == 2

    exp_res = sdb.expireat(key, info.exp)
    assert isinstance(exp_res, bool) and exp_res

    return True

BATCH_SIZE = 100
def redis_delete_all_tokens(sid: SessionID) -> None:
    # FT.SEARCH idx:sid "@sid:{bf362dd3\\-046a\\-49e4\\-8d63\\-fd379f06a40f}" NOCONTENT VERBATIM
    # TODO: functionize this
    # look up all the keys, do in patches of BATCH_SIZE
    while True:
        all_matches = sdb.ft("idx:sid").search(
            query=Query(f"@sid:{{{sid.hex}}}").no_content().verbatim().paging(0, BATCH_SIZE),
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

def mongo_get_refresh_token_info(token: RefreshToken) -> Optional[RefreshTokenInfoModel]:
    info = refreshTokensNewCOL.find_one({ 'token': token })

    if info is None:
        return None

    exp = int(info["expiresAt"].timestamp())
    if exp <= int(time()):
        return None

    return RefreshTokenInfoModel(
        sid=SessionID(info["sid"]),
        expires_at=exp,
    )

def mongo_insert_refresh_token_info(token: RefreshToken, info: RefreshTokenInfoModel) -> bool:
    try:
        refreshTokensNewCOL.insert_one({
            "token": token,
            "sid": info.sid,
            "expiresAt": datetime.datetime.fromtimestamp(info.expires_at, tz=datetime.timezone.utc),
        })
        return True
    except pymongo.errors.DuplicateKeyError:
        # token already existed
        return False

def mongo_delete_all_refresh_tokens(sid: SessionID) -> None:
    refreshTokensNewCOL.delete_many({ "sid": sid })

def mongo_get_session_info(sid: SessionID) -> Optional[Union[SessionInfoModel, GuestSessionInfoModel]]:
    session = sessionsNewCOL.find_one({ "sid": sid })

    if session is None or session["type"] == "notsetup":
        # TODO: deal with guest sessions here
        return None

    exp = int(session["expiresAt"].timestamp())
    if exp <= int(time()):
        return None

    if session["type"] == "guest":
        return GuestSessionInfoModel(
            uid=session["uid"],
            curr_ref_token=RefreshToken(session["currRefreshToken"]),
            expires_at=exp,
            type="guest",
        )

    assert session["type"] == "csesoc"
    return SessionInfoModel(
        uid=session["uid"],
        curr_ref_token=RefreshToken(session["currRefreshToken"]),
        oidc_info=SessionOIDCInfoModel(
            access_token=session["oidcInfo"]["accessToken"],
            raw_id_token=session["oidcInfo"]["rawIdToken"],
            refresh_token=session["oidcInfo"]["refreshToken"],
            validated_id_token=session["oidcInfo"]["validatedIdToken"],
        ),
        expires_at=exp,
        type="csesoc",
    )

def mongo_insert_not_setup_session(sid: SessionID, info: NotSetupSessionModel) -> bool:
    # NOTE: should only be used to reserve the sid,
    # needed since we need a unique session id allocated before setting refresh token info
    # and we need a refresh token to set a full session info
    try:
        sessionsNewCOL.insert_one({
            "sid": sid,
            "uid": info.uid,
            "expiresAt": datetime.datetime.fromtimestamp(info.expires_at, tz=datetime.timezone.utc),
            "type": "notsetup",
        })
        return True
    except pymongo.errors.DuplicateKeyError:
        # sid already existed
        return False

def mongo_update_csesoc_session(sid: SessionID, expires_at: PositiveInt, curr_ref_token: RefreshToken, info: SessionOIDCInfoModel) -> bool:
    res = sessionsNewCOL.update_one(
        { "sid": sid, "type": { "$in": [ "csesoc", "notsetup" ] } },
        {
            "$set": {
                "expiresAt": datetime.datetime.fromtimestamp(expires_at, tz=datetime.timezone.utc), 
                "currRefreshToken": curr_ref_token,
                "type": "csesoc",
                "oidcInfo": {
                    "accessToken": info.access_token,
                    "rawIdToken": info.raw_id_token,
                    "refreshToken": info.refresh_token,
                    "validatedIdToken": info.validated_id_token,
                },
            },
        },
        upsert=False,
        hint="sidIndex",
    )

    return res.modified_count == 1

def mongo_update_guest_session(sid: SessionID, expires_at: PositiveInt, curr_ref_token: RefreshToken) -> bool:
    res = sessionsNewCOL.update_one(
        { "sid": sid, "type": { "$in": [ "guest", "notsetup" ] } },
        {
            "$set": {
                "expiresAt": datetime.datetime.fromtimestamp(expires_at, tz=datetime.timezone.utc), 
                "currRefreshToken": curr_ref_token,
                "type": "guest",
            },
        },
        upsert=False,
        hint="sidIndex",
    )

    return res.modified_count == 1

def mongo_delete_all_sessions(sid: SessionID) -> bool:
    res = sessionsNewCOL.delete_many({ "sid": sid })
    return res.deleted_count > 0
