import copy

from algorithms.objects.categories import AnyCategory, Category


class User:
    '''A user and their data which will be used to determine if they can take a course'''

    def __init__(self, data=None):
        # Will load the data if any was given
        self.courses: dict[str, (int, int)] = {}
        self.cur_courses: list[str, (int, int)] = [] # Courses the user is taking in the current term
        self.program: str = None
        self.specialisations: dict[str, int] = {}
        self.year = 0

        if data != None:
            # Data was provided
            self.load_json(data)

    def add_courses(self, courses: dict[str, (int, int)]):
        '''Given a dictionary of courses mapping course code to a (uoc, grade) tuple,
        adds the course to the user and updates the uoc/grade at the same time.
        this will update the data if the course has been taken already
        '''
        self.courses.update(courses)

    def add_current_course(self, course: str):
        """Given a course the user is taking in their current term, adds it to their cur_courses"""
        self.cur_courses.append(course)

    def add_current_courses(self, courses: list[str]):
        self.cur_courses.extend(courses)

    def empty_current_courses(self):
        """Empty all the current courses. Helps with moving on to the next term
        in the term planner api"""
        self.cur_courses.clear()

    def add_program(self, program: str):
        '''Adds a program to this user'''
        self.program = program

    def add_specialisation(self, specialisation: str):
        '''Adds a specialisation to this user'''
        self.specialisations[specialisation] = 1

    def has_taken_course(self, course: str):
        '''Determines if the user has taken this course'''
        return course in self.courses

    def is_taking_course(self, course: str):
        """Determines if the user is taking this course this term"""
        return course in self.cur_courses

    def in_program(self, program: str):
        '''Determines if the user is in this program code'''
        return self.program == program

    def in_specialisation(self, specialisation: str):
        '''Determines if the user is in the specialisation'''
        return specialisation in self.specialisations

    def load_json(self, data):
        '''Given the user data, correctly loads it into this user class'''

        self.program = copy.deepcopy(data['program'])
        self.specialisations = copy.deepcopy(data['specialisations'])
        self.courses = copy.deepcopy(data['courses'])
        self.year = copy.deepcopy(data['year'])

    def get_grade(self, course: str):
        '''Given a course which the student has taken, returns their grade (or None for no grade)'''
        return self.courses[course][1]

    def wam(self, category: Category = AnyCategory()):
        total_wam, total_uoc = 0, 0

        for course, (uoc, grade) in self.courses.items():
            if grade != None and category.match_definition(course):
                total_uoc += uoc
                total_wam += uoc * grade

        return None if total_uoc == 0 else total_wam / total_uoc

    def uoc(self, category: Category = AnyCategory()):
        '''Given a user, returns the number of units they have taken for this uoc category'''
        return sum(uoc for course, (uoc, _) in self.courses.items() if category.match_definition(course))


    def unselect_course(self, target, locked) -> list[str]:
        """Given a course to unselect and a list of locked courses, remove the courses
        from the user and return a list of courses which would be affected by the unselection"""
        if not self.has_taken_course(target):
            return []

        # Resolving circular imports
        from algorithms.create import create_condition
        from algorithms.objects.conditions import CACHED_CONDITIONS_TOKENS

        # Load all the necessary conditions
        cached_conditions = {
            course : create_condition(CACHED_CONDITIONS_TOKENS[course], course)
            for course in self.courses if not course in locked
        }

        affected_courses = []
        # Brute force loop through all taken courses and if we find a course which is
        # no longer unlocked, we unselect it, add it to the affected course list,
        # then restart loop.
        courses_to_delete = [target]
        while courses_to_delete:
            affected_courses.extend(courses_to_delete)
            for course in courses_to_delete:
                del self.courses[course]
            courses_to_delete = [
                course for course in self.courses
                if cached_conditions.get(course) is not None # course is in conditions
                and not (cached_conditions[course].is_unlocked(self))["result"] # not unlocked anymore
            ]

        return list(sorted(affected_courses))


