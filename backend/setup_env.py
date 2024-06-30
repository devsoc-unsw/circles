"""
Script built on dotenv to set up the required environment variables

Required functionality:

for env variables such as mongo password, where it lives in both backend env and mongodb env, you only need to input it in once
if the files already exist, when the user is prompted to enter, suggests them to use the old one instead
this is because we dont want to accidently overwrite the files and be painful to find the auth env vars again
certain fields allow for empty input, where it will auto generate
also can specify as keyword command line arguments for easy use in the ci file
otherwise if no CL argument or existing, will prompt user to enter each
Main usecases:

in ci, replaces all the echos
must leave files that are compatible with ci and docker compose env
python3 setup_env.py --mongodb-pass="ollipass
"""

from os import write
from pathlib import Path
from typing import Literal, Optional

import dotenv

# Assumes this file is in `/backend/setup_env.py`
PROJECT_ROOT: Path = Path(__file__).parent.parent
ENV_DIR: Path = PROJECT_ROOT.joinpath('env')

BACKEND_ENV: Path = ENV_DIR.joinpath("backend.env")
FRONTEND_ENV: Path = ENV_DIR.joinpath("frontend.env")
MONGO_ENV: Path = ENV_DIR.joinpath('mongodb.env')
SESSIONSDB_ENV: Path = ENV_DIR.joinpath('sessionsdb.env')

"""
- name of the variable
- files to insert it in
- file to read it from
- default value (if any)
"""

"""
Creating Environment Variables
MongoDB and the backend require a few environment variables to get started. In the root folder, create a folder called env and add three files: backend.env, mongodb.env and frontend.env.

In backend.env, add the environment variables:

MONGODB_USERNAME=name
MONGODB_PASSWORD=name
MONGODB_SERVICE_HOSTNAME=mongodb
FOR PRODUCTION, also add:

FORWARDED_ALLOW_IPS=*
In mongodb.env, add:

MONGO_INITDB_ROOT_USERNAME=name
MONGO_INITDB_ROOT_PASSWORD=name
In frontend.env, add:

VITE_BACKEND_API_BASE_URL=http://localhost:8000/
NOTE: The VITE_BACKEND_API_BASE_URL environment variable is the base url endpoint that the backend is running on. If the environment variable is not specified, the react application will default to using http://localhost:8000/ as the base url when calling the API endpoint.

You can use any random username and password. The username and password in backend.env must match the values in mongodb.env. The env folder has been added to .giti
"""

def prompt_variable(name: str, default_value: Optional[str] = None) -> str:
    if default_value is not None:
        print(f"Enter value for {name} (press [enter] to accept default '{default_value}')")
        entered_value = input().strip()
        return entered_value or default_value
    else:
        print(f"Enter value for {name}")
        return input().strip()

def in_production() -> bool:
    # TODO: get from the args

    return False

def write_env_file(env: dict[str, str], file: Path):
    print(f"Attempting to write env to {file}")
    content = "\n".join(
        f"{key}={value}\n"
        for key, value in env.items()
    )
    with open(file, mode='w') as f:
        f.write(content)

    print(f"Succesfully wrote {len(env)} items to {file}")
    

def main() -> None:
    # TODO: also accept CLI arguments
    if not ENV_DIR.exists():
        ENV_DIR.mkdir()
    prexisting_env = dotenv.dotenv_values(BACKEND_ENV)
    prexisting_env.update(dotenv.dotenv_values(FRONTEND_ENV))

    backend_env: dict[str, str] = {}
    frontend_env: dict[str, str] = {}
    mongo_env: dict[str, str] = {}
    sessionsdb_env: dict[str, str] = {}

    # sessionsdb - backend
    sessionsdb_username = prompt_variable('SESSIONSDB_USERNAME', prexisting_env.get("SESSIONSDB_USERNAME", "name"))
    sessionsdb_pass = prompt_variable('SESSIONSDB_PASSWORD', prexisting_env.get("SESSIONSDB_PASSWORD", "pass123"))
    sessionsdb_hostname = prompt_variable("SESSIONSDB_SERVICE_HOSTNAME", prexisting_env.get("SESSIONSDB_SERVICE_HOSTNAME", "sessiondb"))

    # cse auth - backend
    auth_cse_client_id = prompt_variable("AUTH_CSE_CLIENT_ID", prexisting_env.get("AUTH_CSE_CLIENT_ID", "..."))
    auth_cse_client_secret = prompt_variable("AUTH_CSE_CLIENT_SECRET", prexisting_env.get("AUTH_CSE_CLIENT_SECRET", "..."))
    auth_cse_redirect_base_uri = prompt_variable("AUTH_REDIRECT_BASE_URI", prexisting_env.get("AUTH_REDIRECT_BASE_URI", "http://localhost:3000"))

    backend_env["AUTH_CSE_CLIENT_ID"] = auth_cse_client_id
    backend_env["AUTH_CSE_CLIENT_SECRET"] = auth_cse_client_secret
    backend_env["AUTH_REDIRECT_BASE_URI"] = auth_cse_redirect_base_uri

    backend_env["SESSIONSDB_USERNAME"] = sessionsdb_username
    backend_env["SESSIONSDB_PASSWORD"] = sessionsdb_pass
    backend_env["SESSIONSDB_SERVICE_HOSTNAME"] = sessionsdb_hostname

    # redis - sessionsdb
    base_redis_args = f"--user {sessionsdb_username} on allcommands allkeys allchannels >{sessionsdb_pass}"
    additional_redis_args = prompt_variable("ADDITIONAL_REDIS_ARGS", prexisting_env.get("ADDITIONAL_REDIS_ARGS", ""))
    redis_args = f"{base_redis_args} {additional_redis_args}" if additional_redis_args else base_redis_args
    sessionsdb_env["REDIS_ARGS"] = redis_args


    # Misc - backend
    python_version = prompt_variable("PYTHON_VERSION", prexisting_env.get("PYTHON_VERSION", "python3"))
    backend_env["PYTHON_VERSION"] = python_version

    if in_production():
        backend_env["FORWARDED_ALLOWED_IPS"] = "*"

    # mongodb - backend + mongodb
    mongo_username = prompt_variable('MONGODB_USERNAME', prexisting_env.get("MONGODB_USERNAME", "name"))
    mongo_pass = prompt_variable('MONGODB_PASSWORD', prexisting_env.get("MONGODB_PASSWORD", "pass123"))
    mongo_hostname = prompt_variable("MONGODB_SERVICE_HOSTNAME", prexisting_env.get("MONGODB_SERVICE_HOSTNAME", "mongodb"))

    backend_env["MONGODB_USERNAME"] = mongo_username
    backend_env["MONGODB_PASSWORD"] = mongo_pass
    backend_env["MONGODB_SERVICE_HOSTNAME"] = mongo_hostname

    mongo_env["MONGO_INITDB_ROOT_USERNAME"] = mongo_username
    mongo_env["MONGO_INITDB_ROOT_PASSWORD"] = mongo_pass



    # frontend
    vite_backend_base_url = prompt_variable("VITE_BACKEND_API_BASE_URL", prexisting_env.get("VITE_BACKEND_API_BASE_URL", "http://localhost:8000/"))
    vite_env = prompt_variable("VITE_ENV", prexisting_env.get("VITE_ENV", "dev"))
    
    frontend_env["VITE_BACKEND_API_BASE_URL"] = vite_backend_base_url
    frontend_env["VITE_ENV"] = vite_env

    # Finished reading - save all changes
    write_env_file(backend_env, BACKEND_ENV)
    write_env_file(frontend_env, FRONTEND_ENV)
    write_env_file(mongo_env, MONGO_ENV)
    write_env_file(sessionsdb_env, SESSIONSDB_ENV)
    print("Done. Exiting Successfully")

if __name__ == "__main__":
    main()
    pass
