import datetime
from time import time
from typing import Optional

import pymongo
import pymongo.errors

from server.database import refreshTokensNewCOL

from .models import RefreshToken, RefreshTokenInfoModel, SessionID

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

