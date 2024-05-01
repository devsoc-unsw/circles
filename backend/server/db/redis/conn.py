from sys import exit
import redis

sdb: redis.Redis

def connect():
    # TODO: make this not use ft.search and use our own secondary index
    try:
        global sdb
        sdb = redis.Redis(host="sessionsdb", port=6379, protocol=3, decode_responses=True)
        print('Connected to sessions database.', sdb.ping())
    except:  # pylint: disable=bare-except
        print("Unable to connect to sessions database.")
        exit(1)

# TODO: call this in the fastapi lifetime function
connect()
