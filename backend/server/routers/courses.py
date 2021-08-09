from fastapi import APIRouter
from server.database import coursesCOL
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

router = APIRouter(
    prefix='/courses',
    tags=['courses'],
    responses={404: {"description": "Not found"}}
)

@router.get("/")
def courses_index():
    return "Index of courses"

@router.get("/getCourses/{code}")
def getCourses(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)
    del result["_id"]

    return result

@router.get("/getTitle/{code}")
def getTitle(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)
    
    return { "title" : result['title'] }

@router.get("/getUOC/{code}")
def getUOC(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)
    
    return { "UOC" : result['uoc'] }

@router.get("/getLevel/{code}")
def getUOC(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)
    
    return { "level" : result['level'] }

@router.get("/getEquivalent/{code}")
def getEquivalent(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    equivalent = {}
    for obj in result['equivalents']:
        equivalent[obj] = 1

    if (len(equivalent) == 0):
        return { 'equivalent' : 'none' }

    return { 'equivalent' : equivalent }

@router.get("/getExclusions/{code}")
def getExclusion(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    exclusions = {}
    for obj in result['exclusions']:
        exclusions[obj] = 1

    if (len(exclusions) == 0):
        return { 'exclusions' : 'none' }

    return { 'exclusions' : exclusions }

@router.get("/getPathTo/{code}")
def getPathTo(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    pathTo = {}
    for obj in result['path_to']:
        pathTo[obj] = 1

    if (len(pathTo) == 0):
        return { 'pathTo' : 'none' }

    return { 'pathTo' : pathTo}

@router.get("/getPathFrom/{code}")
def getPathFrom(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    pathFrom = {}
    for obj in result['path_from']:
        pathFrom[obj] = 1

    if (len(pathFrom) == 0):
        return { 'pathFrom' : 'none' }

    return { 'pathFrom' : pathFrom }

@router.get("/isGenEd/{code}")
def isGenEd(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    if (result['gen_ed'] == 0):
        return { 'isGenEd' : 'false' }
    else:
        return { 'isGenEd' : 'true' }

@router.get("/getTerms/{code}")
def getTerms(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    terms = []
    for obj in result['terms']:
        terms.append(obj)

    return { 'terms' : terms }

@router.get("/getDescription/{code}")
def getDescription(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    return { 'description' : result['description'] }
        
