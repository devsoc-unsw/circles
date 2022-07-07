"""
API for fetching data about programs and specialisations
"""
import contextlib
import re
from typing import Optional

from fastapi import APIRouter, HTTPException
from server.database import programsCOL, specialisationsCOL
from server.routers.courses import regex_search
from data.utility import data_helpers
from server.routers.model import (Structure, Programs, Courses)

router = APIRouter(
    prefix="/programs",
    tags=["programs"],
)


@router.get("/")
def programs_index():
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
            "3502": "Commerce",
            "3970": "Science",
            "3707": "Engineering (Honours)",
            "3784": "Commerce / Computer Science",
            "3789": "Science / Computer Science",
            "3785": "Engineering (Honours) / Computer Science",
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
    """
    NOTE: specialisations optionally added.
    """
    structure = {}

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
    with contextlib.suppress(KeyError):
        for container in programsResult['components']['non_spec_data']:
            add_subgroup_container(structure, "General", container, [])

    
    return {"structure": structure}

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
                    "example": 
                        {"courses": [
                            "ADAD2610",
                            "ANAT2521",
                            "ARTS1010",
                            "ARTS1011",
                            "ARTS1030",
                            "ARTS1031",
                            "ARTS1032",
                            "ARTS1060",
                            "ARTS1062",
                            "ARTS1064",
                            "ARTS1090",
                            "ARTS1091",
                            "ARTS1120",
                            "ARTS1121",
                            "ARTS1122",
                            "ARTS1190",
                            "ARTS1210",
                            "ARTS1211",
                            "ARTS1240",
                            "ARTS1241",
                            "ARTS1250",
                            "ARTS1270",
                            "ARTS1271",
                            "ARTS1360",
                            "ARTS1361",
                            "ARTS1362",
                            "ARTS1450",
                            "ARTS1451",
                            "ARTS1452",
                            "ARTS1453",
                            "ARTS1480",
                            "ARTS1481",
                            "ARTS1510",
                            "ARTS1511",
                            "ARTS1540",
                            "ARTS1541",
                            "ARTS1570",
                            "ARTS1571",
                            "ARTS1620",
                            "ARTS1621",
                            "ARTS1630",
                            "ARTS1631",
                            "ARTS1660",
                            "ARTS1661",
                            "ARTS1690",
                            "ARTS1691",
                            "ARTS1750",
                            "ARTS1753",
                            "ARTS1780",
                            "ARTS1782",
                            "ARTS1810",
                            "ARTS1811",
                            "ARTS1846",
                            "ARTS1870",
                            "ARTS1900",
                            "ARTS2020",
                            "ARTS2031",
                            "ARTS2033",
                            "ARTS2034",
                            "ARTS2035",
                            "ARTS2036",
                            "ARTS2040",
                            "ARTS2041",
                            "ARTS2061",
                            "ARTS2062",
                            "ARTS2063",
                            "ARTS2064",
                            "ARTS2066",
                            "ARTS2091",
                            "ARTS2092",
                            "ARTS2093",
                            "ARTS2094",
                            "ARTS2095",
                            "ARTS2096",
                            "ARTS2120",
                            "ARTS2123",
                            "ARTS2125",
                            "ARTS2126",
                            "ARTS2127",
                            "ARTS2128",
                            "ARTS2150",
                            "ARTS2210",
                            "ARTS2211",
                            "ARTS2212",
                            "ARTS2213",
                            "ARTS2240",
                            "ARTS2242",
                            "ARTS2243",
                            "ARTS2244",
                            "ARTS2248",
                            "ARTS2249",
                            "ARTS2270",
                            "ARTS2271",
                            "ARTS2272",
                            "ARTS2278",
                            "ARTS2281",
                            "ARTS2282",
                            "ARTS2283",
                            "ARTS2285",
                            "ARTS2360",
                            "ARTS2361",
                            "ARTS2362",
                            "ARTS2363",
                            "ARTS2374",
                            "ARTS2375",
                            "ARTS2382",
                            "ARTS2383",
                            "ARTS2384",
                            "ARTS2389",
                            "ARTS2450",
                            "ARTS2451",
                            "ARTS2452",
                            "ARTS2453",
                            "ARTS2455",
                            "ARTS2457",
                            "ARTS2458",
                            "ARTS2461",
                            "ARTS2462",
                            "ARTS2463",
                            "ARTS2464",
                            "ARTS2465",
                            "ARTS2469",
                            "ARTS2480",
                            "ARTS2481",
                            "ARTS2482",
                            "ARTS2485",
                            "ARTS2486",
                            "ARTS2488",
                            "ARTS2510",
                            "ARTS2511",
                            "ARTS2542",
                            "ARTS2570",
                            "ARTS2571",
                            "ARTS2630",
                            "ARTS2631",
                            "ARTS2633",
                            "ARTS2660",
                            "ARTS2661",
                            "ARTS2662",
                            "ARTS2663",
                            "ARTS2690",
                            "ARTS2692",
                            "ARTS2693",
                            "ARTS2694",
                            "ARTS2696",
                            "ARTS2698",
                            "ARTS2750",
                            "ARTS2751",
                            "ARTS2752",
                            "ARTS2754",
                            "ARTS2755",
                            "ARTS2781",
                            "ARTS2785",
                            "ARTS2788",
                            "ARTS2813",
                            "ARTS2815",
                            "ARTS2816",
                            "ARTS2817",
                            "ARTS2818",
                            "ARTS2819",
                            "ARTS2820",
                            "ARTS2821",
                            "ARTS2845",
                            "ARTS2870",
                            "ARTS2871",
                            "ARTS2872",
                            "ARTS2873",
                            "ARTS2874",
                            "ARTS2876",
                            "ARTS2877",
                            "ARTS2900",
                            "ARTS2904",
                            "ARTS2906",
                            "ARTS2908",
                            "ARTS2909",
                            "ARTS3025",
                            "ARTS3030",
                            "ARTS3048",
                            "ARTS3063",
                            "ARTS3064",
                            "ARTS3066",
                            "ARTS3212",
                            "ARTS3289",
                            "ARTS3292",
                            "ARTS3368",
                            "ARTS3450",
                            "ARTS3451",
                            "ARTS3452",
                            "ARTS3453",
                            "ARTS3455",
                            "ARTS3456",
                            "ARTS3480",
                            "ARTS3481",
                            "ARTS3482",
                            "ARTS3483",
                            "ARTS3488",
                            "ARTS3490",
                            "ARTS3491",
                            "ARTS3510",
                            "ARTS3511",
                            "ARTS3570",
                            "ARTS3571",
                            "ARTS3577",
                            "ARTS3630",
                            "ARTS3631",
                            "ARTS3632",
                            "ARTS3633",
                            "ARTS3660",
                            "ARTS3661",
                            "ARTS3662",
                            "ARTS3663",
                            "ARTS3664",
                            "ARTS3665",
                            "ARTS3820",
                            "ARTS3821",
                            "ATSI1011",
                            "ATSI1012",
                            "ATSI2003",
                            "ATSI2004",
                            "ATSI2011",
                            "ATSI2012",
                            "ATSI2014",
                            "ATSI2015",
                            "ATSI3002",
                            "ATSI3003",
                            "ATSI3005",
                            "ATSI3017",
                            "AVEN1920",
                            "AVIA1902",
                            "AVIA2025",
                            "AVIA2101",
                            "AVIA3900",
                            "AVIA3910",
                            "BABS1111",
                            "BEES2680",
                            "BEES2741",
                            "BEES6601",
                            "BENV1015",
                            "BENV2000",
                            "BENV2001",
                            "BIOM1010",
                            "BIOS1101",
                            "BIOS1301",
                            "BIOS1501",
                            "BIOS2500",
                            "BLDG2012",
                            "CDEV2000",
                            "CDEV3000",
                            "CDEV3001",
                            "CDEV3012",
                            "CDEV3100",
                            "CDEV3101",
                            "CDEV3200",
                            "CDEV3300",
                            "CHEM1011",
                            "CHEM1021",
                            "CHEM1777",
                            "CHEM6541",
                            "CLIM1001",
                            "COMP1010",
                            "COMP1511",
                            "COMP1521",
                            "COMP1531",
                            "COMP1911",
                            "COMP2511",
                            "COMP2521",
                            "COMP3511",
                            "COMP6441",
                            "COMP6443",
                            "COMP6445",
                            "COMP6447",
                            "COMP6448",
                            "COMP6841",
                            "COMP6843",
                            "COMP6845",
                            "CRIM1010",
                            "CRIM1011",
                            "CRIM2041",
                            "CVEN4705",
                            "DART1110",
                            "DART1120",
                            "DART1121",
                            "DART1130",
                            "DART1131",
                            "DART1140",
                            "DART1142",
                            "DART1150",
                            "DART1151",
                            "DART1191",
                            "DART1210",
                            "DART1211",
                            "DART1220",
                            "DART1230",
                            "DART1240",
                            "DART1250",
                            "DART1300",
                            "DART1350",
                            "DART1351",
                            "DART2190",
                            "DART2252",
                            "DART2331",
                            "DART2341",
                            "DART3320",
                            "DART3340",
                            "DATA1001",
                            "DDES1110",
                            "DDES1120",
                            "DDES1130",
                            "DDES1140",
                            "DDES1150",
                            "DDES1160",
                            "DDES1200",
                            "DDES3190",
                            "DPBS1012",
                            "DPBS1613",
                            "EDST1101",
                            "EDST1104",
                            "EDST1108",
                            "EDST2032",
                            "EDST2044",
                            "EDST2070",
                            "EDST2091",
                            "ENGG1100",
                            "ENGG1200",
                            "ENGG1811",
                            "FOOD1120",
                            "GENE0050",
                            "GENE1500",
                            "GENL0231",
                            "GENL0250",
                            "GENL0251",
                            "GENL0252",
                            "GENL1021",
                            "GENL1022",
                            "GENL1062",
                            "GENL1063",
                            "GENL2021",
                            "GENL2022",
                            "GENL2032",
                            "GENL2323",
                            "GENL2456",
                            "GENL2880",
                            "GENM0295",
                            "GENM0703",
                            "GENM0707",
                            "GENS0401",
                            "GENS1111",
                            "GENS1112",
                            "GENS2025",
                            "GENS4015",
                            "GENS5013",
                            "GENY0001",
                            "GENY0002",
                            "GENY0003",
                            "GEOS1701",
                            "GEOS2021",
                            "GMAT1110",
                            "HUMS1005",
                            "HUMS1006",
                            "HUMS1007",
                            "HUMS1008",
                            "HUMS1009",
                            "HUMS1010",
                            "HUMS1011",
                            "HUMS1012",
                            "HUMS2003",
                            "HUMS2006",
                            "HUMS2007",
                            "INST1007",
                            "INTA1000",
                            "MATH2011",
                            "MATH2121",
                            "MATH2221",
                            "MATH2241",
                            "MATH2400",
                            "MATH2521",
                            "MATH2621",
                            "MATH3191",
                            "MATH3531",
                            "MATH3560",
                            "MINE1010",
                            "MMAN1130",
                            "MMAN2130",
                            "MSCI0501",
                            "MSCI2060",
                            "MUSC1101",
                            "MUSC1602",
                            "MUSC1603",
                            "MUSC1604",
                            "MUSC2113",
                            "MUSC2115",
                            "MUSC2116",
                            "MUSC2117",
                            "MUSC2118",
                            "MUSC2602",
                            "MUSC2603",
                            "MUSC2804",
                            "MUSC3104",
                            "PHCM1001",
                            "PHYS1110",
                            "PHYS1160",
                            "PHYS1211",
                            "PSYC1001",
                            "PSYC1011",
                            "PSYC1022",
                            "PSYC1023",
                            "PSYC1024",
                            "PSYC1025",
                            "PSYC1027",
                            "PSYC1028",
                            "PSYC1029",
                            "PSYC1031",
                            "PSYC1062",
                            "PSYC2101",
                            "SCIF1004",
                            "SCIF3900",
                            "SDES2167",
                            "SDES2203",
                            "SDES2405",
                            "SDES2410",
                            "SDES2411",
                            "SDES2414",
                            "SDES2416",
                            "SDES3411",
                            "SDES4205",
                            "SOCW1004",
                            "SOLA1070",
                            "SOMA2416",
                            "SOMS1501",
                            "SOSS1000",
                            "SOSS1001",
                            "SOSS2001",
                            "VISN1101",
                            "ZEIT3114",
                            "ZGEN2215",
                            "ZGEN2222",
                            "ZGEN2240",
                            "ZGEN2801",
                            "ZPEM1301",
                            "ZPEM1303",
                            "ZPEM3301"
                        ]
                    
                    }
                }
            },
        },
    },
)

def getGenEds(
    programCode: str):
    all_geneds = data_helpers.read_data("data/scrapers/genedPureRaw.json")
    return {"courses" : all_geneds[programCode]}