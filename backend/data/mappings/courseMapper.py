import re
import sys
from data.utility import dataHelpers
from collections import OrderedDict

# Final Data for all courses
# NOTE ONLY DO SCHOOL ONES
finalSchoolMappings = {}
finalFacultyMappings = {}


def mapCourse(course, schoolMappings, facultyMappings):

    courseCode = course['code']
    courseFaculty = course['faculty']
    if 'school' in course:
        courseSchool = course['school']
        finalSchoolMappings[schoolMappings[courseSchool]][courseCode] = 1

    finalFacultyMappings[facultyMappings[courseFaculty]][courseCode] = 1
   

    


def process_data():
    # Read in coursesProcessed File
    courseData = dataHelpers.read_data("data/finalData/coursesProcessed.json")
    facultyMappings = dataHelpers.read_data("data/mappings/facultyMappings.json")
    schoolMappings = dataHelpers.read_data("data/mappings/schoolMappings.json")

    initialiseData(schoolMappings, facultyMappings)
    for course in courseData.values():
        mapCourse(course, schoolMappings, facultyMappings)

    dataHelpers.write_data(
            finalSchoolMappings, "data/mappings/schoolCourseMappings.json")
    dataHelpers.write_data(
            finalFacultyMappings, "data/mappings/facultyCourseMappings.json")

def initialiseData(schoolMappings, facultyMappings):
    for school in schoolMappings:   
        first_word = school.split()[0]
        if len(first_word) == 1:
            finalSchoolMappings[school] = {}
    for faculty in facultyMappings:   
        first_word = faculty.split()[0]
        if len(first_word) == 1:
            finalFacultyMappings[faculty] = {}
    


if __name__ == "__main__":
    process_data()