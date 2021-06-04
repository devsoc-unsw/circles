# Scraping programs data and putting it inside programsRaw.json
import requests
import json
import ast

url = "https://www.handbook.unsw.edu.au/api/es/search"
payload = {"query":{"bool":{"must":[{"term":{"live":True}},[{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_pcourse.studyLevelValue"],"query":"*ugrd*"}}]}},{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_pcourse.implementationYear"],"query":"*2021*"}}]}},{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_pcourse.active"],"query":"*1*"}}]}}]],"filter":[{"terms":{"contenttype":["unsw_pcourse","unsw_pcourse"]}}]}},"sort":[{"unsw_pcourse.code_dotraw":{"order":"asc"}}],"from":0,"size":249,"track_scores":True,"_source":{"includes":["*.code","*.name","*.award_titles","*.keywords","urlmap","contenttype"],"excludes":["",None]}}

headers = {
    "content-type": "application/json",
}

r = requests.post(url, data=json.dumps(payload), headers=headers)
json_res = r.json()



programs = {
  # program code: {
  #   data: {
  #     // important stuff
  #   }
  # }
}

for course in json_res['contentlets']:
  courseData = json.loads(course["data"])
  programs[courseData['course_code']] = course
  
with open('programsRaw.json', 'w') as fp:
    json.dump(programs, fp)



# with open('programsRaw.json') as f:
#     data = f.read()
# data = json.loads(data)


for course in json_res['contentlets']:

  content = {
    'title': None,
    'UOC': None,
    'studyLevel': None,
    'faculty': None,
    'duration': None,
    'courseList': None
  }

  courseData = json.loads(course["data"])
  courseStructure = json.loads(course["CurriculumStructure"])
  content['title'] = courseData['title'] 
  content['UOC'] = courseData['credit_points']
  content['studyLevel'] = course['studyLevelURL'] 
  content['faculty'] = courseData['parent_academic_org']['value']
  content['duration'] = courseData['full_time_duration']

  programs[courseData['course_code']] = content
    


with open('programsProcessed.json', 'w') as fp:
    json.dump(programs, fp)