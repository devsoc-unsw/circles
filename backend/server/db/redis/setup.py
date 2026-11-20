import redis
from redis.exceptions import ResponseError
from redis.commands.search.field import TagField
from redis.commands.search.index_definition import IndexDefinition, IndexType

from .conn import sdb
from .limiter_conn import limiter_redis_kwargs

def _drop_all_keys():
    print("dropping all redis keys")
    print(sdb.flushdb())

def _create_uid_index(drop: bool):
    if drop:
        try:
            print("dropping uid index")
            print(sdb.ft("idx:uid").dropindex(True))
        except ResponseError as e:
            print("drop uid index failed:", e)

    # FT.CREATE idx:uid ON HASH PREFIX 1 "stoken:" NOOFFSETS NOHL NOFIELDS NOFREQS STOPWORDS 0 SCHEMA uid TAG CASESENSITIVE
    print("creating uid index")
    print(sdb.ft("idx:uid").create_index(
        fields=[TagField("uid", case_sensitive=True)],
        definition=IndexDefinition(
            prefix=["token:"],
            index_type=IndexType.HASH,
        ),
        no_term_offsets=True,
        no_highlight=True,
        no_field_flags=True,
        no_term_frequencies=True,
        stopwords=[],
    ))

def _create_sid_index(drop: bool):
    if drop:
        try:
            print("dropping sid index")
            print(sdb.ft("idx:sid").dropindex(True))
        except ResponseError as e:
            print("drop sid index failed:", e)

    # FT.CREATE idx:sid ON HASH PREFIX 1 "stoken:" NOOFFSETS NOHL NOFIELDS NOFREQS STOPWORDS 0 SCHEMA sid TAG CASESENSITIVE
    print("creating sid index")
    print(sdb.ft("idx:sid").create_index(
        fields=[TagField("sid", case_sensitive=True)],
        definition=IndexDefinition(
            prefix=["token:"],
            index_type=IndexType.HASH,
        ),
        no_term_offsets=True,
        no_highlight=True,
        no_field_flags=True,
        no_term_frequencies=True,
        stopwords=[],
    ))

def setup_redis_sessionsdb():
    # redis could still have stuff inside of it at this setup, if we never docker downed the container
    # so we should always drop everything here first, and then also always try drop indexes
    _drop_all_keys()
    _create_sid_index(True)
    # create_uid_index(True)  # don't really have a use for this yet...

def reset_redis_limiterdb():
    # Flush the fastapi-limiter logical db (db=1) -> for test setup only
    # Separate logical db from the sessionsdb (db=0)
    # To store rate limiting counters for fastapi-limiter package
    limiter_db = redis.Redis(**limiter_redis_kwargs())
    try:
        limiter_db.flushdb()
    finally:
        limiter_db.close()
