"""
Program processes the formatted data by editing and customising the data for 
use on the frontend.

NOTE: "spn" == "specialisation"

Proposed data structure examples:

{
   "COMPA1":{
      "programs":[
         "3778"
      ],
      "name":"Computer Science",
      "type":"major",
      "total_credits":"96",
      "curriculum":[
         {
            "courses":{
               ("COMP3121", "COMP3821"):1,
               ("MATH1141", "MATH1131"):1,
               "COMP1511":1,
               "COMP1521":1,
               "COMP1531":1,
               "COMP2511":1,
               "COMP2521":1,
               "COMP4920":1,
               "COMP3900":1,
               "MATH1081":1,
               "(""MATH1241",
               "MATH1231"")":1
            },
            "title":"Core Courses",
            "credits_to_complete":"66",
            "type":"core",
            "levels":[
               
            ]
         },
         {
            "courses":{
               "ENGG2600":1,
               "ENGG4600":1,
               "ENGG3600":1,
               "any level 3 Computer Science course":1,
               "any level 4 Computer Science course":1,
               "any level 6 Computer Science course":1,
               "any level 9 Computer Science course":1
            },
            "title":"Computing Electives",
            "credits_to_complete":"30",
            "type":"elective",
            "levels":[
               
            ]
         }
      ]
   },
   "SENGAH":{
      "programs":[
         "3707"
      ],
      "name":"Software Engineering",
      "type":"honours",
      "total_credits":"168",
      "curriculum":[
         {
            "courses":{
               "any course":1
            },
            "title":"Free Elective",
            "credits_to_complete":"6",
            "type":"elective",
            "levels":[
               
            ]
         },
         {
            "courses":{
               "COMP3311":1,
               "SENG3011":1,
               "COMP3141":1,
               "COMP3331":1
            },
            "title":"Level 3 Core Courses",
            "credits_to_complete":"24",
            "type":"core",
            "levels":[
               "3"
            ]
         },
         {
            "courses":{
               ("MATH1141", "MATH1131")":1,
               "("MATH1241", "MATH1231")":1,
               "MATH1081":1,
               "COMP1531":1,
               "COMP1511":1,
               "ENGG1000":1,
               "COMP1521":1
            },
            "title":"Level 1 Core Courses",
            "credits_to_complete":"42",
            "type":"core",
            "levels":[
               "1"
            ]
         },
         {
            "courses":{
               "ENGG3060":1,
               "ENGG4600":1,
               "ENGG3600":1,
               "ENGG2600":1,
               "any level 3 Computer Science course":1,
               "any level 4 Computer Science course":1,
               "any level 6 Computer Science course":1,
               "any level 9 Computer Science course":1,
               "any level 3 Information Systems course":1,
               "any level 4 Information Systems course":1,
               "any level 3 Mathematics course":1,
               "any level 4 Mathematics course":1,
               "any level 6 Mathematics course":1,
               "any level 3 Electrical Engineering course":1,
               "any level 4 Electrical Engineering course":1,
               "any level 3 Telecommunications course":1,
               "any level 4 Telecommunications course":1
            },
            "title":"Discipline Electives",
            "credits_to_complete":"36",
            "type":"elective",
            "levels":[
               
            ]
         },
         {
            "courses":{
               "COMP4952":1,
               "COMP4951":1,
               "SENG4920":1,
               "COMP4953":1
            },
            "title":"Level 4 Core Courses",
            "credits_to_complete":"18",
            "type":"core",
            "levels":[
               "4"
            ]
         },
         {
            "courses":{
               "COMP2041":1,
               "COMP2511":1,
               "DESN2000":1,
               "SENG2011":1,
               "MATH2859":1,
               "SENG2021":1,
               "COMP2521":1,
               "MATH2400":1
            },
            "title":"Level 2 Core Courses",
            "credits_to_complete":"42",
            "type":"core",
            "levels":[
               "2"
            ]
         },
         {
            "courses":{
               
            },
            "title":"Level 4 (or higher) COMP UOC Minimum",
            "credits_to_complete":"",
            "type":"other",
            "levels":[
               "4"
            ]
         }
      ]
   }
}

"""
import json
import re 
from typing import List, Iterable, Union, Optional 

TEST_SPNS = ["COMPA1", "SENGAH"]

def initialise_spn(spn: dict, data: dict) -> None:
    """
    Initialises basic attributes of the specialisation
    """
    spn["programs"] = data["programs"]
    spn["name"] = data["title"]
    spn["type"] = data["level"]
    spn["total_credits"] = data["credit_points"]

def get_type(title: str) -> str:
    """ 
    Returns curriculum type of specialisation item 
    Curriculum type is one of {"elective", "core", "other"}
    """
    print(title)
    if "elective" in title:
        print("found elective")
        return "elective"
    elif "core" in title:
        print("found core")
        return "core"
    else:
        return "other"

def get_levels(title: str) -> List[int]:
    """
    Returns curriculum levels of specialisation item
    Level can be any combination of [1, 2, 3, 4, 5, 6, 7, 8, 9]
    """
    levels = []
    # s? \d[^ ]* captures cases like "Level 1/2", "Levels 1,2,3" and "Level 1-2"
    res = re.search("[Ll]evels? (\d[^ ]*)", title)
    if res:
        levels.append(res.group(1))
        # print(f"Extracted level: {res.group(1)}")
    return levels

def get_courses(curriculum_courses: dict, container_courses: List[str]) -> None:
    """ 
    Adds courses from container to the customised curriculum course dict
    """
    for course in container_courses:
        curriculum_courses[course] = 1

with open("specialisationsFormattedRaw.json", 'r') as FILE:
    data = json.load(FILE)

customised_data = {} # Dictionary for all customised data
for spn in TEST_SPNS:

    formatted = data[spn]
    customised_data[spn] = {}
    initialise_spn(customised_data[spn], formatted)

    curriculum = []
    for container in formatted["structure"]:

        curriculum_item = {
            "courses": {}
        }

        curriculum_item["title"] = container["title"]
        curriculum_item["credits_to_complete"] = container["credit_points"]

        curriculum_item["type"] = get_type(curriculum_item["title"].lower())

        curriculum_item["levels"] = get_levels(curriculum_item["title"].lower())

        if container["structure"]: # Nested container containing curriculum data
            
            for sub_container in container["structure"]: 

                # Student may choose one of two courses
                if sub_container["title"] == "One of the following:":
                    curriculum_item["courses"][tuple(sub_container["courses"])] = 1

                # Sub container title matches parent container title, so extract courses
                elif sub_container["title"] == curriculum_item["title"]:
                    get_courses(curriculum_item["courses"], sub_container["courses"])
        
        else: # No nested container containing curriculum data
            get_courses(curriculum_item["courses"], container["courses"])

        # Add item to curriculum  
        curriculum.append(curriculum_item)

    customised_data[spn]["curriculum"] = curriculum

print(customised_data)
