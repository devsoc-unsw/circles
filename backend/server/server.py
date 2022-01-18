from fastapi import FastAPI
from server.routers import specialisations
from server.routers import programs
from server.routers import courses
from server.routers import api
from server.routers import planner
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://host.docker.internal",
    "http://host.docker.internal:8080",
    "http://host.docker.internal:8000",
    "http://host.docker.internal:3000",
    "http://host.docker.internal:3001",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://frontend",
    "http://frontend:8080",
    "http://frontend:8000",
    "http://frontend:3000",
    "http://frontend:3001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(specialisations.router)
app.include_router(programs.router)
app.include_router(planner.router)
app.include_router(courses.router)
app.include_router(api.router)

@app.get('/')
async def index():
    return "At index inside server.py"