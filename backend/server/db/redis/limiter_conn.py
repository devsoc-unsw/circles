import os
import redis.asyncio as aioredis

# fastapi-limiter needs an async redis client, separate from the sync `sdb`
# used for sessions.
# We point it at the same Redis server but a different logical db (db=1)
# so limiter keys never collide with session keys.
# Single source of truth for the limiter connection params, shared by the async
# client here and the sync flush helper in setup.py.
def limiter_redis_kwargs() -> dict:
    return dict(
        host=os.environ["SESSIONSDB_SERVICE_HOSTNAME"],
        port=6379,
        db=1,                       # separate logical db from sessions (db=0)
        protocol=3,
        encoding="utf-8",
        decode_responses=True,
        username=os.environ["SESSIONSDB_USERNAME"],
        password=os.environ["SESSIONSDB_PASSWORD"],
    )

def make_limiter_redis() -> "aioredis.Redis":
    return aioredis.Redis(**limiter_redis_kwargs())
