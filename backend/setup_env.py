"""
Script built on dotenv to set up the required environment variables
"""

import argparse
from os import write
from pathlib import Path
from typing import Optional

import dotenv

# Assumes this file is in `/backend/setup_env.py`
PROJECT_ROOT: Path = Path(__file__).parent.parent
ENV_DIR: Path = PROJECT_ROOT.joinpath('env')

BACKEND_ENV: Path = ENV_DIR.joinpath("backend.env")
FRONTEND_ENV: Path = ENV_DIR.joinpath("frontend.env")
MONGO_ENV: Path = ENV_DIR.joinpath('mongodb.env')
SESSIONSDB_ENV: Path = ENV_DIR.joinpath('sessionsdb.env')
    

def main() -> None:
    if not ENV_DIR.exists():
        ENV_DIR.mkdir()

    env = EnvReader(env_files=[BACKEND_ENV, FRONTEND_ENV, SESSIONSDB_ENV])

    backend_env: dict[str, str] = {}
    frontend_env: dict[str, str] = {}
    mongo_env: dict[str, str] = {}
    sessionsdb_env: dict[str, str] = {}

    # sessionsdb - backend
    sessionsdb_username = env.get_variable('SESSIONSDB_USERNAME', "name")
    sessionsdb_pass = env.get_variable('SESSIONSDB_PASSWORD', "pass123")
    sessionsdb_hostname = env.get_variable("SESSIONSDB_SERVICE_HOSTNAME", "sessionsdb")

    # cse auth - backend
    auth_cse_client_id = env.get_variable("AUTH_CSE_CLIENT_ID", "...")
    auth_cse_client_secret = env.get_variable("AUTH_CSE_CLIENT_SECRET", "...")
    auth_cse_redirect_base_uri = env.get_variable("AUTH_REDIRECT_BASE_URI", "http://localhost:3000")

    backend_env["AUTH_CSE_CLIENT_ID"] = auth_cse_client_id
    backend_env["AUTH_CSE_CLIENT_SECRET"] = auth_cse_client_secret
    backend_env["AUTH_REDIRECT_BASE_URI"] = auth_cse_redirect_base_uri

    backend_env["SESSIONSDB_USERNAME"] = sessionsdb_username
    backend_env["SESSIONSDB_PASSWORD"] = sessionsdb_pass
    backend_env["SESSIONSDB_SERVICE_HOSTNAME"] = sessionsdb_hostname

    # redis - sessionsdb
    base_redis_args = f"--user {sessionsdb_username} on allcommands allkeys allchannels >{sessionsdb_pass}"
    additional_redis_args = env.get_variable("ADDITIONAL_REDIS_ARGS", "")
    redis_args = f"{base_redis_args} {additional_redis_args}" if additional_redis_args else base_redis_args
    sessionsdb_env["ADDITIONAL_REDIS_ARGS"] = additional_redis_args
    sessionsdb_env["REDIS_ARGS"] = redis_args


    # Misc - backend
    python_version = env.get_variable("PYTHON_VERSION", "python3")
    backend_env["PYTHON_VERSION"] = python_version

    if env.in_production:
        backend_env["FORWARDED_ALLOWED_IPS"] = "*"

    # mongodb - backend + mongodb
    mongo_username = env.get_variable('MONGODB_USERNAME', "name")
    mongo_pass = env.get_variable('MONGODB_PASSWORD', "pass123")
    mongo_hostname = env.get_variable("MONGODB_SERVICE_HOSTNAME", "mongodb")

    backend_env["MONGODB_USERNAME"] = mongo_username
    backend_env["MONGODB_PASSWORD"] = mongo_pass
    backend_env["MONGODB_SERVICE_HOSTNAME"] = mongo_hostname

    mongo_env["MONGO_INITDB_ROOT_USERNAME"] = mongo_username
    mongo_env["MONGO_INITDB_ROOT_PASSWORD"] = mongo_pass



    # frontend
    vite_backend_base_url = env.get_variable("VITE_BACKEND_API_BASE_URL", "http://localhost:8000/")
    vite_env = env.get_variable("VITE_ENV", "dev")
    
    frontend_env["VITE_BACKEND_API_BASE_URL"] = vite_backend_base_url
    frontend_env["VITE_ENV"] = vite_env

    # Finished reading - save all changes
    write_env_file(backend_env, BACKEND_ENV)
    write_env_file(frontend_env, FRONTEND_ENV)
    write_env_file(mongo_env, MONGO_ENV)
    write_env_file(sessionsdb_env, SESSIONSDB_ENV)
    print("Finished writing all env files. Exiting successfully")

class EnvReader():

    def __init__(self, *, env_files: list[Path]) -> None:
        cli_args = vars(parse_cli_args())

        self.in_production = bool(cli_args.get("prod"))
        self.cli_args: dict[str, str] = {
            k: str(v) for k, v in cli_args.items() if v is not None
        }

        print("in prod", self.in_production)
        self.preexisting_env: dict[str, str] = {}

        for env_file in env_files:
            parsed_env = {
                key: value
                for key, value in dotenv.dotenv_values(env_file).items()
                if value is not None
            }
            self.preexisting_env.update(parsed_env)

    def get_variable(self, name: str, default: Optional[str] = None) -> str:
        # CLI arguments have highest priority. If provided, dont ask for value
        if (value_from_cli := self.cli_args.get(name.lower())) is not None:
            print(f"Successfully read value from args. Using {name}={value_from_cli}")
            return value_from_cli

        def read_input():
            try:
                return input().strip()
            except EOFError:
                return ""

        if (default_value := self.preexisting_env.get(name)) is not None:
            print(f"Enter value for {name} (press [enter] to accept default '{default_value}')")
            entered_value = read_input()
            return entered_value or default_value
        else:
            print(f"Enter value for {name}")
            return read_input()

def parse_cli_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Set up env/ folder and required env files")
    parser.add_argument("--sessionsdb_username", type=str)
    parser.add_argument("--sessionsdb_password", type=str)
    parser.add_argument("--sessionsdb_service_hostname", type=str)

    parser.add_argument("--auth_cse_client_id", type=str)
    parser.add_argument("--auth_cse_client_secret", type=str)
    parser.add_argument("--auth_redirect_base_uri", type=str)

    
    parser.add_argument("--additional_redis_args", type=str)
    parser.add_argument("--python_version", type=str)
    parser.add_argument("--prod", "--production", action="store_true")

    return parser.parse_args()


def prompt_variable(name: str, default_value: Optional[str] = None) -> str:
    if default_value is not None:
        print(f"Enter value for {name} (press [enter] to accept default '{default_value}')")
        entered_value = input().strip()
        return entered_value or default_value
    else:
        print(f"Enter value for {name}")
        return input().strip()

def write_env_file(env: dict[str, str], file: Path):
    print(f"Attempting to write env to {file}")
    content = "\n".join(
        f"{key}={value}\n"
        for key, value in env.items()
    )
    with open(file, mode='w') as f:
        f.write(content)

    print(f"Succesfully wrote {len(env)} items to {file}")
if __name__ == "__main__":
    main()
    pass
