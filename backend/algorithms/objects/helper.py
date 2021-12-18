import json
import re
import sys
'''HELPER FUNCTIONS TO DETERMINE THE TYPE OF A GIVEN TEXT'''

def is_course(text):
    if re.match(r'^[A-Z]{4}\d{4}$', text, flags=re.IGNORECASE):
        return True
    return False


def is_uoc(text):
    '''If the text is UOC'''
    if re.match(r'^\d+UOC$', text, flags=re.IGNORECASE):
        return True
    return False


def get_uoc(text):
    '''Given a text in the format of ???UOC, will extract the uoc and return as an int'''
    uoc_str = re.match(r'^(\d+)UOC$', text, flags=re.IGNORECASE).group(1)

    return int(uoc_str)


def is_wam(text):
    '''If the text is WAM'''
    if re.match(r'^\d+WAM$', text, flags=re.IGNORECASE):
        return True
    return False


def get_wam(text):
    '''Given a text in the format of ???WAM, will extract the wam and return as a int'''
    wam_str = re.match(r'^(\d+)WAM$', text, flags=re.IGNORECASE).group(1)

    return int(wam_str)


def is_grade(text):
    '''If the text is GRADE'''
    if re.match(r'^\d+GRADE$', text, flags=re.IGNORECASE):
        return True
    return False


def get_grade(text):
    '''Given a text in the format of ???GRADE, will extract the grade and return as a int'''
    grade_str = re.match(r'^(\d+)GRADE$', text, flags=re.IGNORECASE).group(1)

    return int(grade_str)


def is_program(text):
    '''Determines if the text is a program code'''
    if re.match(r'^\d{4}', text) or re.match(r'^[A-Z]{5}\d{5}', text) or re.match(r'^[A-Z]{6}\d{4}', text):
        # Matches standard program codes like 3707.
        # NOTE: Also matches co-op program codes and streams and stuff which I've
        # included here but we most likely won't be dealing with them. I included
        # so at least it creates the condition object instead of erroring.
        return True
    return False


def is_specialisation(text):
    '''Determines if the text is a specialisation code'''
    if re.match(r'^[A-Z]{5}\d$', text, flags=re.IGNORECASE):
        return True
    return False


'''HELPER FUNCTIONS FOR UTILITY PURPOSES'''


def read_data(file_name):
    '''Reads data from a json file and returns it'''
    try:
        with open(file_name, "r") as input_file:
            return json.load(input_file)
    except:
        print(f"File {file_name} not found")
        sys.exit(1)