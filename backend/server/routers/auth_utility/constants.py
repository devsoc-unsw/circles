import os
from dotenv import load_dotenv


load_dotenv("./env/backend.env")
JWT_SECRET = os.getenv("AUTH_JWT_SECRET") or exit(1)
CLIENT_ID = os.getenv("AUTH_CSE_CLIENT_ID") or exit(1)
CLIENT_SECRET = os.getenv("AUTH_CSE_CLIENT_SECRET") or exit(1)
