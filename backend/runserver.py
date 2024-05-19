""" The central point from where we will run our server. It will open up the
api and also run the files"""

import argparse
import sys

import uvicorn

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Inclusion of option will force overwrite the database",
    )
    parser.add_argument(
        "--dev",
        action="store_true",
        help="Inclusion of option will enable hot-reloading and smart-overwrite"
    )

    try:
        args = parser.parse_args()
    except argparse.ArgumentError:
        parser.print_help()
        sys.exit(0)

    if args.overwrite or args.dev:
        # TODO-OLLI: abstract this, and remove these local imports once we have proper connection handling
        # TODO-OLLI: also do overwrite checks for dev mode using a timestamp
        from server.db.mongo.setup import optionally_create_new_data, overwrite_all
        from server.db.redis.setup import setup_redis_sessionsdb

        overwrite_all()
        optionally_create_new_data()
        print("-- Finished Mongo Setup")

        setup_redis_sessionsdb()
        print("-- Finished Redis Setup")

    print(f"-- Starting uvicorn(reload={args.dev})")
    print("*.json" if args.dev else None)
    uvicorn.run(
        "server.server:app",
        host='0.0.0.0',
        lifespan="on",
        reload=args.dev,
        reload_excludes="*.json" if args.dev else None
    )
