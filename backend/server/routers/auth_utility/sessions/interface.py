from typing import Tuple

from .storage import RefreshToken, SessionOIDCInfo, SessionToken, SessionTokenInfo, destroy_session, get_refresh_token_info, get_session_info, get_session_token_info, insert_new_refresh_info, insert_new_session_token_info, setup_new_session, update_session
from .errors import SessionExpiredRefreshToken, SessionExpiredToken, SessionOldRefreshToken

SESSION_TOKEN_LIFETIME = 60 * 15            # 15 minutes
REFRESH_TOKEN_LIFETIME = 60 * 60 * 24 * 30  # 30 days

def get_token_info(session_token: SessionToken) -> SessionTokenInfo:
    info = get_session_token_info(session_token)
    if info is None:
        raise SessionExpiredToken(session_token)

    return info

def get_oidc_info(refresh_token: RefreshToken) -> SessionOIDCInfo:
    # useful to check oidc status before refreshing the session
    ref_info = get_refresh_token_info(refresh_token)
    if ref_info is None:
        raise SessionExpiredRefreshToken(refresh_token)

    session_info = get_session_info(ref_info.sid)
    assert session_info is not None

    return session_info.oidc_info

def new_login_session(uid: str, oidc_info: SessionOIDCInfo) -> Tuple[SessionToken, int, RefreshToken]:
    # creates a new login session for this user and oidc pair, returning the tokens and expiry
    # this oidc info should only be used for ONE circles session,
    # and is used to keep track of whether the oidc session is still intact
    # assumes the OIDC info is valid, otherwise the session will just collapse next refresh

    # if we get a faulty oidc token triple, then the session will just collapse next time we try
    sid = setup_new_session()
    refresh_token = insert_new_refresh_info(sid, uid, REFRESH_TOKEN_LIFETIME)
    session_token, session_expiry = insert_new_session_token_info(sid, uid, SESSION_TOKEN_LIFETIME)

    # bind the tokens to the session and return
    assert update_session(sid, oidc_info, refresh_token)
    return (session_token, session_expiry, refresh_token)

def new_token_pair(refresh_token: RefreshToken, new_oidc_info: SessionOIDCInfo) -> Tuple[SessionToken, int, RefreshToken]:
    # generates a new token pair given an existing session
    # again, assumes oidc info is valid, otherwise it will collapse
    # if the refresh token has expired (or does not exist) it will raise an error
    # if the refresh token does exist but is not the most recent one, it will destroy entire session
    # TODO: do we want to make sure the sid still attached to uid?
    refresh_token_info = get_refresh_token_info(refresh_token)
    if refresh_token_info is None:
        raise SessionExpiredRefreshToken(refresh_token)

    sid = refresh_token_info.sid
    uid = refresh_token_info.uid
    session_info = get_session_info(sid)
    assert session_info is not None  # should never happen, we will destroy all refresh tokens when a session expires
    if session_info.curr_ref_token != refresh_token:
        # replay attack, destroy entire session
        assert destroy_session(sid)
        raise SessionOldRefreshToken(refresh_token, session_info.oidc_info.refresh_token)

    # all is good, generate new pair, bind tokens and return
    refresh_token = insert_new_refresh_info(sid, uid, REFRESH_TOKEN_LIFETIME)
    session_token, session_expiry = insert_new_session_token_info(sid, uid, SESSION_TOKEN_LIFETIME)
    assert update_session(sid, new_oidc_info, refresh_token)
    return (session_token, session_expiry, refresh_token)
