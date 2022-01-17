from fastapi import APIRouter
from server.database import specialisationsCOL, programsCOL

router = APIRouter(
    prefix='/specialisations',
    tags=['specialisations'],
    responses={404: {"description": "Not found"}}
)

@router.get("/")
def specialisations_index():
    return "Index of specialisations"

@router.get("/getPrograms/")
def getPrograms():
    query = programsCOL.find()
    result = {}
    for i in query:
        result[i['code']] = i['title']

    return {'programs' : result}

@router.get("/getMajor/{code}")
def getSpecialisations(code):
    query = {'code' : code}
    result = programsCOL.find_one(query)
    specialisations = {}
    specialisations = result['components']['disciplinary_component']['Majors']

    for i in specialisations:
        query2 = { 'code' : i }
        result2 = specialisationsCOL.find_one(query2)

        if (result2):
            specialisations[i] = result2['name']

    return {'majors' : specialisations}

# @router.get("/getSpecialisation/{code}")
# def getSpecialisation(code):
#     query = { "code" : code }
#     result = specialisationsCOL.find_one(query)
#     del result["_id"]

#     return result

@router.get("/getProgramCode/{code}")
def getCode(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    return { "programs" : result["programs"] }

@router.get("/getUOC/{code}")
def getUOC(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    return { "UOC" : result["UOC"] }

@router.get("/getType/{code}")
def getType(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    return { "type" : result["type"] }

@router.get("/getCore/{code}")
def getCore(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    coreCourses = {}
    for obj in result['curriculum']:
        if obj['type'] == 'core':
            coreCourses[obj['title']] = obj

    if (len(coreCourses) == 0):
        return { 'core' : None }

    return { 'core' : coreCourses }

@router.get("/getElective/{code}")
def getElective(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    elective = {}
    for obj in result['curriculum']:
        if obj['type'] == 'elective':
            elective[obj['title']] = obj

    if (len(elective) == 0):
        return { 'elective' : None }

    return { 'elective' : elective }

@router.get("/getOther/{code}")
def getElective(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    other = {}
    for obj in result['curriculum']:
        if obj['type'] == 'other':
            other[obj['title']] = obj

    if (len(other) == 0):
        return { 'other' : None }

    return { 'other' : other }


# Programs -> Specialisations -> Courses

# Select Program 3778 Computer Science
# Chose COMPA1
