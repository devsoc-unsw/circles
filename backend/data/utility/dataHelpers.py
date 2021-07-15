"""
Contains helper functions to assist with reading and writing data.
"""
import sys
import json
import os.path

def read_data(file_name):
    """
    Reads file with given file_name and returns data
    """
    try:
        with open(file_name, "r") as INPUT_FILE:
            return json.load(INPUT_FILE)
    except:
        print("File not found")
        sys.exit(1)

def write_data(data, file_name):
    """
    Writes data to file with given file_name
    """
    if os.path.isfile(file_name):
        res = input("File name already exists. Enter 'y' to overwrite or 'n' to cancel: ")
        if res.lower() != "y":
            print("File not overwritten.")
            sys.exit(1)

    with open(file_name, "w") as OUTPUT_FILE:
        json.dump(data, OUTPUT_FILE)
        print(f"{file_name} successfully created")