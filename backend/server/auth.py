from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from server.server import app

example_users = []
oauth_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/token")
async def generate_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """ when token accessed -> return bearer token """
    print(form_data)
    return {
        "access_token": form_data.user_name,
        "token_type": "bearer"
    }

@app.post("/users/add")
async def add_(token: str = Depends(oauth_scheme)):
    """ Test add """
    pass
