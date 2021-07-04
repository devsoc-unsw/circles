# Scraping programs data and putting it inside programsRaw.json
from os import SEEK_DATA
import requests
import json
import ast



# for course in json_res['contentlets']:
#   courseData = json.loads(course["data"])
#   programs[courseData['course_code']] = course
  
# with open('programsRaw.json', 'w') as fp:
#     json.dump(programs, fp)


'''
Initialises dictionary and assigns it to main programs dictionary
'''
def initialiseProgram(programsProcessed, data):

    content = {
        'title': None,
        'UOC': None,
        'studyLevel': None,
        'faculty': None,
        'duration': None,
        'progStructure': []
    }
    courseCode = data['course_code']
    programsProcessed[courseCode] = content
    return courseCode
    
'''
Retrieves data for all undergraduate specialisations 
'''
def getData():
    url = "https://www.handbook.unsw.edu.au/api/es/search"
    payload = {"query":{"bool":{"must":[{"term":{"live":True}},[{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_pcourse.studyLevelValue"],"query":"*ugrd*"}}]}},{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_pcourse.implementationYear"],"query":"*2021*"}}]}},{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_pcourse.active"],"query":"*1*"}}]}}]],"filter":[{"terms":{"contenttype":["unsw_pcourse","unsw_pcourse"]}}]}},"sort":[{"unsw_pcourse.code_dotraw":{"order":"asc"}}],"from":0,"size":249,"track_scores":True,"_source":{"includes":["*.code","*.name","*.award_titles","*.keywords","urlmap","contenttype"],"excludes":["",None]}}

    headers = {
        "content-type": "application/json",
    }

    r = requests.post(url, data=json.dumps(payload), headers=headers)
    json_res = r.json()
    return json_res
    
'''
Assign values to dictionary
'''
def addData(programsProcessed, courseCode, program, data, curriculumStructure):
    prog = programsProcessed[courseCode]
    
    prog['title'] = data.get('title')
    prog['UOC'] = data.get('credit_points')
    prog['studyLevel'] = program.get('studyLevelURL')
    prog['faculty'] = data['parent_academic_org']['value']
    prog['duration'] = data.get('full_time_duration')
    # prog['structure'] = {
    #     'majors' : {},
    #     'minors' : {},
    #     'courses' : {},
    #     'freeElectives' : {},
    #     'generalEducation' : {}
    #     }
    
    format_curriculum(prog['progStructure'], curriculumStructure["container"])

    # addCurriculum(prog['structure'], curriculumStructure)

def format_curriculum(structure, currcontainer):
    for item in currcontainer:
        # structure.append({
        #     "vertical_grouping": item.get('vertical_grouping'),
        #     "title": item["title"],
        #     "description": item.get("description"),
        #     "credit_points": item.get("credit_points"),
        #     "credit_points_max": item.get("credit_points_max"),
        #     "parent_record": item.get("parent_record"),          
        #     "container": [],
        #     "relationship": [] 
        # })
        info = {
            "vertical_grouping": item.get('vertical_grouping'),
            "title": item["title"],
            "description": item.get("description"),
            "credit_points": item.get("credit_points"),
            "credit_points_max": item.get("credit_points_max"),
            "parent_record": item["parent_record"]["value"],          
            "container": [],
            "relationship": [] 
        }
        
        if "relationship" in item and item["relationship"] != []:
            for course in item["relationship"]:
                item = {}
                item["academic_item_code"] = course.get("academic_item_code")
                item["academic_item_credit_points"] = course.get("academic_item_credit_points")
                item["academic_item_name"] = course.get("academic_item_name")
                item["academic_item_type"] = course.get( "academic_item_type")
                item["parent_record"] = course["parent_record"]["value"]
                info["relationship"].append(item)
        
        elif "container" in item and item["container"] != []:
            # Course info in deeper container level, so recurse and repeat
            format_curriculum(info["container"], item["container"])
        
        structure.append(info)
    return structure






def addCurriculum(structure, curriculumStructure):
    """
    something[UOC]
    something[description]
    something[speclist]

    """
    

    # for item in curriculumStructure['container']:
    #     if item["vertical_grouping"]["label"] == "Free Elective":

    #     if item["vertical_grouping"]["label"] == "General Education":
            

    #     if item["vertical_grouping"]["label"] == "Undergraduate Minor":

    #     if item["vertical_grouping"]["label"] == "Undergraduate Major":
            
            



    # structure['majors']
    # structure['minors']
    # structure['freeElectives']

def writeDataToFile():
    """ Extracts, processes and writes program data to file """
    json_res = getData()
    programsProcessed = {}

    for program in json_res['contentlets']:
        if program["studyLevelURL"] != "undergraduate":
            continue
        data = json.loads(program["data"]) 
        curriculumStructure = json.loads(program["CurriculumStructure"])

        courseCode = initialiseProgram(programsProcessed, data)

        addData(programsProcessed, courseCode, program, data, curriculumStructure)


    with open('programsFormattedRaw.json', 'w') as fp:
        json.dump(programsProcessed, fp)


if __name__ == "__main__":
    
    writeDataToFile()

    # json_res = getData()
    # structure = json.loads(json_res['contentlets'][0]["CurriculumStructure"])
    
    # with open('testingBio.json', 'w') as fp:
    #     json.dump(structure, fp)