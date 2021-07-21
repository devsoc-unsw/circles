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
 - hb_enrolment_rules (i.e. constraints such as a maturity rule)
 
Step in the data's journey:
    [   ] Scrape raw data (programscraper.py)
    [ X ] Format scraped data (programFormatting.py)
    [   ] Customise formatted data (programProcessing.py)
"""
import json
import data.utility.dataHelpers


def format_data():
    # Get raw data
    raw_content = dataHelpers.read_data("programsRaw.json")
    programsFormatted = {}
    for program in raw_content:
        # Load and process strings for further manipulation
        data = json.loads(program["data"]) 
        curriculumStructure = json.loads(program["CurriculumStructure"])

        # Setup dictionary and add data
        courseCode = initialiseProgram(programsFormatted, data)
        addData(programsFormatted, courseCode, program, data, curriculumStructure)

    dataHelpers.write_data(programsFormatted, 'programsFormattedRaw.json')


'''
Initialises dictionary and assigns it to main programs dictionary
'''
def initialiseProgram(programsFormatted, data):

    content = {
        'title': None,
        'code' : None,
        'UOC': None,
        'studyLevel': None,
        'faculty': None,
        'duration': None,
        'CurriculumStructure': []
    }
    courseCode = data['course_code']
    programsFormatted[courseCode] = content
    return courseCode

'''
Assign values to dictionary
'''
def addData(programsFormatted, courseCode, program, data, curriculumStructure):
    prog = programsFormatted[courseCode]
    
    prog['title'] = data.get('title')
    prog['code'] = data.get('course_code')
    prog['UOC'] = data.get('credit_points')
    prog['studyLevel'] = program.get('studyLevelURL')
    prog['faculty'] = data['parent_academic_org']['value']
    prog['duration'] = data.get('full_time_duration')  
    format_curriculum(prog['CurriculumStructure'], curriculumStructure["container"])


'''
Filters through curiculum structure of program and saves neccesary infomation. Purpose of this
is to make the information more readable 
'''
def format_curriculum(CurriculumStructure, currcontainer):
    for item in currcontainer:
        # Information that we want to filter out
        info = {
            "vertical_grouping": item.get('vertical_grouping'),
            "title": item["title"],
            "description": item.get("description"),
            "credit_points": item.get("credit_points"),
            "credit_points_max": item.get("credit_points_max"),
            "parent_record": item["parent_record"]["value"],          
            "container": [],
            "relationship": [], 
            "dynamic_relationship": []
        }
        # If course info is in this container level, it will be in the 'relationship'key
        if "relationship" in item and item["relationship"] != []:
            for course in item["relationship"]:
                item = {}
                item["academic_item_code"] = course.get("academic_item_code")
                item["academic_item_credit_points"] = course.get("academic_item_credit_points")
                item["academic_item_name"] = course.get("academic_item_name")
                item["academic_item_type"] = course.get( "academic_item_type")
                item["parent_record"] = course["parent_record"]["value"]
                info["relationship"].append(item)

        elif "dynamic_relationship" in item and item["dynamic_relationship"] != []:
            for course in item["dynamic_relationship"]:
                item = {}
                item["value"] = course["parent_record"]["value"]
                item["description"] = course.get("description")
                info["dynamic_relationship"].append(item)

        elif "container" in item and item["container"] != []:
            # Course info in deeper container level, so recurse and repeat
            format_curriculum(info["container"], item["container"])
        
        CurriculumStructure.append(info)

    return CurriculumStructure


if __name__ == "__main__":
    format_data()
