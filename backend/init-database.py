""" The central point from where we will run our server. It will open up the
api and also run the files"""

from server.db.mongo.setup import optionally_create_new_data, overwrite_all
import server.db.redis.setup 

overwrite_all()
optionally_create_new_data()

print("-- Finished Mongo Setup")

# setup_redis_sessionsdb()
print("-- Finished Redis Setup")
