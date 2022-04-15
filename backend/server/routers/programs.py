import contextlib
import re
from typing import Optional

from fastapi import APIRouter, HTTPException
from server.database import programsCOL, specialisationsCOL
from server.routers.model import (Structure, majors, message, minorInFE,
                                  minorInSpecialisation, minors, programs)
from server.routers.courses import fuzzy_search

router = APIRouter(
    prefix="/programs",
    tags=["programs"],
)


@router.get("/")
def programsIndex():
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
    return {"programs": {"3778": "Computer Science"}}


@router.get(
    "/getMajors/{programCode}",
    response_model=majors,
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
                        "majors": {
                            "COMPS1": "Computer Science (Embedded Systems)",
                            "COMPJ1": "Computer Science (Programming Languages)",
                            "COMPE1": "Computer Science (eCommerce Systems)",
                            "COMPA1": "Computer Science",
                            "COMPN1": "Computer Science (Computer Networks)",
                            "COMPI1": "Computer Science (Artificial Intelligence)",
                            "COMPD1": "Computer Science (Database Systems)",
                            "COMPY1": "Computer Science (Security Engineering)",
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

    return {"majors": result["components"]["SpecialisationData"]["Majors"]}


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
                            "INFSA2": "<name of minor>",
                            "ACCTA2": "<name of minor>",
                            "PSYCM2": "<name of minor>",
                            "MARKA2": "<name of minor>",
                            "FINSA2": "<name of minor>",
                            "MATHC2": "<name of minor>",
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
    if programCode in minorInFE:
        minrs = result["components"]["FE"]["Minors"]
    elif programCode in minorInSpecialisation:
        minrs = result["components"]["SpecialisationData"]["Minors"]
    else:
        minrs = result["components"]["Minors"]

    return {"minors": minrs}

def convertSubgroupObjectToCoursesDict(object: str, description: str|list[str]) -> dict[str, str]:
    """ Gets a subgroup object (format laid out in the processor) and fetches the exact courses its referring to """
    if " or " in object:
        return {c: description[index] for index, c in enumerate(object.split(" or "))}
    elif not re.match(r"[A-Z]{4}[0-9]{4}", object):
        # TODO(josh): ensure this is accurate
        return fuzzy_search(object)
    else:
        return {object: description}

def addSubgroupContainer(structure: dict, type: str, container: dict, exceptions: list[str]) -> list[str]:
    """ Returns the added courses """
    structure[type][container["title"]] = {}
    item = structure[type][container["title"]]

    item["UOC"] = container["credits_to_complete"]
    item["courses"] = {}
    for object, description in container["courses"].items():
        if " or " in object:
            courses_mentioned = {c: description[index] for index, c in enumerate(object.split(" or "))}
        elif not re.match(r"[A-Z]{4}[0-9]{4}", object):
            # TODO(josh): ensure this is accurate
            courses_mentioned = fuzzy_search(object)
        else:
            courses_mentioned = {object: description}
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
                        "Major": {
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
        addSpecialisation(structure, major, "Major")

    if minor:
        addSpecialisation(structure, minor, "Minor")

    # add details for program code
    programsResult = programsCOL.find_one({"code": programCode})
    if not programsResult:
        raise HTTPException(
            status_code=400, detail="Program code was not found")

    structure["General"] = {}
    for name, data in programsResult["components"]["NonSpecialisationData"].items():
        data["UOC"] = (
            data["credits_to_complete"] if "credits_to_complete" in data else -1
        )

        with contextlib.suppress(KeyError):
            del data["type"]
            del data["credits_to_complete"]
        structure["General"][name] = data
    with contextlib.suppress(KeyError):
        structure["General"]["Flexible Education"] = {
            "UOC": programsResult["components"]["FE"]["credits_to_complete"]
        }
        structure["General"]["General Education"] = {
            "UOC": programsResult["components"]["GE"]["credits_to_complete"]
        }

    return {"structure": structure}
