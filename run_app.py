# pylint: disable=cyclic-import
""" run all of circles in one terminal """
import logging
import os
import sys
import threading
from subprocess import Popen, check_call

from dotenv import load_dotenv


class LogPipe(threading.Thread):
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
        for line in iter(self.pipeReader.readline, ''):
            logging.log(self.level, line.strip('\n'))

        self.pipeReader.close()

    def close(self):
        """Close the write end of the pipe."""
        os.close(self.fdWrite)

    def write(self, message):
        """ do write """
        logging.log(self.level, message)


def get_backend_env():
    """
        reads backend.env for mongodb username and password and python
        version.
    """
    load_dotenv("./env/backend.env")
    username = os.getenv("MONGODB_USERNAME")
    password = os.getenv("MONGODB_USERNAME")
    python = os.getenv("PYTHON_VERSION") or "python"
    return (username, password, python)

def main():
    logging.basicConfig(level=logging.INFO,format='%(asctime)s %(message)s',
        handlers=[
        logging.FileHandler("debug.log", mode='w'),
        logging.StreamHandler()
        ]
    )
    sys.stdout = LogPipe(logging.INFO)
    sys.stderr = LogPipe(logging.ERROR)
    username, password, python_ver = get_backend_env()
    os.system('docker compose run --rm init-mongo')
    try:
        Popen(
            f'MONGODB_SERVICE_HOSTNAME=localhost MONGODB_PASSWORD={password} MONGODB_USERNAME={username}  nodemon --exec {python_ver} runserver.py',
            stdout=sys.stdout,
            stderr=sys.stderr,
            shell=True,
            cwd='backend/'
        )
        check_call(
            'REACT_APP_ENV=dev npm run dev',
            shell=True,
            stdout=sys.stdout,
            stderr=sys.stderr,
            cwd='frontend/'
        )
    # pylint: disable=broad-except
    except Exception as e:
        sys.stdout.write(f'exception - {e}')
    finally:
        sys.stdout.close()
        sys.stderr.close()
        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__
        logging.shutdown()

if __name__ == '__main__':
    main()
