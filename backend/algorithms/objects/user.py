import copy


class User:
    '''A user and their data which will be used to determine if they can take a course'''

    def __init__(self, data=None):
        # Will load the data if any was given
        self.courses: dict[str, (int, int)] = {}
        self.cur_courses: list[str, (int, int)] = [] # Courses the user is taking in the current term
        self.program = None  # NOTE: For now this is only single degree
        self.specialisations = {}
        self.uoc = 0
        self.wam = None
        self.year = 0  # TODO

        if data != None:
            # Data was provided
            self.load_json(data)

    def add_courses(self, courses: dict[str, (int, int)]):
        '''Given a dictionary of courses mapping course code to a (uoc, grade) tuple,
        adds the course to the user and updates the uoc/grade at the same time.
        NOTE: For now, this does not do anything for courses which the user has already taken
        '''
        for course in courses:
            if course not in self.courses:
                self.courses[course] = courses[course]

        self.update_wam_uoc()

    def add_current_course(self, course: str):
        """Given a course the user is taking in their current term, adds it to their cur_courses"""
        self.cur_courses.append(course)

    def add_current_courses(self, courses: list[str]):
        self.cur_courses.extend(courses)

    def empty_current_courses(self):
        """Empty all the current courses. Helps with moving on to the next term
        in the term planner api"""
        self.cur_courses.clear()

    def add_program(self, program):
        '''Adds a program to this user'''
        self.program = program # TODO: This should update to reflect UOC of user

    def add_specialisation(self, specialisation: str):
        '''Adds a specialisation to this user'''
        self.specialisations[specialisation] = 1  # TODO: This should update to reflect UOC of user

    def has_taken_course(self, course):
        '''Determines if the user has taken this course'''
        return course in self.courses

    def is_taking_course(self, course):
        """Determines if the user is taking this course this term"""
        return course in self.cur_courses

    def in_program(self, program):
        '''Determines if the user is in this program code'''
        return self.program == program

    def in_specialisation(self, specialisation):
        '''Determines if the user is in the specialisation'''
        return specialisation in self.specialisations

    def load_json(self, data):
        '''Given the user data, correctly loads it into this user class'''

        self.program = copy.deepcopy(data['program'])
        self.specialisations = copy.deepcopy(data['specialisations'])
        self.courses = copy.deepcopy(data['courses'])
        self.year = copy.deepcopy(data['year'])
        '''calculate wam and uoc'''
        # Subtract uoc of the courses without mark when dividing
        uocfixer = 0
        for c in self.courses:
            self.uoc += self.courses[c][0]
            if type(self.courses[c][1]) != type(1):
                uocfixer += self.courses[c][0]
                continue
            if self.wam is None:
                self.wam = 0
            self.wam += self.courses[c][0] * self.courses[c][1]
        if self.wam is not None:
            self.wam /= (self.uoc - uocfixer)
        
        return

    def get_grade(self, course):
        '''Given a course which the student has taken, returns their grade (or None for no grade)'''
        return self.courses[course][1]

    def update_wam_uoc(self):
        """Calculates and sets the overall wam and uoc of the user from their courses. 
        NOTE: This actually changes the user's wam, not simply a getter method"""
        if not self.courses:
            self.wam = None
            self.uoc = 0
            return

        total_wam = 0
        eligible_uoc = 0 # uoc which counts towards wam
        self.uoc = 0
        for (uoc, grade) in self.courses.values():
            # Update the uoc as we go whilst getting the total and eligible uoc
            self.uoc += uoc
            if grade is not None:
                eligible_uoc += uoc
                total_wam += uoc * grade

        self.wam = None if eligible_uoc == 0 else total_wam / eligible_uoc


    def unselect_course(self, target, locked) -> list[str]:
        """Given a course to unselect and a list of locked courses, remove the courses
        from the user and return a list of courses which would be affected by the unselection"""

        # Resolving circular imports
        from algorithms.create import create_condition
        from algorithms.objects.conditions import CACHED_CONDITIONS_TOKENS
        from algorithms.objects.conditions import FirstCompositeCondition
    
        if not self.has_taken_course(target):
            return []

        # Load all the necessary conditions
        cached_conditions: dict[str, FirstCompositeCondition] = {} # Mapping course to condition object
        for course in self.courses:
            if not course in locked:
                cached_conditions[course] = create_condition(CACHED_CONDITIONS_TOKENS[course], course)
        print(CACHED_CONDITIONS_TOKENS["MATH1081"])
        del self.courses[target]
        self.update_wam_uoc()
        affected_courses = []
        # Brute force loop through all courses and if we find a course which is
        # no longer unlocked, we unselect it, add it to the affected course list,
        # then restart loop.

        while True:
            courses_to_delete = [
                course for course in self.courses
                if cached_conditions.get(course) is not None
                and not (cached_conditions[course].is_unlocked(self))["result"]
            ]
            # these courses are no longer selectable due to our unselection
            affected_courses.extend(courses_to_delete)
            for course in courses_to_delete:
                del self.courses[course]
            self.update_wam_uoc()

            if not courses_to_delete:
                break

        return sorted(affected_courses)