""" The central point from where we will run our server. It will open up the 
api and also run the files"""

import uvicorn
import argparse
import sys
from server.server import app
from server.database import overwrite_all

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Inclusion of option will overwrite the database",
    )

    try:
        args = parser.parse_args()
    except:
        parser.print_help()
        sys.exit(0)

    if args.overwrite:
        overwrite_all()

    uvicorn.run(app, host='0.0.0.0')
