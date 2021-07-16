import sys
from fastapi import FastAPI
from pymongo import MongoClient
from server.routers import specialisations
from bson.json_util import dumps

client = MongoClient("mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false")

db = client["Main"]
specialisationsCOL = db["Specialisations"]

app = FastAPI()

# app.include_router(programs.router)
app.include_router(specialisations.router)
# app.include_router(courses.router)

@app.get('/')
async def index():
    # Gets the specialisation. TEST
    spn = specialisationsCOL.find_one({
        "name": "Computer Science"
    })
    print(spn)
    return {"name": spn["name"]}