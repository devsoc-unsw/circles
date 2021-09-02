import sys
from fastapi import FastAPI
from server.routers import specialisations
from server.routers import programs
from server.routers import courses
from server.routers import api
from bson.json_util import dumps

app = FastAPI()

app.include_router(specialisations.router)
app.include_router(programs.router)
app.include_router(courses.router)
app.include_router(api.router)

@app.get('/')
async def index():
    return "At index inside server.py"