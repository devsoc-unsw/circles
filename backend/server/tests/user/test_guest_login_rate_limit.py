import os
import time
from typing import cast

import redis
import requests
from dotenv import load_dotenv

load_dotenv("../env/backend.env")
os.environ["SESSIONSDB_SERVICE_HOSTNAME"] = "localhost"
os.environ["MONGODB_SERVICE_HOSTNAME"] = "localhost"

from server.db.redis.limiter_conn import limiter_redis_kwargs
from server.db.redis.setup import reset_redis_limiterdb

GUEST_LOGIN_URL = "http://127.0.0.1:8000/auth/guest_login"

RATE_LIMIT_TIMES = 3

def fast_forward_limiter_window():
    """Fast-forward past the rate-limit window without sleeping for its full
    duration.

    The window is enforced by a Redis TTL that fastapi-limiter sets server-side,
    so a Python time-machine (freezegun/time-machine) in this test process can't
    advance it. Expiring the counter keys directly in Redis is the equivalent
    'time machine' here, and doubles as a check that a TTL was actually set.
    """
    limiter_db = redis.Redis(**limiter_redis_kwargs())
    try:
        keys = cast(list, limiter_db.keys("*"))
        assert keys, "expected limiter counters to exist before the window expires"
        for key in keys:
            assert cast(int, limiter_db.pttl(key)) > 0, "limiter counter should carry a TTL"
            limiter_db.pexpire(key, 1)  # expire ~immediately
    finally:
        limiter_db.close()
    time.sleep(0.05)  # let redis apply the expiry

def test_guest_login_allows_requests_up_to_limit():
    reset_redis_limiterdb()

    for _ in range(RATE_LIMIT_TIMES):
        res = requests.post(GUEST_LOGIN_URL, timeout=5000)
        assert res.status_code == 200
        assert "session_token" in res.json()

def test_guest_login_blocks_requests_over_limit():
    reset_redis_limiterdb()

    for _ in range(RATE_LIMIT_TIMES):
        assert requests.post(GUEST_LOGIN_URL, timeout=5000).status_code == 200

    blocked = requests.post(GUEST_LOGIN_URL, timeout=5000)
    assert blocked.status_code == 429
    assert "session_token" not in blocked.json()

def test_guest_login_allows_requests_again_after_window_expires():
    reset_redis_limiterdb()

    for _ in range(RATE_LIMIT_TIMES):
        requests.post(GUEST_LOGIN_URL, timeout=5000)
    assert requests.post(GUEST_LOGIN_URL, timeout=5000).status_code == 429

    fast_forward_limiter_window()

    res = requests.post(GUEST_LOGIN_URL, timeout=5000)
    assert res.status_code == 200
    assert "session_token" in res.json()