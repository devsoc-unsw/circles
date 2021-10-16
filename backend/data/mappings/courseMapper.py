import re
import sys
from data.utility import dataHelpers
from collections import OrderedDict

# Final Data for all courses
# NOTE ONLY DO SCHOOL ONES
finalMappings = {}


def mapCourse(course, schoolMappings):

    courseCode = course['code']
    if 'school' in course:
        courseSchool = course['school']
        finalMappings[schoolMappings[courseSchool]][courseCode] = 1
    courseFaculty = course['faculty']

    # courseMapping = {}
    # courseMapping['school'] = schoolMappings[courseSchool]
    # courseMapping['faculty'] = facultyMappings[courseFaculty]

    


def process_data():
    # Read in coursesProcessed File
    courseData = dataHelpers.read_data("data/finalData/coursesProcessed.json")
    # facultyMappings = dataHelpers.read_data("data/mappings/facultyMappings.json")
    schoolMappings = dataHelpers.read_data("data/mappings/schoolMappings.json")

    initialiseData(schoolMappings)
    for course in courseData.values():
        mapCourse(course, schoolMappings)

    dataHelpers.write_data(
            finalMappings, "data/mappings/processedMappings.json")

def initialiseData(schoolMappings):
    for school in schoolMappings:   
        first_word = school.split()[0]
        if len(first_word) == 1:
            finalMappings[school] = {}
    


if __name__ == "__main__":
    process_data()