from data.utility import data_helpers

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
    courseData = data_helpers.read_data("data/final_data/coursesProcessed.json")
    facultyMappings = data_helpers.read_data("algorithms/cache/mappings/facultyMappings.json")
    schoolMappings = data_helpers.read_data("algorithms/cache/mappings/schoolMappings.json")

    initialiseData(schoolMappings, facultyMappings)
    for course in courseData.values():
        mapCourse(course, schoolMappings, facultyMappings)

    data_helpers.write_data(
            finalSchoolMappings, "algorithms/cache/mappings/schoolCourseMappings.json")
    data_helpers.write_data(
            finalFacultyMappings, "algorithms/cache/mappings/facultyCourseMappings.json")

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
