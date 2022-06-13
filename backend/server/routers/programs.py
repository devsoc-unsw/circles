"""
API for fetching data about programs and specialisations
"""
import contextlib
import re
from typing import Optional

from fastapi import APIRouter, HTTPException
from server.routers.courses import regex_search
from server.database import programsCOL, specialisationsCOL
from server.routers.model import (Structure, Programs)

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
    response_model=Programs,
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
def get_programs():
    """ Fetch all the programs the backend knows about in the format of { code: title } """
    # return {"programs": {q["code"]: q["title"] for q in programsCOL.find()}}
    # TODO On deployment, DELETE RETURN BELOW and replace with the return above
    return {
        "programs": {
            "3778": "Computer Science",
            "3784": "Commerce / Computer Science",
            "3502": "Commerce",
            "3970": "Science",
            "3707": "Engineering (Honours)",
            "3789": "Science / Computer Science",
        }
    }

def convert_subgroup_object_to_courses_dict(object: str, description: str|list[str]) -> dict[str, str]:
    """ Gets a subgroup object (format laid out in the processor) and fetches the exact courses its referring to """
    if " or " in object:
        return {c: description[index] for index, c in enumerate(object.split(" or "))}
    if not re.match(r"[A-Z]{4}[0-9]{4}", object):
        return regex_search(object)

    return { object: description }

def add_subgroup_container(structure: dict, type: str, container: dict, exceptions: list[str]) -> list[str]:
    """ Returns the added courses """
    # TODO: further standardise non_spec_data to remove these line:
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
            in convert_subgroup_object_to_courses_dict(object, description).items()
            if course not in exceptions
        }

    return list(item["courses"].keys())


def add_specialisation(structure: dict, code: str):
    """ Add a specialisation to the structure of a getStructure call """
    # in a specialisation, the first container takes priority - no duplicates may exist
    if code.endswith("1"):
        type = "Major"
    elif code.endswith("2"):
        type = "Minor"
    else:
        type = "Honours"

    spnResult = specialisationsCOL.find_one({"code": code})
    type = f"{type} - {code}"
    if not spnResult:
        raise HTTPException(
            status_code=400, detail=f"{code} of type {type} not found")
    structure[type] = {"name": spnResult["name"]}
    # NOTE: takes Core Courses are first
    exceptions = []
    for cores in filter(lambda a: "Core" in a["title"], spnResult["curriculum"]):
        new = add_subgroup_container(structure, type, cores, exceptions)
        exceptions.extend(new)

    for container in spnResult["curriculum"]:
        if "Core" not in container["title"]:
            add_subgroup_container(structure, type, container, exceptions)

@router.get(
    "/getStructure/{programCode}/{major}",
    response_model=Structure,
    responses={
        400: { "description": "Uh oh you broke me" },
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
@router.get("/getStructure/{programCode}", response_model=Structure)
def getStructure(
    programCode: str, major: Optional[str] = None, minor: Optional[str] = None
):
    """
    NOTE: major and minor is optionally added.
    """
    structure = {}

    if major:
        majors_l = major.split("+") if "+" in major else [major]
        for m in majors_l:
            add_specialisation(structure, m)

    # add details for program code
    programsResult = programsCOL.find_one({"code": programCode})
    if not programsResult:
        print(programCode)
        raise HTTPException(
            status_code=400, detail="Program code was not found")

    structure['General'] = {}
    with contextlib.suppress(KeyError):
        for container in programsResult['components']['non_spec_data']:
            add_subgroup_container(structure, "General", container, [])

    return {"structure": structure}
