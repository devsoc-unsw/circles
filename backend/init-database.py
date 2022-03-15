""" The central point from where we will run our server. It will open up the
api and also run the files"""

from server.database import overwrite_all

overwrite_all()
