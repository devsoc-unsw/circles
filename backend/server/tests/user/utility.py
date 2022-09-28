import os
from dotenv import load_dotenv
load_dotenv("../env/backend.env")

os.environ["MONGODB_SERVICE_HOSTNAME"] = "localhost"

from server.database import usersDB, create_dynamic_db

def clear():
    """drop users in database. Used before every test is run."""
    usersDB.drop_collection('users')
    usersDB.drop_collection('tokens')
    create_dynamic_db()
