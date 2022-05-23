"""
Program formats scraped / raw data by filtering out superfluous fields and
applying minor formatting to relevant fields. It creates the file
'programFormattedRaw.json'.

Within 'contentLets', relevant info includes:
 - creditPoints
 - studyLevel (e.g. 'undergraduate')
 - code (i.e. unique identifier for program)
 - title (e.g. 'Accounting')
 - data (see below)
 - CurriculumStructure (see below)
 - additionalInfo

Step in the data's journey:
    [   ] Scrape raw data (programscraper.py)
    [ X ] Format scraped data (programFormatting.py)
    [   ] Customise formatted data (programProcessing.py)
"""
import json
import re
from data.utility import data_helpers


def format_prg_data():
    """
    Get raw data for a program, format it and dump the output to
    programsFormatterRaw.json
    """
    # Get raw data
    raw_content = data_helpers.read_data("data/scrapers/programsPureRaw.json")
    # Initialise formatted data
    programsFormatted = {}
    for program in raw_content:
        # Load summary infomation about program
        data = json.loads(program["data"])
        # Load infomation about program structure
        curriculumStructure = json.loads(program["CurriculumStructure"])

        # Setup dictionary and add data
        courseCode = initialiseProgram(programsFormatted, data)
        addData(programsFormatted, courseCode, program, data, curriculumStructure)

    data_helpers.write_data(
        programsFormatted, "data/scrapers/programsFormattedRaw.json"
    )


def initialiseProgram(programsFormatted, data):
    """
    Initialises dictionary and assigns it to main programs dictionary
    """
    content = {
        "title": None,
        "code": None,
        "UOC": None,
        "studyLevel": None,
        "faculty": None,
        "duration": None,
        "structure": [],
        "description": None,
    }
    # Get course code
    courseCode = data["course_code"]
    # Map course code to content
    programsFormatted[courseCode] = content
    return courseCode


def addData(programsFormatted, courseCode, program, data, curriculumStructure):
    """Assign values from raw data to dictionary"""

    # Get program info via code
    prog = programsFormatted[courseCode]
    # Assign summary infomation from raw data
    prog["title"] = data.get("title")
    prog["code"] = data.get("course_code")
    prog["UOC"] = data.get("credit_points")
    prog["studyLevel"] = program.get("studyLevelURL")
    prog["faculty"] = data["parent_academic_org"]["value"]
    prog["duration"] = data.get("full_time_duration")
    prog["description"] = formatDescription(data.get("description"))
    # Assign infomation about program cirriculum
    format_curriculum(prog["structure"], curriculumStructure["container"])


def formatDescription(description):
    """
    (Lazily) formats description by getting rid of HTML tags, random unicode characters and multiple spaces.
    """
    # Get rid of any html tags
    description = re.sub(r"<.+?>" , " ", description)

    # Get rid of random unicode characters
    description = re.sub(r"[^\x00-\x7F]+", " ", description)

    # Get rid of double spaces
    description = re.sub(r"\s+", " ", description)

    return description.strip()


def format_curriculum(CurriculumStructure, currcontainer):
    """
    Filters through curiculum structure of program and saves neccesary
    infomation. Purpose of this is to make the information more readable
    """
    for item in currcontainer:
        # Information that we want to filter out
        info = {
            "vertical_grouping": item.get("vertical_grouping"),
            "title": item["title"],
            "description": formatDescription(item.get("description")),
            "credit_points": item.get("credit_points"),
            "credit_points_max": item.get("credit_points_max"),
            "parent_record": item["parent_record"]["value"],
            "container": [],
            "relationship": [],
            "dynamic_relationship": [],
        }
        # If course info is in this container level, it will be in the 'relationship'key
        if "relationship" in item and item["relationship"] != []:
            for course in item["relationship"]:
                item = {}
                item["academic_item_code"] = course.get("academic_item_code")
                item["academic_item_credit_points"] = course.get(
                    "academic_item_credit_points"
                )
                item["academic_item_name"] = course.get("academic_item_name")
                item["academic_item_type"] = course.get("academic_item_type")
                item["parent_record"] = course["parent_record"]["value"]
                info["relationship"].append(item)
        # Otherwise if it is in 'dynamic_relationship' key
        elif "dynamic_relationship" in item and item["dynamic_relationship"] != []:
            for course in item["dynamic_relationship"]:
                item = {}
                item["value"] = course["parent_record"]["value"]
                item["description"] = formatDescription(course.get("description"))
                info["dynamic_relationship"].append(item)

        elif "container" in item and item["container"] != []:
            # Course info in deeper container level, so recurse and repeat
            format_curriculum(info["container"], item["container"])

        # Append data to cirrculum structure
        CurriculumStructure.append(info)

    return CurriculumStructure


if __name__ == "__main__":
    format_prg_data()
