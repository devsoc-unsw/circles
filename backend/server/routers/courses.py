from fastapi import APIRouter
from server.database import coursesCOL
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

router = APIRouter(
    prefix='/courses',
    tags=['courses'],
    responses={404: {"description": "Not found"}}
    # responses={404: {"model": message, "description": "The course was not found"}}
)

class message(BaseModel):
    message: str

class course(BaseModel):
    title: str
    code: str
    UOC: int
    level: int
    description: str
    equivalents: dict
    exclusions: dict
    path_to: dict
    terms: list
    gen_ed: int
    path_from: dict

class title(BaseModel):
    title: str

class UOC(BaseModel):
    UOC: int

class level(BaseModel):
    level: int

class equivalent(BaseModel):
    equivalent: dict

class exclusions(BaseModel):
    exclusions: dict

class pathTo(BaseModel):
    path_to: dict

class pathFrom(BaseModel):
    path_from: dict

class terms(BaseModel):
    terms: list

class description(BaseModel):
    description: str

class isGenEd(BaseModel):
    gen_ed: bool

@router.get("/")
def courses_index():
    return "Index of courses"

@router.get("/getCourses/{code}", response_model=course,
            responses={
                404: {"model": message, "description": "The course was not found"},
                200: {
                    "description": "Returns all details requested by course code",
                    "content": {
                        "application/json": {
                            "example": {
                                "title": "Accounting and Financial Management 1A",
                                "code": "ACCT1501",
                                "UOC": 6,
                                "level": 1,
                                "description": "<p>The compulsory core accounting unit will have a preparer perspective. It will provide an introduction to basic concepts in accounting and their application for decision making by a wide range of potential users (e.g., shareholders, investment analysts, lenders, managers etc). This unit should benefit students who wish to specialise in accounting, and will also be of value to students whose primary interest lies elsewhere in the field of business.</p>\n<p>On completion, students should have a clear understanding of the accounting process and the language of accounting to enable communication with an accounting professional, understand the relevance of accounting information for informed decision making by a wide range of potential users, and have the ability to analyse and interpret accounting information. Topics covered will include the accounting equation, general purpose financial reports, cash and accrual accounting, adjustments, internal control, financial statement analysis, and interpreting and preparing information for managers to use in planning, decision making and control.</p>",
                                "equivalents": {
                                    "DPBS1501": 1
                                },
                                "exclusions": {
                                    "COMM1140": 1
                                },
                                "path_to": {
                                    "ACCT1511": 1,
                                    "ACCT2672": 1,
                                    "RISK2001": 1,
                                    "RISK2002": 1,
                                    "RISK3003": 1
                                },
                                "terms": [
                                    "T1"
                                ],
                                "gen_ed": 0,
                                "path_from": {}
                            }
                        }
                    }
                }
            })
def getCourses(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    if result:
        del result["_id"]
        return result
    else:
        return JSONResponse(status_code=404, content={"message" : "Course was not found"})

@router.get("/getTitle/{code}", response_model=title,
            responses={
                404:{"model": message, "description": "The course was not found"},
                200: {
                    "description": "Course title requested by code",
                    "content": {
                        "application/json": {
                            "example": {"title": "Accounting and Financial Management 1A"}
                        }
                    }  
                }
            }
)
def getTitle(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)
    if result:
        return { "title" : result['title'] }
    else:
        return JSONResponse(status_code=404, content={"message" : "Course not found"})

@router.get("/getUOC/{code}", response_model=UOC,
            responses={
                404:{"model": message, "description": "The course was not found"},
                200: {
                    "description": "Course UOC requested by code",
                    "content": {
                        "application/json": {
                            "example": {"UOC": "6"}
                        }
                    }  
                }
            }
)
def getUOC(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)
    
    if result:
        return { "UOC" : result['UOC'] }
    else:
        return JSONResponse(status_code=404, content={"message" : "Course not found"})

@router.get("/getLevel/{code}",response_model=level,
            responses={
                404:{"model": message, "description": "The course was not found"},
                200: {
                    "description": "Course level requested by code",
                    "content": {
                        "application/json": {
                            "example": {"level": "1"}
                        }
                    }  
                }
            }
)
def getUOC(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)
    
    if result:
        return { "level" : result['level'] }
    else:
        return JSONResponse(status_code=404, content={"message" : "Course not found"})

@router.get("/getEquivalent/{code}", response_model=equivalent,
            responses={
                404:{"model": message, "description": "The course was not found"},
                200: {
                    "description": "Equivalent courses requested by code",
                    "content": {
                        "application/json": {
                            "example": {"equivalents": {
                                        "DPBS1501": 1
                                }}
                        }
                    }  
                }
            }
)
def getEquivalent(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    if not result:
        return JSONResponse(status_code=404, content={"message" : "Course not found"})

    equivalent = {}
    for obj in result['equivalents']:
        equivalent[obj] = 1

    return { 'equivalent' : equivalent }

@router.get("/getExclusions/{code}", response_model=exclusions)
def getExclusion(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    exclusions = {}
    for obj in result['exclusions']:
        exclusions[obj] = 1

    if (len(exclusions) == 0):
        return { 'exclusions' : 'none' }

    return { 'exclusions' : exclusions }

@router.get("/getPathTo/{code}", response_model=pathTo)
def getPathTo(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    pathTo = {}
    for obj in result['path_to']:
        pathTo[obj] = 1

    if (len(pathTo) == 0):
        return { 'pathTo' : 'none' }

    return { 'pathTo' : pathTo}

@router.get("/getPathFrom/{code}", response_model=pathFrom)
def getPathFrom(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    pathFrom = {}
    for obj in result['path_from']:
        pathFrom[obj] = 1

    if (len(pathFrom) == 0):
        return { 'pathFrom' : 'none' }

    return { 'pathFrom' : pathFrom }

@router.get("/isGenEd/{code}", response_model=isGenEd)
def isGenEd(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    if (result['gen_ed'] == 0):
        return { 'gen_ed' : False }
    else:
        return { 'gen_ed' : True }

@router.get("/getTerms/{code}", response_model=terms)
def getTerms(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    terms = []
    for obj in result['terms']:
        terms.append(obj)

    return { 'terms' : terms }

@router.get("/getDescription/{code}", response_model=description)
def getDescription(code):
    query = { "code" : code }
    result = coursesCOL.find_one(query)

    return { 'description' : result['description'] }
        
