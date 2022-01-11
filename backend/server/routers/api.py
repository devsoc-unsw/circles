from fastapi import APIRouter
from fastapi.params import Body
from server.database import specialisationsCOL, programsCOL, coursesCOL, archivesDB
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, create_model
import re
import collections
import pickle 
from algorithms.objects.user import User
from typing import Dict, List 

router = APIRouter(
    prefix='/api',
    tags=['api'],
)

minorInFE = ['3778']
minorInSpecialisation = ['3502', '3970']

class message (BaseModel):
    message: str

class programs (BaseModel):
    programs: dict

class majors (BaseModel):
    majors: dict

class minors (BaseModel):
    minors: dict

class programCourses (BaseModel):
    courses: dict

class core (BaseModel):
    core: dict

class courseDetails (BaseModel):
    title: str
    code: str
    UOC: int
    level: int
    description: str
    study_level: str
    school: str
    campus: str
    equivalents: dict
    exclusions: dict
    path_to: dict
    terms: list
    gen_ed: int
    path_from: dict

class course (BaseModel):
    course: courseDetails

class Structure (BaseModel):
    structure: dict

class UserData(BaseModel):
    program: str 
    specialisations: list
    courses: dict
    year: int

class CourseState (BaseModel):
    is_accurate: bool 
    unlocked: bool
    handbook_note: str 
    warnings: list

class CoursesState (BaseModel):
    courses_state: Dict[str, CourseState] = {}


class PlannerTerm (BaseModel):
    locked: bool
    courses: dict

class PlannerData (BaseModel):
    program: str
    specialisations: List[str]
    year: int
    plan: List[List[PlannerTerm]]

CONDITIONS_PATH = "algorithms/conditions.pkl"
with open(CONDITIONS_PATH, "rb") as file:
    CONDITIONS = pickle.load(file)

def addSpecialisation(structure, code, type):
    query = {'code': code}
    spnResult = specialisationsCOL.find_one(query)    
    structure[type] = {'name': spnResult['name']}
    for container in spnResult['curriculum']:

        structure[type][container['title']] = {}
        item = structure[type][container['title']]

        item['UOC'] = container['credits_to_complete']

        courseList = []
        item['courses'] = {}
        for course in container['courses']:
            if ' or ' in course:
                courseList.extend(course.split(' or '))
            else:
                item['courses'][course] = container['courses'][course]

@router.get("/")
def specialisations_index():
    return "Index of api"

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
    query = programsCOL.find()
    result = {}
    for i in query:
        result[i['code']] = i['title']

    return {'programs' : result}

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
def getMajors(programCode):
    query = {'code' : programCode}
    result = programsCOL.find_one(query)
    majors = {}

    if not result:
        return JSONResponse(status_code=404, content={"message" : "Program code was not found"})

    majors = result['components']['SpecialisationData']['Majors']

    for i in majors:
        query2 = {'code' : i}
        result2 = specialisationsCOL.find_one(query2)

        if (result2):
            majors[i] = result2['name']

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
    query = {'code' : programCode}
    result = programsCOL.find_one(query)
    minors = {}

    if not result:
        return JSONResponse(status_code=404, content={"message" : "Program code was not found"})

    if (programCode in minorInFE):
        print("RUNNING THIS")
        minors = result['components']['FE']['Minors']
    elif (programCode in minorInSpecialisation):
        minors = result['components']['SpecialisationData']['Minors']
    else:
        minors = result['components']['Minors']

    for i in minors:
        query2 = {'code' : i}
        result2 = specialisationsCOL.find_one(query2)

        if (result2):
            minors[i] = result2['name']

    return {'minors' : minors}        

@router.get("/getProgramCourses/{programCode}", response_model=programCourses,
            responses={
                404: {"model": message, "description": "The given program code could not be found in the database"},
                200: {
                    "description": "Returns all general courses to the given code",
                    "content": {
                        "application/json": {
                            "example": {
                                "courses": {
                                    "COMM1190": "Data, Insights and Decisions",
                                    "COMM1110": "Evidence-Based Problem Solving",
                                    "COMM1180": "Value Creation",
                                    "COMM1140": "Financial Management",
                                    "COMM1170": "Organisational Resources",
                                    "COMM1150": "Global Business Environments",
                                    "COMM1100": "Business Decision Making",
                                    "COMM1120": "Collaboration and Innovation in Business",
                                    "COMM3030": "Social Entrepreneurship Practicum",
                                    "COMM2233": "Industry Consulting Project",
                                    "TABL3033": "Tax Clinic",
                                    "ACCT3583": "Management Accounting 2",
                                    "COMM3090": "Synthesis of Learning Experience",
                                    "COMM3900": "Capstone Project",
                                    "COMM3500": "Analytics Industry Project",
                                    "INFS3020": 1,
                                    "COMM3020": "Global Business Practicum",
                                    "COMM0999": "myBCom Blueprint",
                                    "COMM1999": "myBCom First Year Portfolio",
                                    "COMM3999": "myBCom Graduation Portfolio",
                                    "COMM2244": "Adaptive Futures",
                                    "COMM2222": "Industry Experience Program",
                                    "CDEV3000": "Practice of Work"
                                }
                            }
                        }
                    }
                }
            })
def getProgramCourses(programCode):
    query = {'code' : programCode}
    result = programsCOL.find_one(query)
    courses = {}

    if not result:
        return JSONResponse(status_code=404, content={"message" : "Program code was not found"})

    for i in result['components']['NonSpecialisationData']:
        for j in result['components']['NonSpecialisationData'][i]:
            if (len(j) == 8):
                courses[j] = result['components']['NonSpecialisationData'][i][j]

    for i in courses:
        query2 = {'code' : i}
        result2 = coursesCOL.find_one(query2)

        if (result2):
            courses[i] = result2['title']

    return {'courses' : courses}

@router.get("/getCoreCourses/{specialisationCode}", response_model=core,
            responses={
                404: {"model": message, "description": "The given specialisation code could not be found in the database"},
                200: {
                    "description": "Returns all core courses to the given code",
                    "content": {
                        "application/json": {
                            "example": {
                                "core": {
                                    "COMP3821": "Extended Algorithms and Programming Techniques",
                                    "COMP3121": "Algorithms and Programming Techniques",
                                    "COMP1521": "Computer Systems Fundamentals",
                                    "COMP3900": "Computer Science Project",
                                    "COMP1511": "Programming Fundamentals",
                                    "MATH1081": "Discrete Mathematics",
                                    "COMP4920": "Professional Issues and Ethics in Information Technology",
                                    "COMP1531": "Software Engineering Fundamentals",
                                    "COMP2521": "Data Structures and Algorithms",
                                    "COMP2511": "Object-Oriented Design & Programming",
                                    "MATH1231": "Mathematics 1B",
                                    "MATH1241": "Higher Mathematics 1B",
                                    "MATH1131": "Mathematics 1A",
                                    "MATH1141": "Higher Mathematics 1A"
                                }
                            }
                        }
                    }
                }
            })
def getCoreCourses(specialisationCode):
    query = {'code' : specialisationCode}
    result = specialisationsCOL.find_one(query)
    courses = {}

    if not result:
        return JSONResponse(status_code=404, content={"message" : "Specialisation code was not found"})

    for i in result['curriculum']:
        if (i['type'] == 'core'):
            for course in i['courses']:
                if (len(course) == 8):
                    courses[course] = 1
                else:
                    if ' or ' in course:
                        courseList = course.split(' or ')
                        print(courseList)
                        for j in courseList:
                            courses[j] = 1

    for i in courses:
        query2 = {'code' : i}
        result2 = coursesCOL.find_one(query2)

        if (result2):
            courses[i] = result2['title']

    return {'core' : courses}

@router.get("/getCourse/{courseCode}", response_model=course,
            responses={
                404: {"model": message, "description": "The given course code could not be found in the database"},
                200: {
                    "description": "Returns all course details to given code",
                    "content": {
                        "application/json": {
                            "example": {
                                "course": {
                                    "title": "Programming Fundamentals",
                                    "code": "COMP1511",
                                    "UOC": 6,
                                    "level": 1,
                                    "description": "<p>An introduction to problem-solving via programming, which aims to have students develop proficiency in using a high level programming language. Topics: algorithms, program structures (statements, sequence, selection, iteration, functions), data types (numeric, character), data structures (arrays, tuples, pointers, lists), storage structures (memory, addresses), introduction to analysis of algorithms, testing, code quality, teamwork, and reflective practice. The course includes extensive practical work in labs and programming projects.</p>\n<p>Additional Information</p>\n<p>This course should be taken by all CSE majors, and any other students who have an interest in computing or who wish to be extended. It does not require any prior computing knowledge or experience.</p>\n<p>COMP1511 leads on to COMP1521, COMP1531, COMP2511 and COMP2521, which form the core of the study of computing at UNSW and which are pre-requisites for the full range of further computing courses.</p>\n<p>Due to overlapping material, students who complete COMP1511 may not also enrol in COMP1911 or COMP1921. </p>",
                                    "study_level": "Undergraduate",
                                    "school": "School of Computer Science and Engineering",
                                    "faculty": "Faculty of Engineering",
                                    "campus": "Sydney",
                                    "equivalents": {
                                        "DPST1091": 1,
                                        "COMP1917": 1
                                    },
                                    "exclusions": {
                                        "DPST1091": 1
                                    },
                                    "path_to": {
                                        "COMP1521": 1,
                                        "COMP1531": 1,
                                        "COMP2041": 1,
                                        "COMP2111": 1,
                                        "COMP2121": 1,
                                        "COMP2521": 1,
                                        "COMP9334": 1,
                                        "ELEC2117": 1,
                                        "SENG2991": 1
                                    },
                                    "terms": [
                                        "T1",
                                        "T2",
                                        "T3"
                                    ],
                                    "gen_ed": 1,
                                    "path_from": {}
                                }
                            }
                        }
                    }
                }
            })
def getCourse(courseCode):
    query = {'code' : courseCode}
    result = coursesCOL.find_one(query)

    if not result:
        return JSONResponse(status_code=404, content={"message" : "Course code was not found"})

    del result['_id']

    return {'course' : result}




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
def getStructure(programCode, major="Default", minor="Default"):
    structure = {}

    query = {'code': programCode}
    programsResult = programsCOL.find_one(query)
    if not programsResult:
        return JSONResponse(status_code=404, content={"message" : "Program code was not found"})

    if major != 'Default':
        query = {'code': major}
        spnResult = specialisationsCOL.find_one(query)
        if not spnResult:
            return JSONResponse(status_code=404, content={"message" : "Major code was not found"})

        addSpecialisation(structure, major, 'Major')

    if minor != 'Default':
        query = {'code': minor}
        spnResult = specialisationsCOL.find_one(query)
        if not spnResult:
            return JSONResponse(status_code=404, content={"message" : "Minor code was not found"})

        addSpecialisation(structure, minor, 'Minor')

    structure['General'] = {}
    for container in programsResult['components']['NonSpecialisationData']:

        structure['General'][container] = {}

        if "credits_to_complete" in programsResult['components']['NonSpecialisationData'][container]:
            structure['General'][container]['UOC'] = programsResult['components']['NonSpecialisationData'][container]['credits_to_complete']
        else:
            # Not all program containers have credit points associated with them
            structure['General'][container]['UOC'] = -1
        
        for course, title in programsResult['components']['NonSpecialisationData'][container].items():
            # Add course data: e.g. { "COMP1511": "Programming Fundamentals"  }
            if course == "type" or course == "credits_to_complete":
                continue
            structure['General'][container][course] = title

        if 'FE' in programsResult['components']:
            structure['General']['FlexEducation'] = {'UOC': programsResult['components']['FE']['credits_to_complete'],
                                                     'description': 'students can take a maximunm of {} UOC of free electives'.format(programsResult['components']['FE']['credits_to_complete'])}
        if 'GE' in programsResult['components']:
            structure['General']['GeneralEducation'] = {'UOC': programsResult['components']['GE']['credits_to_complete'],
                                                        'description': 'any general education course'}

    return {'structure': structure}

@router.get("/searchCourse/{string}")
def search(string):
    dictionary = {}
    pat = re.compile(r'{}'.format(string), re.I)
    result = coursesCOL.find({'code': {'$regex': pat}})
    for i in result:
        dictionary[i['code']] = i['title']
    result = coursesCOL.find({'title': {'$regex': pat}})

    for i in result:
        if i['code'] not in dictionary:
            dictionary[i['code']] = i['title']

    # dictionary = collections.OrderedDict(sorted(dictionary.items()))
    return dictionary


@router.post("/getAllUnlocked/", response_model=CoursesState,
            responses={
                404: {"model": message, "description": "Uh oh you broke me"},
                200: {
                    "description": "Returns the state of all the courses",
                    "content": {
                        "application/json": {
                            "example": {
                                "COMP9302": {
                                    "is_accurate": True,
                                    "unlocked": True,
                                    "handbook_note": "This course can only be taken in the final term of your program.",
                                    "warnings": []
                                }
                            }
                        }
                    }
                }
            })
def getAllUnlocked(userData: UserData, lockedCourses: list):
    """Given the userData and a list of locked courses, returns the state of all
    the courses. Note that locked courses always return as True with no warnings
    since it doesn't make sense for us to tell the user they can't take a course
    that they have already completed"""
    user = User(userData.dict())

    coursesState = {}
    
    for course, condition in CONDITIONS.items():
        if course in lockedCourses:
            # Always True
            isAccurate = True
            unlocked = True
            warnings = []
        elif condition:
            # Condition object exists for this course
            isAccurate = True
            state = condition.is_unlocked(user)
            unlocked = state['result']
            warnings = state['warnings']
        else:
            # Condition object does not exist for this course. True by default
            # but warn the user the info might be inaccurate
            isAccurate = False 
            unlocked = True 
            warnings = []

        coursesState[course] = {
            "is_accurate": isAccurate,
            "unlocked": unlocked,
            "handbook_note": "", # TODO: Cache handbook notes
            "warnings": warnings
        }

    return {'courses_state': coursesState}

@router.get("/getLegacyCourses/{year}/{term}", response_model=programCourses,
            responses={
                404: {"model": message, "description": "Year or Term input is incorrect"},
                200: {
                    "description": "Returns the program structure",
                    "content": {
                        "application/json": {
                            "example": {
                                "courses": {
                                    "ACCT1511": "Accounting and Financial Management 1B",
                                    "ACCT2542": "Corporate Financial Reporting and Analysis",
                                    "ACCT3202": "Industry Placement 2",
                                    "ACCT3303": "Industry Placement 3",
                                    "ACCT3610": "Business Analysis and Valuation",
                                    "ACCT4797": "Thesis (Accounting) B",
                                    "ACCT4809": "Current Developments in Auditing Research",
                                    "ACCT4852": "Current Developments in Accounting Research - Managerial",
                                    "ACCT4897": "Seminar in Research Methodology",
                                    "ACTL1101": "Introduction to Actuarial Studies",
                                    "ACTL2101": "Industry Placement 1",
                                    "ACTL2102": "Foundations of Actuarial Models",
                                    "ACTL3142": "Actuarial Data and Analysis"
                                }
                            }
                        }
                    }
                }
            })
def getLegacyCourses(year, term):
    db = archivesDB[year]
    query = db.find()
    result = {} 
    for i in query:
        if term in i['terms']:
            result[i['code']] = i['title'] 

    return {'courses' : result}


@router.post("/unselectCourse/")
def unselectCourse(userData: UserData, lockedCourses: list, unselectedCourse: str):
    '''
        Creates a new user class and returns all the courses affected from the course that was unselected in sorted order
    '''
    user = User(userData.dict())
    affectedCourses =  user.unselect_course(unselectedCourse, lockedCourses)

    return {'affected_courses': affectedCourses}

@router.post("/validateTermPlanner/", response_model=CoursesState)
async def validateTermPlanner(plannerData: PlannerData = Body(
    ...,
    example={
        "program": "3707",
        "specialisations": ["COMPA1"],
        "year": 1,
        "plan": [
            [
                {
                    "locked": False,
                    "courses": {}
                },
                {
                    "locked": False,
                    "courses": {
                        "COMP1511": [6, None],
                        "MATH1141": [6, None],
                        "MATH1081": [6, None],
                    }
                },
                {
                    "locked": False,
                    "courses": {
                        "COMP1521": [6, None],
                        "COMP9444": [6, None],
                    }
                },
                {
                    "locked": False,
                    "courses": {
                        "COMP2521": [6, None],
                        "MATH1241": [6, None],
                        "COMP3331": [6, None]
                    }
                }
            ],
            [
                {
                    "locked": False,
                    "courses": {}
                },
                {
                    "locked": False,
                    "courses": {
                        "COMP1531": [6, None],
                        "COMP6080": [6, None],
                        "COMP3821": [6, None]
                    }
                }
            ]
        ]
    }
)):
    """
    Will iteratveily go through the term planner data whilst "building up" the user.
    Starting from 1st year ST, we will create an empty user and evaluate the courses.
    Then we will add ST courses to the user and evaluate T1. Then we will add T1
    courses and evaluate T2. Then add T2 and evaluate T3. Then add T3 and evaluate
    2nd year ST... and so on.

    Returns the state of all the courses on the term planner
    """
    data = plannerData.dict()
    emptyUserData = {
        "program": data["program"],
        "specialisations": data["specialisations"],
        "year": 1, # Start off as a first year
        "courses": {} # Start off the user with an empty year
    }
    user = User(emptyUserData)

    # State of courses on the term planner
    coursesState = {}

    for year in data["plan"]:
        # Go through all the years
        for term in year:
            # Go through all the terms. Do not bother evaluating locked terms
            if term["locked"]:
                for course in term["courses"]:
                    coursesState[course] = {
                        "is_accurate": True,
                        "unlocked": True,
                        "handbook_note": "", # TODO: Cache handbook notes
                        "warnings": []
                    }
                continue
            
            # Otherwise, we will evaluate all the courses in the current term.
            for course in term["courses"]:
                user.add_current_course(course) # Helpful for corequisite conditions

            # Evaluate the courses
            for course in term["courses"]:
                if course not in CONDITIONS:
                    # Error check in case we do not have the condition item
                    coursesState[course] = {
                        "is_accurate": False,
                        "unlocked": True,
                        "handbook_note": "",
                        "warnings": []
                    }
                    continue
                    
                # We do have the course for this condition...
                condition = CONDITIONS[course]
                if condition is None:
                    # Our algorithm could not parse it :(
                    coursesState[course] = {
                        "is_accurate": False,
                        "unlocked": True,
                        "handbook_note": "", # TODO: Cache handbook notes
                        "warnings": []
                    }
                else:
                    # Evaluate the condition accordingly
                    res = condition.is_unlocked(user)
                    coursesState[course] = {
                        "is_accurate": True,
                        "unlocked": res["result"],
                        "handbook_note": "", # TODO: Cache handbook notes
                        "warnings": res["warnings"]
                    }
            
            # Add all these courses to the user in preparation for the next term
            user.empty_current_courses()
            user.add_courses(term["courses"])

        # Onto the next year...
        user.year += 1

    return {"courses_state": coursesState}





