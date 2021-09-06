''' The central point from where we will run our server. It will open up the 
api and also run the files'''
import sys
import argparse

import uvicorn
import argparse

from server import server
from server.server import app
from server.database import overwrite_collection

parser = argparse.ArgumentParser()
parser.add_argument('--overwrite', default=False, type=bool,
                    help='True or False to overwrite the existing databases with up to date data when necessary')

if __name__ == "__main__":
    try:
        args = parser.parse_args()
    except:
        parser.print_help()
        sys.exit(0)

    if args.overwrite:
        overwrite_collection("Courses")
        overwrite_collection("Specialisations")
        overwrite_collection("Programs")

    uvicorn.run(app)
