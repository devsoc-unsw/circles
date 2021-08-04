from fastapi import APIRouter
from server.database import specialisationsCOL
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

router = APIRouter(
    prefix='/specialisations',
    tags=['specialisations'],
    responses={404: {"description": "Not found"}}
)

@router.get("/")
def specialisations_index():
    return "Index of specialisations"

@router.get("/getSpecialisation/{code}")
def getSpecialisation(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    del result["_id"]

    return result

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
    # for obj in result["curriculum"]:
    #     if obj["type"] == "core":
    #         for courses in obj['courses']:
    #             # print(courses + "\n")
    #             # coreCourses[courses]
    for obj in result['curriculum']:
        if obj['type'] == 'core':
            coreCourses[obj['title']] = obj

    if (len(coreCourses) == 0):
        return "none"

    return coreCourses

@router.get("/getElective/{code}")
def getElective(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    elective = {}
    for obj in result['curriculum']:
        if obj['type'] == 'elective':
            elective[obj['title']] = obj

    if (len(elective) == 0):
        return "none"

    return elective

@router.get("/getOther/{code}")
def getElective(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    other = {}
    for obj in result['curriculum']:
        if obj['type'] == 'other':
            other[obj['title']] = obj

    if (len(other) == 0):
        return "none"

    return other
