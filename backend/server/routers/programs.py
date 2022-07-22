"""
API for fetching data about programs and specialisations
"""
import re
from typing import Dict, Mapping, Optional

from fastapi import APIRouter, HTTPException
from contextlib import suppress

from server.manual_fixes import apply_manual_fixes
from server.routers.courses import regex_search
from server.database import programsCOL, specialisationsCOL
from server.routers.courses import regex_search
from data.utility import data_helpers
from server.routers.model import (Structure, Programs, Courses)

router = APIRouter(
    prefix="/programs",
    tags=["programs"],
)


@router.get("/")
def programs_index() -> str:
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
def get_programs() -> Dict[str, Dict[str, str]]:
    """ Fetch all the programs the backend knows about in the format of { code: title } """
    # return {"programs": {q["code"]: q["title"] for q in programsCOL.find()}}
    # TODO On deployment, DELETE RETURN BELOW and replace with the return above
    return {
        "programs": {
            "3778": "Computer Science",
            "3502": "Commerce",
            "3970": "Science",
            "3707": "Engineering (Honours)",
            "3784": "Commerce / Computer Science",
            "3789": "Science / Computer Science",
            "3785": "Engineering (Honours) / Computer Science",
        }
    }

def convert_subgroup_object_to_courses_dict(object: str, description: str|list[str]) -> Mapping[str, str | list[str]]:
    """ Gets a subgroup object (format laid out in the processor) and fetches the exact courses its referring to """
    if " or " in object:
        return {c: description[index] for index, c in enumerate(object.split(" or "))}
    if not re.match(r"[A-Z]{4}[0-9]{4}", object):
        return regex_search(rf"^{object}")

    return { object: description }

def add_subgroup_container(structure: dict, type: str, container: dict, exceptions: list[str]) -> list[str]:
    """ Returns the added courses """
    # TODO: further standardise non_spec_data to remove these line:
    title = container.get("title")
    if container.get("type") == "gened":
        title = "General Education"
    type = container.get("type") # type: ignore
    if "rule" in type:
        type = "Rules"

    structure[type][title] = {}
    item = structure[type][title]
    item["UOC"] = container.get("credits_to_complete") if container.get("credits_to_complete") is not None else 0
    item["courses"] = {}
    item["type"] = container.get("type") if container.get("type") is not None else ""

    if container.get("courses") is None:
        return []

    for object, description in container["courses"].items():
        item["courses"] = item["courses"] | {
            course: description for course, description
            in convert_subgroup_object_to_courses_dict(object, description).items()
            if course not in exceptions
        }

    return list(item["courses"].keys())

def add_geneds_courses(programCode: str, structure: dict, container: dict) -> list[str]:
    """ Returns the added courses """
    if container.get("type") != "gened":
        return []

    item = structure["General"]["General Education"]
    item["courses"] = {}
    
    if container.get("courses") is None:
        item["courses"] = data_helpers.read_data("data/scrapers/genedPureRaw.json").get(programCode)

    return list(item["courses"].keys())


def add_specialisation(structure: dict, code: str) -> None:
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
    exceptions: list[str] = []
    for cores in filter(lambda a: "Core" in a["title"], spnResult["curriculum"]):
        new = add_subgroup_container(structure, type, cores, exceptions)
        exceptions.extend(new)

    for container in spnResult["curriculum"]:
        if "Core" not in container["title"]:
            add_subgroup_container(structure, type, container, exceptions)

@router.get(
    "/getStructure/{programCode}/{spec}",
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
def get_structure(
    programCode: str, spec: Optional[str] = None
):
    structure: dict[str, dict] = {}
    if spec:
        specs = spec.split("+") if "+" in spec else [spec]
        for m in specs:
            add_specialisation(structure, m)

    # add details for program code
    programsResult = programsCOL.find_one({"code": programCode})
    if not programsResult:
        raise HTTPException(
            status_code=400, detail="Program code was not found")

    structure['General'] = {}
    structure['Rules'] = {}
    with suppress(KeyError):
        for container in programsResult['components']['non_spec_data']:
            add_subgroup_container(structure, "General", container, [])
            if container.get("type") == "gened":
                add_geneds_courses(programCode, structure, container)
    apply_manual_fixes(structure, programCode)

    return {
        "structure": structure, 
        "uoc": programsResult["UOC"],
    }

@router.get(
    "/getGenEds/{programCode}",
    response_model=Courses,
    responses={
        400: {
            "description": "The given program code could not be found in the database",
        },
        200: {
            "description": "Returns all geneds available to a given to the given code",
            "content": {
                "application/json": {
                    "example": {
                        "courses": {
                            "ACTL3142": "Statistical Machine Learning for Risk and Actuarial Applications",
                            "ACTL4305": "Actuarial Data Analytic Applications",
                            "ADAD2610": "Art and Design for Environmental Challenges",
                            "ANAT2521": "Biological Anthropology: Principles and Practices",
                            "ARTS1010": "The Life of Words"
                        }
                    }
                }
            },
        },
    },
)

def getGenEds(programCode: str):
    all_geneds = data_helpers.read_data("data/scrapers/genedPureRaw.json")
    return {"courses" : all_geneds[programCode]}
