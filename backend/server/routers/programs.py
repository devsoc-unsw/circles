from fastapi import APIRouter
from server.database import programsCOL
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

router = APIRouter(
    prefix='/programs',
    tags=['programs'],
    responses={404: {"description": "Not found"}}
)

flexEd = ['3778']

@router.get("/")
def specialisations_index():
    return "Index of programs"

@router.get("/getProgram/{code}")
def getProgram(code):
    query = { "code" : code }
    result = programsCOL.find_one(query)
    del result["_id"]

    return result

@router.get("/getDuration/{code}")
def  getDuration(code):
    query = { "code" : code }
    result = programsCOL.find_one(query)

    return { 'duration' : result['duration'] }

@router.get("/getUOC/{code}")
def  getUOC(code):
    query = { "code" : code }
    result = programsCOL.find_one(query)

    return { 'UOC' : result['UOC'] }

@router.get("/getFaculty/{code}")
def  getFaculty(code):
    query = { "code" : code }
    result = programsCOL.find_one(query)

    return { 'faculty' : result['faculty'] }

@router.get("/getDiscipline/{code}")
def getDiscipline(code):
    query = { "code" : code }
    result = programsCOL.find_one(query)

    return result['components']['disciplinary_component']

@router.get("/getDisciplineUOC/{code}")
def getDisciplineUOC(code):
    query = { "code" : code }
    result = programsCOL.find_one(query)

    return { 'UOC' : result['components']['disciplinary_component']['credits_to_complete'] }

@router.get("/getMajors/{code}")
def getMajor(code):
    query = { "code" : code }
    result = programsCOL.find_one(query)

    return { 'majors' : result['components']['disciplinary_component']['Majors'] }

@router.get("/getFreeElectives/{code}")
def getFlex(code):
    query = { "code" : code }
    result = programsCOL.find_one(query)

    return { 'free_electives' : result['components']['FE'] }

@router.get("/getFreeElectivesUOC/{code}")
def getFlexUOC(code):
    query = { "code" : code }
    result = programsCOL.find_one(query)

    return { 'UOC' : result['components']['FE']['credits_to_complete'] }


@router.get("/getGenUOC/{code}")
def getGENUOC(code):
    query = { "code" : code }
    result = programsCOL.find_one(query)

    return { 'UOC' : result['components']['GE']['credits_to_complete'] }

@router.get("/getMinors/{code}")
def getMinors(code):
    query = { "code" : code }
    result = programsCOL.find_one(query)

    if (code in flexEd):
        return { 'minors' : result['components']['FE']['Minors'] }

    return { 'minors' : result['components']['Minors'] } 