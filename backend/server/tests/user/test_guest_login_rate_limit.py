import os
import time

import requests
from dotenv import load_dotenv

load_dotenv("../env/backend.env")
os.environ["SESSIONSDB_SERVICE_HOSTNAME"] = "localhost"
os.environ["MONGODB_SERVICE_HOSTNAME"] = "localhost"

from server.db.redis.setup import reset_redis_limiterdb

GUEST_LOGIN_URL = "http://127.0.0.1:8000/dev/guest_login"

RATE_LIMIT_TIMES = 3
RATE_LIMIT_SECONDS = 60

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

    time.sleep(RATE_LIMIT_SECONDS + 2)

    res = requests.post(GUEST_LOGIN_URL, timeout=5000)
    assert res.status_code == 200
    assert "session_token" in res.json()