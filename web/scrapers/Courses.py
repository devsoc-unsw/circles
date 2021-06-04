import requests
import json

'''
Under ['data']:
    equivalents and exclusions unsolved
        keepList = ['eqivalents', 'exclusion']

    May need faculty
        faculty_detail

    Assessments might be useful
        hb_assessments

    Delivery
        hb_delivery_variations

    Entry item unclear
        hb_entries
    
    key words and links unclear
        keywords
        links
    
    offering detail
        offering_detail

    Miscellaneous
        parent_academic_org
        parent_id
        unit_learning_outcomes
        unit_offering
            include fee
        collaborating_disciplines
        contact_hours
        credit_points_header
        effective_date
        implementation_year
        timetableURL
    
    Confusing items:
        pre_requisites
        requisites
        study_level_single
        study_level_tooltip
        pre_requisites
        requisites
'''

#keepList = ['code', 'title','creditPoints','data',"description","educationalArea","effectiveDate","generalEducation","implementationYear","keywords","languageId","level","levelNumber","locked","modDate","specialUnitType","studyLevel","version","URL_MAP_FOR_CONTENT"]
keepList4data = ['attributes', 'campus', 'code', 'credit_points', 'description', 'enrolment_rules', 'search_title', 'study_level', 'title', 'offering_detail']

# keep certain items in one dictionary
def keep(data, keepList):
    data = {k:v for k,v in data.items() if k in keepList}
    return data

# keep certain items in a list of dictionaries
def select(data, keepList):
    for i,v in enumerate(data):
        data[i] = keep(data[i], keepList)
    return data

# Convert List of single-valued dictionaries to List of String
def peel(data, key):
    data = [i[key] for i in data]
    return data

# Convert List of dictionary to List of String
def pick(data, key):
    data = select(data, key)
    data = peel(data, key)
    return data


# Return all course data
def getCourses(size = 10000, begin = 0, onlyContent = True):
    url = "https://www.handbook.unsw.edu.au/api/es/search"
    payload = {"query":{"bool":{"must":[{"term":{"live":True}},[{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_psubject.implementationYear"],"query":"*2021*"}}]}},{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_psubject.studyLevelValue"],"query":"*ugrd*"}}]}},{"bool":{"minimum_should_match":"100%","should":[{"query_string":{"fields":["unsw_psubject.active"],"query":"*1*"}}]}}]],"filter":[{"terms":{"contenttype":["unsw_psubject"]}}]}},"sort":[{"unsw_psubject.code_dotraw":{"order":"asc"}}],"from":begin,"size":size,"track_scores":True,"_source":{"includes":["*.code","*.name","*.award_titles","*.keywords","urlmap","contenttype"],"excludes":["",None]}}
    headers = {"content-type": "application/json",}
    r = requests.post(url, data=json.dumps(payload), headers=headers)
    data = r.json()

    if onlyContent:
        data = data['contentlets']
    return data

# Return list of course names
def getCourseNames():
    data = getCourses()
    data = pick(data, 'code')
    return data

def getCourseData():
    data = getCourses()
    keepList = ['data']
    data = select(data, keepList)

    for i,v in enumerate(data):
        data[i] = data[i]['data']
        data[i] = json.loads(data[i])
        data[i] = keep(data[i], keepList4data)
        del data[i]['offering_detail']
        data[i]['terms'] = data[i]['offering_detail']['offering_terms']

    return data

def getEnrolmentRules():
    data = getCourseData()
    data = pick(data, 'enrolment_rules')
    for i,v in enumerate(data):
        data[i] = pick(data[i], 'description')
        if data[i] == []:
            data[i] = None
        else:
            data[i] = data[i][0]
    return data

def runTheTest():
    data = getCourseData()
    print("Course scrape done")
    return data
    '''
    rules = getEnrolmentRules()
    names = getCourseNames()
    data = {}
    for r, n in zip(rules, names):
        data[n] = r
    return data
    '''