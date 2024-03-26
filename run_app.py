# pylint: disable=cyclic-import
""" run all of circles in one terminal, assuming a unix environment """

import os
from subprocess import Popen, check_call, run


# also crazy - autoconfigure the environment if it is borked
if not os.path.exists(".venv"):
    if run("./create_venv.sh", shell=True).returncode != 0:
        print("please follow the above instructions to set up venv correctly")
        exit(1)


os.system(". .venv/bin/activate")

if run("nodemon --help > /dev/null", shell=True).returncode != 0:
    print("You must install npm and nodemon. Please follow the onboarding instructions to install npm, then run 'npm install -g nodemon'")
    exit(1)

if not os.path.exists("frontend/node_modules"):
    run("cd frontend; npm install", shell=True)


import logging
import sys
import threading
from subprocess import Popen, check_call
from typing import TextIO
try:
    from dotenv import load_dotenv
except:
    print("failed to load from venv correctly. Please run '. .venv/bin/activate' and try again")
    exit(1)

from dotenv import load_dotenv


class LogPipe(threading.Thread, TextIO):
    """ boilerplate abstraction for redirecting the logs of a process """
    def __init__(self, level):
        """Setup the object with a logger and a loglevel
        and start the thread
        """
        threading.Thread.__init__(self)
        self.daemon = False
        self.level = level
        self.fdRead, self.fdWrite = os.pipe()
        self.pipeReader = os.fdopen(self.fdRead)
        self.start()

    def fileno(self):
        """Return the write file descriptor of the pipe"""
        return self.fdWrite

    def run(self):
        """Run the thread, logging everything."""
        for line in iter(self.pipeReader.readline, ""):
            logging.log(self.level, line.strip("\n"))

        self.pipeReader.close()

    def close(self):
        """Close the write end of the pipe."""
        os.close(self.fdWrite)

    def write(self, message):
        """do write"""
        logging.log(self.level, message)


def get_backend_env():
    """
    reads backend.env for mongodb username and password and python
    version.
    """
    load_dotenv("./env/backend.env")
    username = os.getenv("MONGODB_USERNAME")
    password = os.getenv("MONGODB_PASSWORD")
    python = os.getenv("PYTHON_VERSION") or "python"
    return (username, password, python)


def get_frontend_env():
    """
    reads frontend.env for mongodb username and password and python
    version.
    """
    load_dotenv("./env/frontend.env")
    baseurl = os.getenv("VITE_BACKEND_API_BASE_URL")
    return baseurl


def main():
    if os.system("docker ps > /dev/null") != 0:
        print("please run docker first!")
        sys.exit(1)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(message)s",
        handlers=[logging.FileHandler("debug.log", mode="w"), logging.StreamHandler()],
    )
    # this is actually kooky if you think about it
    sys.stdout = LogPipe(logging.INFO)
    sys.stderr = LogPipe(logging.ERROR)
    username, password, python_ver = get_backend_env()
    base_url = get_frontend_env()
    os.system("docker compose run --rm init-mongo")
    try:
        Popen(
            f"MONGODB_SERVICE_HOSTNAME=localhost MONGODB_PASSWORD={password} MONGODB_USERNAME={username}  nodemon --exec {python_ver} runserver.py",
            stdout=sys.stdout,
            stderr=sys.stderr,
            shell=True,
            cwd="backend/",
        )
        check_call(
            f"VITE_BACKEND_API_BASE_URL={base_url} npm start",
            shell=True,
            stdout=sys.stdout,
            stderr=sys.stderr,
            cwd="frontend/",
        )
    # pylint: disable=broad-except
    except Exception as e:
        sys.stdout.write(f"exception - {e}")
    finally:
        sys.stdout.close()
        sys.stderr.close()
        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__
        logging.shutdown()


if __name__ == "__main__":
    main()
