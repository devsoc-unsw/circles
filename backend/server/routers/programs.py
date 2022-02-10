from fastapi import APIRouter, HTTPException
from server.database import specialisationsCOL, programsCOL
from fastapi.responses import JSONResponse
from server.routers.model import *


router = APIRouter(
    prefix='/programs',
    tags=['programs'],
)


@router.get("/")
def programsIndex():
    return "Index of programs"

@router.get("/getPrograms", response_model=programs,
            responses={
                404: {"model": message, "description": "Something very wrong happened"},
                200: {
                    "description": "Returns all programs",
                    "content": {
                        "application/json": {
                            "example": {
                                "programs": {
                                    "3502": "Commerce",
                                    "3707": "Engineering (Honours)",
                                    "3778": "Computer Science",
                                    "3970": "Science"
                                }
                            }
                        }
                    }
                }
            })
def getPrograms():
    """ fetch all the programs the backend knows about in the format of { code: title }"""
    return { 'programs' : {q['code']: q['title'] for q in programsCOL.find()} }

@router.get("/getMajors/{programCode}", response_model=majors,
            responses={
                404: {"model": message, "description": "The given program code could not be found in the database"},
                200: {
                    "description": "Returns all majors to the given code",
                    "content": {
                        "application/json": {
                            "example": {
                                "majors": {
                                    "COMPS1": "Computer Science (Embedded Systems)",
                                    "COMPJ1": "Computer Science (Programming Languages)",
                                    "COMPE1": "Computer Science (eCommerce Systems)",
                                    "COMPA1": "Computer Science",
                                    "COMPN1": "Computer Science (Computer Networks)",
                                    "COMPI1": "Computer Science (Artificial Intelligence)",
                                    "COMPD1": "Computer Science (Database Systems)",
                                    "COMPY1": "Computer Science (Security Engineering)"
                                }
                            }
                        }
                    }
                }
            })
def getMajors(programCode: str):
    """ fetch all the majors known to the backend for a specific program """
    result = programsCOL.find_one({'code' : programCode})

    if not result:
        raise HTTPException(status_code=400, detail="Program code was not found")

    majors = result['components']['SpecialisationData']['Majors']

    for major in majors:
        major_details = specialisationsCOL.find_one({'code' : major})

        if major_details:
            majors[major] = major_details['name']

    return {'majors' : majors}

@router.get("/getMinors/{programCode}", response_model=minors,
            responses={
                404: {"model": message, "description": "The given program code could not be found in the database"},
                200: {
                    "description": "Returns all minors to the given code",
                    "content": {
                        "application/json": {
                            "example": {
                                "minors": {
                                    "INFSA2": 1,
                                    "ACCTA2": 1,
                                    "PSYCM2": 1,
                                    "MARKA2": 1,
                                    "FINSA2": 1,
                                    "MATHC2": 1
                                }
                            }
                        }
                    }
                }
            })
def getMinors(programCode):
    """ fetch all the minors known for a specific program """
    result = programsCOL.find_one({'code' : programCode})

    if not result:
        raise HTTPException(status_code=404, detail="Program code was not found")

    if programCode in minorInFE:
        minors = result['components']['FE']['Minors']
    elif programCode in minorInSpecialisation:
        minors = result['components']['SpecialisationData']['Minors']
    else:
        minors = result['components']['Minors']

    for minor in minors:
        minor_details = specialisationsCOL.find_one({'code' : minor})

        if minor_details:
            minors[minor] = minor_details['name']

    return {'minors' : minors}


def addSpecialisation(structure: dict, code: str, type: str):
    spnResult = specialisationsCOL.find_one({'code': code})
    if not spnResult:
        raise HTTPException(status_code=404, detail=f"{code} of type {type} not found")
    structure[type] = {'name': spnResult['name']}
    for container in spnResult['curriculum']:

        structure[type][container['title']] = {}
        item = structure[type][container['title']]

        item['UOC'] = container['credits_to_complete']

        item['courses'] = {}
        for course in container['courses']:
            if ' or ' in course:
                for index, c in enumerate(course.split(' or ')):
                    item['courses'][c] = container['courses'][course][index]
            else:
                item['courses'][course] = container['courses'][course]


@router.get("/getStructure/{programCode}/{major}/{minor}", response_model=Structure,
            responses={
                404: {"model": message, "description": "Uh oh you broke me"},
                200: {
                    "description": "Returns the program structure",
                    "content": {
                        "application/json": {
                            "example": {
                                "Major": {
                                    "Core Courses": {
                                        "UOC": 66,
                                        "courses": {
                                            "COMP3821": "Extended Algorithms and Programming Techniques",
                                            "COMP3121": "Algorithms and Programming Techniques",
                                        }
                                    },
                                    "Computing Electives": {
                                        "UOC": 30,
                                        "courses": {
                                            "ENGG4600": "Engineering Vertically Integrated Project",
                                            "ENGG2600": "Engineering Vertically Integrated Project",
                                        }
                                    }
                                },
                                "Minor": {
                                    "Prescribed Electives": {
                                        "UOC": 12,
                                        "courses": {
                                            "FINS3616": "International Business Finance",
                                            "FINS3634": "Credit Analysis and Lending",
                                        }
                                    },
                                    "Core Courses": {
                                        "UOC": 18,
                                        "courses": {
                                            "FINS2613": "Intermediate Business Finance",
                                            "COMM1180": "Value Creation",
                                            "FINS1612": "Capital Markets and Institutions"
                                        }
                                    }
                                },
                                "General": {
                                    "GeneralEducation": {
                                        "UOC": 12
                                    },
                                    "FlexEducation": {
                                        "UOC": 6
                                    },
                                    "BusinessCoreCourses": {
                                        "UOC": 6,
                                        "courses": {
                                            "BUSI9999": "How To Business"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
@router.get("/getStructure/{programCode}/{major}", response_model=Structure,
            responses={
                404: {"model": message, "description": "Uh oh you broke me"},
                200: {
                    "description": "Returns the program structure",
                    "content": {
                        "application/json": {
                            "example": {
                                "Major": {
                                    "Core Courses": {
                                        "UOC": 66,
                                        "courses": {
                                            "COMP3821": "Extended Algorithms and Programming Techniques",
                                            "COMP3121": "Algorithms and Programming Techniques",
                                        }
                                    },
                                    "Computing Electives": {
                                        "UOC": 30,
                                        "courses": {
                                            "ENGG4600": "Engineering Vertically Integrated Project",
                                            "ENGG2600": "Engineering Vertically Integrated Project",
                                        }
                                    }
                                },
                                "General": {
                                    "GeneralEducation": {
                                        "UOC": 12
                                    },
                                    "FlexEducation": {
                                        "UOC": 6
                                    },
                                    "BusinessCoreCourses": {
                                        "UOC": 6,
                                        "courses": {
                                            "BUSI9999": "How To Business"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
@router.get("/getStructure/{programCode}", response_model=Structure,
            responses={
                404: {"model": message, "description": "Uh oh you broke me"},
                200: {
                    "description": "Returns the program structure",
                    "content": {
                        "application/json": {
                            "example": {
                                "General": {
                                    "GeneralEducation": {
                                        "UOC": 12
                                    },
                                    "FlexEducation": {
                                        "UOC": 6
                                    },
                                    "BusinessCoreCourses": {
                                        "UOC": 6,
                                        "courses": {
                                            "BUSI9999": "How To Business"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
def getStructure(programCode, major=None, minor=None):
    structure = {}

    if major:
        addSpecialisation(structure, major, 'Major')

    if minor:
        addSpecialisation(structure, minor, 'Minor')

    # add details for program code
    programsResult = programsCOL.find_one({'code': programCode})
    if not programsResult:
        raise HTTPException(status_code=404, detail="Program code was not found")

    structure['General'] = {}
    for container, containerObeject in programsResult['components']['NonSpecialisationData'].items():

        structure['General'][container] = {}
        myContainer = structure['General'][container]

        # Not all program containers have credit points associated with them
        myContainer['UOC'] = containerObeject['credits_to_complete'] if "credits_to_complete" in containerObeject else -1

        for course, title in programsResult['components']['NonSpecialisationData'][container].items():
            # Add course data: e.g. { "COMP1511": "Programming Fundamentals"  }
            if course == "type" or course == "credits_to_complete":
                continue
            myContainer[course] = title

    if 'FE' in programsResult['components']:
        structure['General']['FlexEducation'] = {'UOC': programsResult['components']['FE']['credits_to_complete'],
                                                    'description': f'students can take a maximum of {programsResult["components"]["FE"]["credits_to_complete"]} UOC of free electives'}
    if 'GE' in programsResult['components']:
        structure['General']['GeneralEducation'] = {'UOC': programsResult['components']['GE']['credits_to_complete'],
                                                    'description': 'any general education course'}

    return {'structure': structure}
