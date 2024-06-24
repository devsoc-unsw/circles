import os
from dotenv import load_dotenv


load_dotenv("./env/backend.env")

# TODO-OLLI: what if someone doesnt have these and wants to still dev?????
CLIENT_ID = os.getenv("AUTH_CSE_CLIENT_ID")
CLIENT_SECRET = os.getenv("AUTH_CSE_CLIENT_SECRET")

if CLIENT_ID is None or CLIENT_SECRET is None:
    raise ValueError("Environment variables 'AUTH_CSE_CLIENT_ID' and 'AUTH_CSE_CLIENT_SECRET' are missing")

OPENID_CONFIG_URL = "https://id.csesoc.unsw.edu.au/.well-known/openid-configuration"
_REDIRECT_BASE_URI = os.getenv("AUTH_REDIRECT_BASE_URI", "http://localhost:3000")
REDIRECT_URI = f"{_REDIRECT_BASE_URI}/login/success/csesoc"
