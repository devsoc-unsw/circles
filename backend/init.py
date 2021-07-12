'''The central point from where we will initialise our data and servers. For now,
just make it dump data into a local mongo database'''

import sys
import json
import pymongo

#TODO: Set up proper env variables to share with javascript files
URI = 'mongodb://localhost:27017'



''' Overwriting the given collection. Loads from the given file and writes to
the given collection'''
def overwrite_collection(file, collection):
    with open(file) as f:
        try:
            file_data = json.load(f)
            for key in file_data:
                collection.insert_one(file_data[key])
        except:
            print(f"Failed to load and overwrite with {file}")



if __name__ == "__main__":
    client = pymongo.MongoClient(URI)
    db = client['Main']
        
    # Remove any pre-existing collections to overwrite them
    db['Programs'].drop()
    db['Specialisations'].drop()
    db['Courses'].drop()

    overwrite_collection('./data/finalData/programsProcessed.json', db['Programs'])
    overwrite_collection('./data/finalData/specialisationsProcessed.json', db['Specialisations'])
    overwrite_collection('./data/finalData/coursesProcessed.json', db['Courses'])

    print("Finished overwriting collections!")

    client.close()
