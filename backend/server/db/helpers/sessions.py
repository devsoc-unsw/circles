import datetime
from time import time
from typing import Optional, Union
from pydantic import PositiveInt
import pymongo
import pymongo.errors

from server.db.mongo.conn import sessionsNewCOL

from .models import GuestSessionInfoModel, NotSetupSessionModel, RefreshToken, SessionID, SessionInfoModel, SessionOIDCInfoModel

def get_session_info(sid: SessionID) -> Optional[Union[SessionInfoModel, GuestSessionInfoModel]]:
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

def insert_not_setup_session(sid: SessionID, info: NotSetupSessionModel) -> bool:
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

def update_csesoc_session(sid: SessionID, expires_at: PositiveInt, curr_ref_token: RefreshToken, info: SessionOIDCInfoModel) -> bool:
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

def update_guest_session(sid: SessionID, expires_at: PositiveInt, curr_ref_token: RefreshToken) -> bool:
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

def delete_all_sessions(sid: SessionID) -> bool:
    res = sessionsNewCOL.delete_many({ "sid": sid })
    return res.deleted_count > 0