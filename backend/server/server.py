import sys
from fastapi import FastAPI
from server.routers import specialisations

app = FastAPI()

# app.include_router(programs.router)
app.include_router(specialisations.router)
# app.include_router(courses.router)

@app.get('/')
def index():
    return "Index of server"