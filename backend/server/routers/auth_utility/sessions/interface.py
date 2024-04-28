from secrets import token_urlsafe
from time import time
from typing import Tuple
from uuid import uuid4

from pydantic import PositiveInt

from .storage import NotSetupSession, RefreshToken, RefreshTokenInfo, SessionID, SessionOIDCInfo, SessionToken, SessionTokenInfo, mongo_delete_all_refresh_tokens, mongo_delete_all_sessions, mongo_get_refresh_token_info, mongo_get_session_info, mongo_insert_not_setup_session, mongo_insert_refresh_token_info, mongo_update_csesoc_session, redis_delete_all_tokens, redis_get_token_info, redis_set_token_nx
from .errors import SessionExpiredRefreshToken, SessionExpiredToken, SessionOldRefreshToken

DAY = 60 * 60 * 24
SESSION_TOKEN_LIFETIME = 60 * 15   # 15 minutes
REFRESH_TOKEN_LIFETIME = DAY * 30  # 30 days
SESSION_LIFETIME = REFRESH_TOKEN_LIFETIME + DAY

# db interface function
# WARNING: these do not do any validation (other than ensuring the properties expected)
def _new_token() -> str:
    return token_urlsafe(48)

def _insert_new_session_token_info(sid: SessionID, uid: str, ttl_seconds: PositiveInt) -> Tuple[SessionToken, int]:
    # creates a new session, returning (token, expires_at)
    assert ttl_seconds > 0

    expires_at = int(time()) + ttl_seconds
    info = SessionTokenInfo(
        sid=sid,
        uid=uid,
        REMOVE_exp=expires_at,
    )

    token = SessionToken(_new_token())
    while not redis_set_token_nx(token, info):
        print("session token collision", token)
        token = SessionToken(_new_token())

    return (token, expires_at)

def _insert_new_refresh_info(sid: SessionID, ttl_seconds: PositiveInt) -> Tuple[RefreshToken, int]:
    # creates a new session, returning (token, expires_at)
    assert ttl_seconds > 0

    expires_at = int(time()) + ttl_seconds
    info = RefreshTokenInfo(
        sid=sid,
        REMOVE_exp=expires_at,
    )

    token = RefreshToken(_new_token())
    while not mongo_insert_refresh_token_info(token, info):
        print("refresh token collision:", token)
        token = RefreshToken(_new_token())

    return (token, expires_at)

def _setup_new_session(uid: str, ttl_seconds: PositiveInt) -> SessionID:
    # allocates a new session, generating the id
    # does not setup the info, as this should be run before we have the curr token
    # the ttl should be specifically how long this fake session lasts, not the future real session
    assert ttl_seconds > 0

    expires_at = int(time()) + ttl_seconds
    info = NotSetupSession(
        uid=uid,
        setup=False,
        REMOVE_exp=expires_at,
    )

    sid = SessionID(uuid4())
    while not mongo_insert_not_setup_session(sid, info):
        print("session id collision:", sid)
        sid = SessionID(uuid4())

    return sid

def _update_session(sid: SessionID, info: SessionOIDCInfo, curr_ref: RefreshToken, ttl_seconds: PositiveInt) -> bool:
    # overwrites the session info for a given session id, returning whether it was successful
    # useful when refreshing a session (or a brand new session isnt setup yet)
    # does not work when the sid doesnt exist
    assert ttl_seconds > 0
    return mongo_update_csesoc_session(sid, int(time()) + ttl_seconds, curr_ref, info)

def _destroy_session(sid: SessionID) -> bool:
    # destroys all refresh tokens, session tokens, and the session
    # redis will be secondary indexed on the sid, so this wont be too horrible
    redis_delete_all_tokens(sid)
    mongo_delete_all_refresh_tokens(sid)
    return mongo_delete_all_sessions(sid)


def get_token_info(session_token: SessionToken) -> Tuple[str, SessionID]:
    info = redis_get_token_info(session_token)
    if info is None:
        raise SessionExpiredToken(session_token)

    return (info.uid, info.sid)

def get_oidc_info(refresh_token: RefreshToken) -> Tuple[SessionID, str, SessionOIDCInfo]:
    # useful to check oidc status before refreshing the session
    ref_info = mongo_get_refresh_token_info(refresh_token)
    if ref_info is None:
        raise SessionExpiredRefreshToken(refresh_token)

    sid = ref_info.sid
    session_info = mongo_get_session_info(sid)
    assert session_info is not None

    if session_info.curr_ref_token != refresh_token:
        # replay attack, destroy entire session
        assert _destroy_session(sid)
        raise SessionOldRefreshToken(refresh_token, session_info.oidc_info.refresh_token)

    return (sid, session_info.uid, session_info.oidc_info)

def get_oidc_info_from_session_token(session_token: SessionToken) -> Tuple[SessionID, SessionOIDCInfo]:
    info = redis_get_token_info(session_token)
    if info is None:
        raise SessionExpiredToken(session_token)

    session_info = mongo_get_session_info(info.sid)
    # TODO: assertion error here if removed from mongo but not redis...
    assert session_info is not None

    return (info.sid, session_info.oidc_info)

def new_login_session(uid: str, oidc_info: SessionOIDCInfo) -> Tuple[SessionToken, int, RefreshToken, int]:
    # creates a new login session for this user and oidc pair, returning the tokens and expiry
    # this oidc info should only be used for ONE circles session,
    # and is used to keep track of whether the oidc session is still intact
    # assumes the OIDC info is valid, otherwise the session will just collapse next refresh

    # if we get a faulty oidc token triple, then the session will just collapse next time we try
    sid = _setup_new_session(uid, 120)  # only make it last very briefly
    refresh_token, refresh_expiry = _insert_new_refresh_info(sid, REFRESH_TOKEN_LIFETIME)
    session_token, session_expiry = _insert_new_session_token_info(sid, uid, SESSION_TOKEN_LIFETIME)

    # bind the tokens to the session and return, with a session ttl of abit over refresh token for autocleanup
    assert _update_session(sid, oidc_info, refresh_token, SESSION_LIFETIME)
    return (session_token, session_expiry, refresh_token, refresh_expiry)

def new_token_pair(sid: SessionID, new_oidc_info: SessionOIDCInfo) -> Tuple[SessionToken, int, RefreshToken, int]:
    # generates a new token pair given an existing session
    # again, assumes oidc info is valid, otherwise it will collapse
    # TODO: do we want to make sure the sid still attached to uid?
    session_info = mongo_get_session_info(sid)
    assert session_info is not None  # TODO: might happen if they log out before this and after an sid is gotten
    uid = session_info.uid

    # all is good, generate new pair, bind tokens and return
    refresh_token, refresh_expiry = _insert_new_refresh_info(sid, REFRESH_TOKEN_LIFETIME)
    session_token, session_expiry = _insert_new_session_token_info(sid, uid, SESSION_TOKEN_LIFETIME)
    assert _update_session(sid, new_oidc_info, refresh_token, SESSION_LIFETIME)
    return (session_token, session_expiry, refresh_token, refresh_expiry)

def logout_session(sid: SessionID) -> bool:
    # TODO: check i need to do anything else???
    return _destroy_session(sid)
