""" The central point from where we will run our server. It will open up the
api and also run the files"""

import argparse
import sys

import uvicorn

# TODO: make a --dev option
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Inclusion of option will overwrite the database",
    )
    try:
        args = parser.parse_args()
    except argparse.ArgumentError:
        parser.print_help()
        sys.exit(0)

    if args.overwrite:
        # TODO: abstract this
        from server.db.mongo.setup import optionally_create_new_data, overwrite_all
        from server.db.redis.setup import setup_redis_sessionsdb

        overwrite_all()
        optionally_create_new_data()
        print("-- Finished Mongo Setup")

        setup_redis_sessionsdb()
        print("-- Finished Redis Setup")

    print("\n\n-- Starting uvicorn")
    uvicorn.run("server.server:app", host='0.0.0.0', reload=True, lifespan="on", reload_excludes="*.json")
