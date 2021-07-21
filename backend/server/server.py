import sys
from fastapi import FastAPI
from server.routers import specialisations
from bson.json_util import dumps

app = FastAPI()

app.include_router(specialisations.router)

@app.get('/')
async def index():
    return "At index inside server.py"