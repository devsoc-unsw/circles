import os

import requests
from dotenv import load_dotenv

from server.db.mongo.setup import setup_user_related_collections
from server.db.redis.setup import setup_redis_sessionsdb

load_dotenv("../env/backend.env")
os.environ["MONGODB_SERVICE_HOSTNAME"] = "localhost"
os.environ["SESSIONSDB_SERVICE_HOSTNAME"] = "localhost"



def clear():
    """drop users in database. Used before every test is run."""
    setup_user_related_collections(drop=True)
    setup_redis_sessionsdb()

def get_token():
    return requests.post('http://127.0.0.1:8000/auth/guest_login').json()["session_token"]

def get_token_headers(token: str):
    return {"Authorization": f"Bearer {token}"}
