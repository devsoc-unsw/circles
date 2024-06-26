import os

from dotenv import load_dotenv

load_dotenv("../env/backend.env")
os.environ["MONGODB_SERVICE_HOSTNAME"] = "localhost"

from server.db.mongo.setup import setup_user_related_collections
from server.db.redis.setup import setup_redis_sessionsdb


def clear():
    """drop users in database. Used before every test is run."""
    setup_user_related_collections(drop=True)
    setup_redis_sessionsdb()
