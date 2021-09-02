''' The central point from where we will run our server. It will open up the 
api and also run the files'''
import sys
import argparse

import uvicorn
from server import server
from server.server import app
from server.database import overwrite_collection



if __name__ == "__main__":
    overwrite_collection('Programs')
    overwrite_collection('Specialisations')
    overwrite_collection('Courses')
    uvicorn.run(app)