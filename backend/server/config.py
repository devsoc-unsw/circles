"""Config for ther server and its routes. Mainly file paths"""

URI = "mongodb://mongodb:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"

FINAL_DATA_PATH = "./data/final_data/"

ARCHIVED_DATA_PATH = "./data/final_data/archive/processed/"

# YAML degree documents (programs, specialisations, ...) evaluated in the browser
DEGREE_DOCUMENTS_PATH = "./data/degree_documents/"

DUMMY_TOKEN = "token"  # TODO: get rid of this

SECURE_COOKIES = True
