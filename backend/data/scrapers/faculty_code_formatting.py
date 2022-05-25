"""
Formats raw data, see 'facultyCodesProcessed.json' for output.
"""

from data.utility.data_helpers import read_data, write_data

FACULTY_CODE_INPUT_PATH = "data/scrapers/facultyCodesRaw.json"
FACULTY_COURSE_INPUT_PATH = "algorithms/cache/courseMappings.json"
OUTPUT_PATH = "data/final_data/facultyCodesProcessed.json"


def format_code_data() -> None:
    """
    Read in INPUT_PATH, process them and write to OUTPUT_PATH
    """
    processed_data = {}

    # Read in mappings from faculty -> abbreviations
    # E.g., aviation -> [AVIA]
    data = read_data(FACULTY_CODE_INPUT_PATH)
    for item in data["contentlets"]:
        name = replace_schools_and_faculties(item["name"])
        processed_data[name] = [ item["code"] ]

    # Read in broader mappings from faculty -> sub faculties
    # E.g., F Engineering -> [COMP, ELEC, SENG, ...]
    data = read_data(FACULTY_COURSE_INPUT_PATH)
    for faculty, courses in data.items():
        faculty = replace_schools_and_faculties(faculty)
        processed_data[faculty] = []
        for code, _ in courses.items():
            faculty_code = code[:4]
            if faculty_code not in processed_data[faculty]:
                processed_data[faculty].append(faculty_code)

    write_data(processed_data, OUTPUT_PATH)

def replace_schools_and_faculties(string):
    string = string.replace("School of", "S")
    string = string.replace("Faculty of", "F")
    return string

if __name__ == "__main__":
    format_code_data()
