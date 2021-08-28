from fastapi import APIRouter
from server.database import specialisationsCOL, programsCOL, coursesCOL
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

router = APIRouter(
    prefix='/api',
    tags=['api'],
)

minorInFE = ['3778']
minorInSpecialisation = ['3502', '3970']


@router.get("/")
def specialisations_index():
    return "Index of api"

@router.get("/getPrograms")
def getPrograms():
    query = programsCOL.find();
    result = {}
    for i in query:
        result[i['code']] = i['title']

    return {'programs' : result}

@router.get("/getMajors/{code}")
def getMajors(code):
    query = {'code' : code}
    result = programsCOL.find_one(query)
    majors = {}
    majors = result['components']['SpecialisationData']['Majors']

    for i in majors:
        query2 = {'code' : i}
        result2 = specialisationsCOL.find_one(query2)

        if (result2):
            majors[i] = result2['name']

    return {'majors' : majors}


# Test the ? thing Hayes told me about
@router.get("/getMinors/{code}")
def getMinors(code):
    query = {'code' : code}
    result = programsCOL.find_one(query)
    minors = {}

    if (code in minorInFE):
        minors = result['components']['FE']['Minors']
    elif (code in minorInSpecialisation):
        minors = result['components']['SpecialisationData']['Minors']
    else:
        minors = result['components']['Minors']

    for i in minors:
        query2 = {'code' : i}
        result2 = specialisationsCOL.find_one(query2)

        if (result2):
            minors[i] = result2['name']

    return {'minors' : minors}        

@router.get("/getProgramCourses/{code}")
def getProgramCourses(code):
    query = {'code' : code}
    result = programsCOL.find_one(query)
    courses = {}

    for i in result['components']['NonSpecialisationData']:
        for j in result['components']['NonSpecialisationData'][i]:
            if (len(j) == 8):
                courses[j] = result['components']['NonSpecialisationData'][i][j]

    for i in courses:
        query2 = {'code' : i}
        result2 = coursesCOL.find_one(query2)

        if (result2):
            courses[i] = result2['title']

    return {'courses' : courses}

@router.get("/getCoreCourses/{code}")
def getCoreCourses(code):
    query = {'code' : code}
    result = specialisationsCOL.find_one(query)
    courses = {}

    for i in result['curriculum']:
        if (i['type'] == 'core'):
            for course in i['courses']:
                if (len(course) == 8):
                    courses[course] = 1
                else:
                    if ' or ' in course:
                        courseList = course.split(' or ')
                        print(courseList)
                        for j in courseList:
                            courses[j] = 1

    for i in courses:
        query2 = {'code' : i}
        result2 = coursesCOL.find_one(query2)

        if (result2):
            courses[i] = result2['title']

    return {'core' : courses}

@router.get("/getCourse/{code}")
def getCourse(code):
    query = {'code' : code}
    result = coursesCOL.find_one(query)

    del result['_id']

    return {'course' : result}