# pylint: disable=wrong-import-position
import os
from typing import cast

import requests
from dotenv import load_dotenv

load_dotenv("../env/backend.env")  # must be before the connection imports as they require the env
# Host-based runs (CI) talk to the docker-exposed ports on localhost. Set
# CIRCLES_TEST_USE_ENV_HOSTS=1 to keep the hostnames already in the environment
# instead (e.g. when running the suite from inside the docker network).
if os.environ.get("CIRCLES_TEST_USE_ENV_HOSTS") != "1":
    os.environ["SESSIONSDB_SERVICE_HOSTNAME"] = "localhost"
    os.environ["MONGODB_SERVICE_HOSTNAME"] = "localhost"

from server.db.mongo.setup import setup_user_related_collections
from server.db.redis.setup import setup_redis_sessionsdb




def clear():
    """drop users in database. Used before every test is run."""
    setup_user_related_collections(drop=True)
    setup_redis_sessionsdb()

def get_token():
    return requests.post('http://127.0.0.1:8000/dev/guest_login', timeout=5000).json()["session_token"]

def get_token_headers(token: str):
    return {"Authorization": f"Bearer {token}"}


# ---- Direct-injection helpers (for the "popular electives" feature) --------
# These build schema-valid "setup" user documents and insert them straight into
# Mongo, skipping the HTTP /user/import flow. This gives a test exact control
# over the user population, so expected popularity percentages are deterministic.
from server.db.mongo.conn import usersCOL  # imported here: env hostnames are set above


def make_setup_user(uid: str, program_code: str, specs: list[str], taken_codes: list[str]) -> dict:
    """
    Return a minimal, schema-valid "setup" user document.

    Only the fields the users-collection validator requires are filled in.
    `taken_codes` become entries in the `courses` map (mark left as None, i.e.
    "chosen but ungraded") - membership in `courses` is what the popularity
    aggregation counts.
    """
    return {
        "uid": uid,
        "setup": True,
        "guest": True,
        "degree": {"programCode": program_code, "specs": list(specs)},
        "courses": {
            code: {"code": code, "mark": None, "uoc": 6, "ignoreFromProgression": False}
            for code in taken_codes
        },
        "planner": {
            "unplanned": list(taken_codes),
            "startYear": 2024,
            "isSummerEnabled": False,
            "years": [{"T0": [], "T1": [], "T2": [], "T3": []}],
            "lockedTerms": {},
        },
        "settings": {"showMarks": False, "hiddenYears": []},
    }


def insert_setup_users(users: list[dict]) -> None:
    """Insert pre-built user documents directly into the Mongo users collection."""
    if users:
        usersCOL.insert_many(cast(list, users))
