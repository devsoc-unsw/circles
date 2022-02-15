import contextlib
from fastapi import APIRouter, HTTPException
from server.database import specialisationsCOL, programsCOL
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
    return {'programs': {'3778': "Computer Science"}}
    return { 'programs' : {q['code']: q['title'] for q in programsCOL.find()} }

@router.get("/getMajors/{programCode}", response_model=majors,
            responses={
                400: {"model": message, "description": "The given program code could not be found in the database"},
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

    return {'majors' : result['components']['SpecialisationData']['Majors']}

@router.get("/getMinors/{programCode}", response_model=minors,
            responses={
                400: {"model": message, "description": "The given program code could not be found in the database"},
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
def getMinors(programCode: str):
    """ fetch all the minors known for a specific program """
    result = programsCOL.find_one({'code' : programCode})

    if not result:
        raise HTTPException(status_code=400, detail="Program code was not found")

    if programCode in minorInFE:
        minors = result['components']['FE']['Minors']
    elif programCode in minorInSpecialisation:
        minors = result['components']['SpecialisationData']['Minors']
    else:
        minors = result['components']['Minors']

    return {'minors' : minors}


def addSpecialisation(structure: dict, code: str, type: str):
    spnResult = specialisationsCOL.find_one({'code': code})
    if not spnResult:
        raise HTTPException(status_code=400, detail=f"{code} of type {type} not found")
    structure[type] = {'name': spnResult['name']}
    for container in spnResult['curriculum']:

        structure[type][container['title']] = {}
        item = structure[type][container['title']]

        item['UOC'] = container['credits_to_complete']

        item['courses'] = {}
        for course, courseObject in container['courses'].items():
            if ' or ' in course:
                for index, c in enumerate(course.split('or')):
                    c = c.strip()
                    item['courses'][c] = courseObject[index]
            else:
                item['courses'][course] = courseObject


@router.get("/getStructure/{programCode}/{major}/{minor}", response_model=Structure,
            responses={
                400: {"model": message, "description": "Uh oh you broke me"},
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
                400: {"model": message, "description": "Uh oh you broke me"},
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
                400: {"model": message, "description": "Uh oh you broke me"},
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
def getStructure(programCode: str, major: Optional[str] = None, minor: Optional[str] = None):
    structure = {}

    if major:
        addSpecialisation(structure, major, 'Major')

    if minor:
        addSpecialisation(structure, minor, 'Minor')

    # add details for program code
    programsResult = programsCOL.find_one({'code': programCode})
    if not programsResult:
        raise HTTPException(status_code=400, detail="Program code was not found")

    structure['General'] = {}
    for container, containerObject in programsResult['components']['NonSpecialisationData'].items():
        containerObject['UOC'] = containerObject['credits_to_complete'] if "credits_to_complete" in containerObject else -1

        with contextlib.suppress(KeyError):
            del containerObject["type"]
            del containerObject["credits_to_complete"]
        structure['General'][container] = containerObject
    with contextlib.suppress(KeyError):
        structure['General']['Flexible Education'] = {'UOC': programsResult['components']['FE']['credits_to_complete']}
        structure['General']['General Education'] = {'UOC': programsResult['components']['GE']['credits_to_complete']}

    return {'structure': structure}
