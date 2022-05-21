import logging
from subprocess import Popen, CalledProcessError, check_call
import threading
import os
import sys

class LogPipe(threading.Thread):
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

  def write(self):
    """If your code has something like sys.stdout.write"""
    logging.log(self.level, message)

  def flush(self):
    """If you code has something like this sys.stdout.flush"""
    pass

def get_backend_env():
  with open('env/backend.env') as f:
    data = f.readlines()
  data[0] = data[0].replace('MONGODB_USERNAME=', '')
  data[1] = data[1].replace('MONGODB_PASSWORD=', '')
  data[0] = data[0].replace('\n', '')
  data[1] = data[1].replace('\n', '')
  return (data[0], data[1])

def main():
  logging.basicConfig(level=logging.INFO,format='%(asctime)s %(message)s', 
    handlers=[
      logging.FileHandler("debug.log", mode='w'),
      logging.StreamHandler()
    ]
  )
  sys.stdout = LogPipe(logging.INFO)
  sys.stderr = LogPipe(logging.ERROR)
  username, password = get_backend_env()
  os.system('docker compose run --rm init-mongo')
  try:
    backend = Popen(f'MONGODB_SERVICE_HOSTNAME=localhost MONGODB_PASSWORD={password} MONGODB_USERNAME={username}  nodemon --exec python runserver.py', stdout=sys.stdout, stderr=sys.stderr, shell=True, cwd='backend/')
    frontend = check_call('npm start', shell=True, stdout=sys.stdout, stderr=sys.stderr,  cwd='frontend/')
  except(CalledProcessError) as exception:
    sys.stdout.write(f'exception - {exception}')
  finally:
    sys.stdout.write('Execution Stopped - Exiting...')
    sys.stdout.close()
    sys.stderr.close()
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__
    logging.shutdown()
    
if __name__ == '__main__':
  main()
