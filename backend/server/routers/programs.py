"""
API for fetching data about programs and specialisations
"""
import contextlib
import re
from typing import Optional

from fastapi import APIRouter, HTTPException
from server.database import programsCOL, specialisationsCOL
from server.routers.model import (Structure, Majors, message, minorInFE,
                                  minorInSpecialisation, minors, programs)
from server.routers.courses import regex_search
<<<<<<< HEAD
from data.processors.programs_processing import TEST_PROGS
=======
>>>>>>> dev

router = APIRouter(
    prefix="/programs",
    tags=["programs"],
)


@router.get("/")
def programsIndex():
    """ sanity test that this file is loaded """
    return "Index of programs"


@router.get(
    "/getPrograms",
    response_model=programs,
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
                            "3970": "Science",
                        }
                    }
                }
            },
        }
    },
)
def getPrograms():
    """ Fetch all the programs the backend knows about in the format of { code: title } """
    # return {"programs": {q["code"]: q["title"] for q in programsCOL.find()}}
    # TODO On deployment, DELETE RETURN BELOW and replace with the return above
<<<<<<< HEAD
    return {"programs": {"3778": "Computer Science", 
                        "3784": "Commerce / Computer Science",
=======
    return {"programs": {"3778": "Computer Science",
                        "3784": "Commerce / Computer Science",
                        "3502": "Commerce"
>>>>>>> dev
                        }}


@router.get(
    "/getMajors/{programCode}",
    response_model=Majors,
    responses={
        400: {
            "model": message,
            "description": "The given program code could not be found in the database",
        },
        200: {
            "description": "Returns all majors to the given code",
            "content": {
                "application/json": {
                    "example": {
<<<<<<< HEAD
                        "majors": { 
                            "Computer Science": {
                                "COMPS1": "Computer Science (Embedded Systems)",
                                "COMPJ1": "Computer Science (Programming Languages)",
                                "COMPE1": "Computer Science (eCommerce Systems)",
                                "COMPA1": "Computer Science",
                                "COMPN1": "Computer Science (Computer Networks)",
                                "COMPI1": "Computer Science (Artificial Intelligence)",
                                "COMPD1": "Computer Science (Database Systems)",
                                "COMPY1": "Computer Science (Security Engineering)",
                            },
                            "Commerce": {
                                "FINSA1": "Finance",
                                "ACCTA1": "Accounting",
=======
                        "majors": {
                            "Computer Science": {
                                "specs": {
                                    "COMPS1": "Computer Science (Embedded Systems)",
                                    "COMPJ1": "Computer Science (Programming Languages)",
                                    "COMPE1": "Computer Science (eCommerce Systems)",
                                    "COMPA1": "Computer Science",
                                    "COMPN1": "Computer Science (Computer Networks)",
                                    "COMPI1": "Computer Science (Artificial Intelligence)",
                                    "COMPD1": "Computer Science (Database Systems)",
                                    "COMPY1": "Computer Science (Security Engineering)",
                                },
                                "note": "COMPA1 is the default stream, and will be used if no other stream is selected."
>>>>>>> dev
                            }
                        }
                    }
                }
            },
        },
    },
)
def getMajors(programCode: str):
    """ Fetch all the majors known to the backend for a specific program """
    result = programsCOL.find_one({"code": programCode})

    if not result:
        raise HTTPException(
            status_code=400, detail="Program code was not found")

    return {"majors": result["components"]["spec_data"]["majors"]}


@router.get(
    "/getMinors/{programCode}",
    response_model=minors,
    responses={
        400: {
            "model": message,
            "description": "The given program code could not be found in the database",
        },
        200: {
            "description": "Returns all minors to the given code",
            "content": {
                "application/json": {
                    "example": {
                        "minors": {
                            "Computer Science": { 
                                "specs": {
                                    "INFSA2": "<name of minor>",
                                    "ACCTA2": "<name of minor>",
                                    "PSYCM2": "<name of minor>",
                                    "MARKA2": "<name of minor>",
                                    "FINSA2": "<name of minor>",
                                    "MATHC2": "<name of minor>",
                                },
                                "notes": "Optional minors available include the following. If you complete a minor of 30 UOC, you will also need to take 6 UOC of free electives.",
                            },
                        }
                    }
                }
            },
        },
    },
)


def getMinors(programCode: str):
    """ Fetch all the minors known for a specific program """
    result = programsCOL.find_one({"code": programCode})

    if not result:
        raise HTTPException(
            status_code=400, detail="Program code was not found")

    # NOTE: DO NOT RENAME THE VARIABLE TO `minors` as it attempts to create
    # a redefinition of the `minors` class
<<<<<<< HEAD
    if programCode in minorInFE:
        minrs = result["components"]["FE"]["Minors"]
    elif programCode in minorInSpecialisation:
        minrs = result["components"]["SpecialisationData"]["Minors"]
    else:
        minrs = result["components"]["SpecialisationData"]["Minors"]

    return {"minors": minrs}

def convertSubgroupObjectToCoursesDict(object: str, description: str|list[str]) -> dict[str, str]:
    """ Gets a subgroup object (format laid out in the processor) and fetches the exact courses its referring to """
    if " or " in object:
        return {c: description[index] for index, c in enumerate(object.split(" or "))}
    elif not re.match(r"[A-Z]{4}[0-9]{4}", object):
        return regex_search(object)
    else:
        return {object: description}

def addSubgroupContainer(structure: dict, type: str, container: dict, exceptions: list[str]) -> list[str]:
    """ Returns the added courses """
    structure[type][container["title"]] = {}
    item = structure[type][container["title"]]
=======
    minrs = result["components"]["spec_data"].get("minors")

    return {"minors": minrs}

def convertSubgroupObjectToCoursesDict(object: str, description: str|list[str]):#-> dict[str, str]:
    """ Gets a subgroup object (format laid out in the processor) and fetches the exact courses its referring to """
    if " or " in object:
        return {c: description[index] for index, c in enumerate(object.split(" or "))}
    if not re.match(r"[A-Z]{4}[0-9]{4}", object):
        return regex_search(object)

    return {object: description}
>>>>>>> dev

def addSubgroupContainer(structure: dict, type: str, container: dict, exceptions: list[str]) -> list[str]:
    """ Returns the added courses """
    #TODO: further standardise non_spec_data to remove these line:
    title = container.get("title")
    if container.get("type") == "gened":
        title = "General Education"
    
    # don't do anything if it's info_rule or limit_rule
    if container.get("type") is not None and "rule" in container.get("type"):
        return []

    structure[type][title] = {}
    item = structure[type][title]
    item["UOC"] = container.get("credits_to_complete") if container.get("credits_to_complete") is not None else 0
    item["courses"] = {}

    if container.get("courses") is None:
        return []

    for object, description in container["courses"].items():
        item["courses"] = item["courses"] | {
            course: description for course, description
            in convertSubgroupObjectToCoursesDict(object, description).items()
            if course not in exceptions
        }

    return list(item["courses"].keys())


def addSpecialisation(structure: dict, code: str, type: str):
    """ Add a specialisation to the structure of a getStructure call """
    # in a specialisation, the first container takes priority - no duplicates may exist
    spnResult = specialisationsCOL.find_one({"code": code})
    type = f"{type} - {code}"
    if not spnResult:
        raise HTTPException(
            status_code=400, detail=f"{code} of type {type} not found")
    structure[type] = {"name": spnResult["name"]}
    # NOTE: takes Core Courses are first
    cores = next(filter(lambda a: "Core" in a["title"], spnResult["curriculum"]))
    exceptions = addSubgroupContainer(structure, type, cores, [])
    for container in spnResult["curriculum"]:
        if "Core" not in container["title"]:
            addSubgroupContainer(structure, type, container, exceptions)



@router.get(
    "/getStructure/{programCode}/{major}/{minor}",
    response_model=Structure,
    responses={
        400: {"model": message, "description": "Uh oh you broke me"},
        200: {
            "description": "Returns the program structure",
            "content": {
                "application/json": {
                    "example": {
                        "Major - COMPS1 - Computer Science": {
                            "Core Courses": {
                                "UOC": 66,
                                "courses": {
                                    "COMP3821": "Extended Algorithms and Programming Techniques",
                                    "COMP3121": "Algorithms and Programming Techniques",
                                },
                            },
                            "Computing Electives": {
                                "UOC": 30,
                                "courses": {
                                    "ENGG4600": "Engineering Vertically Integrated Project",
                                    "ENGG2600": "Engineering Vertically Integrated Project",
                                },
                            },
                        },
                        "Major - FINSA1 - Finance": {
                            "Core Courses": {
                                "UOC": 66,
                                "courses": {
                                    "FINS3121": "Financial Accounting",
                                },
                            },
                        },
                        "Minor": {
                            "Prescribed Electives": {
                                "UOC": 12,
                                "courses": {
                                    "FINS3616": "International Business Finance",
                                    "FINS3634": "Credit Analysis and Lending",
                                },
                            },
                            "Core Courses": {
                                "UOC": 18,
                                "courses": {
                                    "FINS2613": "Intermediate Business Finance",
                                    "COMM1180": "Value Creation",
                                    "FINS1612": "Capital Markets and Institutions",
                                },
                            },
                        },
                        "General": {
                            "GeneralEducation": {"UOC": 12},
                            "FlexEducation": {"UOC": 6},
                            "BusinessCoreCourses": {
                                "UOC": 6,
                                "courses": {"BUSI9999": "How To Business"},
                            },
                        },
                    }
                }
            },
        },
    },
)
@router.get("/getStructure/{programCode}/{major}", response_model=Structure)
@router.get("/getStructure/{programCode}", response_model=Structure)
def getStructure(
    programCode: str, major: Optional[str] = None, minor: Optional[str] = None
):
    """
    NOTE: major and minor is optionally added.
    """
    structure = {}

    if major:
<<<<<<< HEAD
        majors = major.split("+") if "+" in major else [major]

        for m in majors:
=======
        majors_l = major.split("+") if "+" in major else [major]
        for m in majors_l:
>>>>>>> dev
            addSpecialisation(structure, m, "Major")

    if minor:
        minors_l = minor.split("+") if "+" in minor else [minor]
        for m in minors_l:
            addSpecialisation(structure, m, "Minor")

    # add details for program code
    programsResult = programsCOL.find_one({"code": programCode})
    if not programsResult:
        print(programCode)
        raise HTTPException(
            status_code=400, detail="Program code was not found")

    structure['General'] = {}
    with contextlib.suppress(KeyError):
        for container in programsResult['components']['non_spec_data']:
            addSubgroupContainer(structure, "General", container, [])

    return {"structure": structure}
