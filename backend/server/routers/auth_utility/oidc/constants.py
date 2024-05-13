import os
from dotenv import load_dotenv


load_dotenv("./env/backend.env")
CLIENT_ID = os.getenv("AUTH_CSE_CLIENT_ID")
CLIENT_SECRET = os.getenv("AUTH_CSE_CLIENT_SECRET")

if CLIENT_ID is None or CLIENT_SECRET is None:
    raise ValueError("Environment variables 'AUTH_CSE_CLIENT_ID' and 'AUTH_CSE_CLIENT_SECRET' are missing")
