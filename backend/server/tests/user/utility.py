import os

from dotenv import load_dotenv

load_dotenv("../env/backend.env")
os.environ["MONGODB_SERVICE_HOSTNAME"] = "localhost"

from server.db.mongo.setup import create_dynamic_db


def clear():
    """drop users in database. Used before every test is run."""
    create_dynamic_db(drop_old=True)
