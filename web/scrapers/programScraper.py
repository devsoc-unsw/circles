# Scraping programs data and putting it inside programsRaw.json
import requests
import json
import ast



# for course in json_res['contentlets']:
#   courseData = json.loads(course["data"])
#   programs[courseData['course_code']] = course
  
# with open('programsRaw.json', 'w') as fp:
#     json.dump(programs, fp)



def initialiseProgram(programsProcessed, data):

    content = {
        'title': None,
        'UOC': None,
        'studyLevel': None,
        'faculty': None,
        'duration': None,
        'courseList': None
    }
    courseCode = data['course_code']
    programsProcessed[courseCode] = content
    return courseCode

def getData():
    url = "https://www.handbook.unsw.edu.au/api/es/search"
    payload = {"query":{"bool":{"must":[{"term":{"live":True}},[{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_pcourse.studyLevelValue"],"query":"*ugrd*"}}]}},{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_pcourse.implementationYear"],"query":"*2021*"}}]}},{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_pcourse.active"],"query":"*1*"}}]}}]],"filter":[{"terms":{"contenttype":["unsw_pcourse","unsw_pcourse"]}}]}},"sort":[{"unsw_pcourse.code_dotraw":{"order":"asc"}}],"from":0,"size":249,"track_scores":True,"_source":{"includes":["*.code","*.name","*.award_titles","*.keywords","urlmap","contenttype"],"excludes":["",None]}}

    headers = {
        "content-type": "application/json",
    }

    r = requests.post(url, data=json.dumps(payload), headers=headers)
    json_res = r.json()
    return json_res

def addData(programsProcessed, courseCode, program, data, curriculumStructure):
    prog = programsProcessed[courseCode]
    
    prog['title'] = data.get('title')
    prog['UOC'] = data.get('credit_points')
    prog['studyLevel'] = program.get('studyLevelURL')
    prog['faculty'] = data['parent_academic_org']['value']
    prog['duration'] = data.get('full_time_duration')



def writeDataToFile():
    """ Extracts, processes and writes program data to file """
    json_res = getData()
    programsProcessed = {}

    for program in json_res['contentlets']:

        data = json.loads(program["data"]) 
        curriculumStructure = json.loads(program["CurriculumStructure"])

        courseCode = initialiseProgram(programsProcessed, data)

        addData(programsProcessed, courseCode, program, data, curriculumStructure)


    with open('programsProcessed.json', 'w') as fp:
        json.dump(programsProcessed, fp)


if __name__ == "__main__":
    writeDataToFile()