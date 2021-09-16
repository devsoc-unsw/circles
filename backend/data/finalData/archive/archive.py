"""
Only archives courses, storing:
- title
- code
- uoc
- level
- description
- terms
- path_to
- path_from
- study_level
- school
- faculty
- gen_ed

Exclusions, equivalents, corequisites are not needed as they should rely on the latest data

NOTE: UNSW handbook seems to not archive past data so we will build up an archive ourselves

This is very hacky since archiving is not something that will happen often. The
current workflow is just to use the coursesScraping -> formatting -> processing -> conditions (to get exclusions)
pipeline but change the input and output files accordingly. NOTE: Don't overwrite absentCourses

TODO: Smoother workflow for archiving pipeline (probably involving config file paths)
so we don't have to manually go into the files and change the file paths when archiving


15/09/2021 - Raw data only exists for 2021. Luckily, the original version of circles
created in 2020 contained some course data for 2020 courses. This means we can have
course data for 2020-22 as of current
- James Ji

NOTE: 2020 raw data does not have gen_ed data. We will backfill this with 2022 data
"""

import json

from data.utility import dataHelpers


def process_2020():
    """ 
    Processes the 2020 data (backfilling from the 2021 data afterwards).
    Backfilled data includes:
    - gen_ed (from 2021)


    NOTE: Make sure to run this last after processing the latest data
    """

    # All the processed data
    processed = {}

    data = dataHelpers.read_data("data/finalData/archive/formatted/2020.json")

    processed_2021 = dataHelpers.read_data(
        "data/finalData/archive/processed/2021.json")

    # The 2020 formatted data had different structure and naming
    for code, course in data.items():
        # The processed data for this course which we will build up
        processed_course = {}
        processed_course["title"] = course["course_name"]
        processed_course["code"] = course["course_code"]
        processed_course["UOC"] = course["units"]
        processed_course["level"] = course["course_level"]
        processed_course["description"] = course["desc"]

        processed_course["equivalents"] = {}
        if course["equivalents"] != None:
            for equiv in course["equivalents"]:
                processed_course["equivalents"][equiv] = 1

        processed_course["terms"] = []
        if course["terms"] != None:
            for term in course["terms"]:
                if term == "Term 1":
                    processed_course["terms"].append("T1")
                elif term == "Term 2":
                    processed_course["terms"].append("T2")
                elif term == "Term 3":
                    processed_course["terms"].append("T3")
                elif term == "Semester 1":
                    processed_course["terms"].append("S1")
                elif term == "Semeter 2":
                    processed_course["terms"].append("S2")
                elif term == "Summer Term":
                    processed_course["terms"].append("ST")
                elif term == "Summer Canberra":
                    processed_course["terms"].append("SC")

        processed_course["path_to"] = {}
        if course["builds_into"] != None:
            for into in course["builds_into"]:
                processed_course["path_to"][into] = 1

        processed_course["path_from"] = {}
        if course["conditions"]["prerequisites"] != None:
            for prereq_1 in course["conditions"]["prerequisites"]:
                if isinstance(prereq_1, list):
                    for prereq_2 in prereq_1:
                        if isinstance(prereq_2, list):
                            for prereq_3 in prereq_2:
                                if isinstance(prereq_3, list):
                                    for prereq_4 in prereq_3:
                                        processed_course["path_from"][prereq_4] = 1
                                else:
                                    processed_course["path_from"][prereq_3] = 1
                        else:
                            processed_course["path_from"][prereq_2] = 1
                else:
                    processed_course["path_from"][prereq_1] = 1

        # Only undergrad courses were scrapped
        processed_course["study_level"] = "Undergraduate"

        # Backfill
        if code in processed_2021:
            # This course also exists in 2021. We can backfill
            if "school" in processed_2021[code]:
                processed_course["school"] = processed_2021[code]["school"]
            else:
                processed_course["school"] = None

            processed_course["faculty"] = processed_2021[code]["faculty"]
            processed_course["gen_ed"] = processed_2021[code]["gen_ed"]
        else:
            # This course does not exist in 2021... Might require manual fixing gg
            processed_course["school"] = None
            processed_course["faculty"] = None
            processed_course["gen_ed"] = 0

        processed[code] = processed_course

    dataHelpers.write_data(
        processed, "data/finalData/archive/processed/2020.json")


if __name__ == "__main__":
    process_2020()
