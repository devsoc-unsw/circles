import redis
from redis.exceptions import ResponseError
from redis.commands.search.field import TagField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType



r = redis.Redis(host="sessionsdb", port=6379, protocol=3)
print("connected", r.ping())

# FT.CREATE idx:uid ON HASH PREFIX 1 "stoken:" NOOFFSETS NOHL NOFIELDS NOFREQS STOPWORDS 0 SCHEMA uid TAG CASESENSITIVE
try:
    print("creating uid index")
    print(r.ft("idx:uid").create_index(
        fields=(TagField("uid", case_sensitive=True), ),
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
except ResponseError as e:
    print(e)

# FT.CREATE idx:sid ON HASH PREFIX 1 "stoken:" NOOFFSETS NOHL NOFIELDS NOFREQS STOPWORDS 0 SCHEMA sid TAG CASESENSITIVE
try:
    print("creating sid index")
    print(r.ft("idx:sid").create_index(
        fields=TagField("sid", case_sensitive=True),
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
except ResponseError as e:
    print(e)

r.close()
