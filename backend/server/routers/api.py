from fastapi import APIRouter
from server.database import specialisationsCOL, programsCOL, coursesCOL
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, create_model
import re
import collections

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
    query = programsCOL.find();
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
