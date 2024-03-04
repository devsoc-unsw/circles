from typing import Tuple

from .storage import RefreshToken, SessionID, SessionOIDCInfo, SessionToken, destroy_session, get_refresh_token_info, get_session_info, get_session_token_info, insert_new_refresh_info, insert_new_session_token_info, setup_new_session, update_session
from .errors import SessionExpiredRefreshToken, SessionExpiredToken, SessionOldRefreshToken

SESSION_TOKEN_LIFETIME = 60 * 15            # 15 minutes
REFRESH_TOKEN_LIFETIME = 60 * 60 * 24 * 30  # 30 days

def get_token_info(session_token: SessionToken) -> Tuple[str, SessionID]:
    info = get_session_token_info(session_token)
    if info is None:
        raise SessionExpiredToken(session_token)

    return (info.uid, info.sid)

def get_oidc_info(refresh_token: RefreshToken) -> Tuple[SessionID, str, SessionOIDCInfo]:
    # useful to check oidc status before refreshing the session
    ref_info = get_refresh_token_info(refresh_token)
    if ref_info is None:
        raise SessionExpiredRefreshToken(refresh_token)

    sid = ref_info.sid
    session_info = get_session_info(sid)
    assert session_info is not None

    if session_info.curr_ref_token != refresh_token:
        # replay attack, destroy entire session
        assert destroy_session(sid)
        raise SessionOldRefreshToken(refresh_token, session_info.oidc_info.refresh_token)

    return (sid, session_info.uid, session_info.oidc_info)

def new_login_session(uid: str, oidc_info: SessionOIDCInfo) -> Tuple[SessionToken, int, RefreshToken, int]:
    # creates a new login session for this user and oidc pair, returning the tokens and expiry
    # this oidc info should only be used for ONE circles session,
    # and is used to keep track of whether the oidc session is still intact
    # assumes the OIDC info is valid, otherwise the session will just collapse next refresh

    # if we get a faulty oidc token triple, then the session will just collapse next time we try
    sid = setup_new_session(uid)
    refresh_token, refresh_expiry = insert_new_refresh_info(sid, REFRESH_TOKEN_LIFETIME)
    session_token, session_expiry = insert_new_session_token_info(sid, uid, SESSION_TOKEN_LIFETIME)

    # bind the tokens to the session and return
    assert update_session(sid, oidc_info, refresh_token)
    return (session_token, session_expiry, refresh_token, refresh_expiry)

def new_token_pair(sid: SessionID, new_oidc_info: SessionOIDCInfo) -> Tuple[SessionToken, int, RefreshToken, int]:
    # generates a new token pair given an existing session
    # again, assumes oidc info is valid, otherwise it will collapse
    # TODO: do we want to make sure the sid still attached to uid?
    session_info = get_session_info(sid)
    assert session_info is not None  # TODO: might happen if they log out before this and after an sid is gotten
    uid = session_info.uid

    # all is good, generate new pair, bind tokens and return
    refresh_token, refresh_expiry = insert_new_refresh_info(sid, REFRESH_TOKEN_LIFETIME)
    session_token, session_expiry = insert_new_session_token_info(sid, uid, SESSION_TOKEN_LIFETIME)
    assert update_session(sid, new_oidc_info, refresh_token)
    return (session_token, session_expiry, refresh_token, refresh_expiry)

def logout_session(sid: SessionID) -> bool:
    # TODO: check i need to do anything else???
    return destroy_session(sid)
