"""
Formats raw data, see 'facultyCodesProcessed.json' for output.
"""

from data.utility.data_helpers import read_data, write_data

INPUT_PATH = "data/scrapers/facultyCodesRaw.json"
OUTPUT_PATH = "data/final_data/facultyCodesProcessed.json"


def format_code_data() -> None:
    """
    Read in INPUT_PATH, process them and write to OUTPUT_PATH
    """
    data = read_data(INPUT_PATH)

    processed_data = {}
    for item in data["contentlets"]:
        name = item["name"]
        processed_data[name] = item["code"]

    write_data(processed_data, OUTPUT_PATH)

if __name__ == "__main__":
    format_code_data()
