class User:
    '''A user and their data which will be used to determine if they can take a course'''

    def __init__(self, data=None):
        # Will load the data if any was given
        self.courses = {}
        self.cur_courses = [] # Courses the user is taking in the current term
        self.program = None  # NOTE: For now this is only single degree
        self.specialisations = {}
        self.uoc = 0
        self.wam = None
        self.year = 0  # TODO

        if data != None:
            # Data was provided
            self.load_json(data)


    def add_courses(self, courses):
        '''Given a dictionary of courses mapping course code to a (uoc, grade) tuple,
        adds the course to the user and updates the uoc/grade at the same time.
        NOTE: For now, this does not do anything for courses which the user has already taken
        '''
        for course in courses:
            if course not in self.courses:
                self.courses[course] = courses[course]

        # Determine the total wam (wam * uoc) of the user
        if self.wam != None:
            total_wam = self.wam * self.uoc
        else:
            total_wam = 0

        # Update the uoc and carefully update the wam for all the new given courses
        no_wam = True  # Flag to determine if the user has chosen to upload any wam
        for course, (uoc, grade) in courses.items():
            self.uoc += uoc

            if grade != None:
                no_wam = False
                total_wam += uoc * grade

        if no_wam == False:
            self.wam = total_wam / self.uoc

    def add_current_course(self, course):
        """Given a course the user is taking in their current term, adds it to their cur_courses"""
        self.cur_courses.append(course)

    def empty_current_courses(self):
        """Empty all the current courses. Helps with moving on to the next term
        in the term planner api"""
        self.cur_courses = []

    def add_program(self, program):
        '''Adds a program to this user'''
        self.program = program # TODO: This should update to reflect UOC of user

    def add_specialisation(self, specialisation):
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
        
        self.program = data['program']
        self.specialisations = data['specialisations']
        self.courses = data['courses']
        self.year = data['year']

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
        '''Given a course which the student has taken, returns their grade (or None for no grade'''
        return self.courses[course][1]

    def update_wam_uoc(self):
        """Calculates and sets the overall wam and uoc of the user from their courses. 
        NOTE: This actually changes the user's wam, not simply a getter method"""
        if not self.courses:
            # No courses
            self.wam = None
            self.uoc = 0
            return
        
        total_wam = 0
        eligible_uoc = 0 # uoc which counts towards wam
        self.uoc = 0 # Resets the uoc
        for course, (uoc, grade) in self.courses.items():
            # Update the uoc as we go whils getting the total and eligible uoc
            self.uoc += uoc
            if total_wam is not None and grade is not None:
                eligible_uoc += uoc
                total_wam += uoc * grade
        
        if eligible_uoc == 0:
            self.wam = None
        else:
            # Divide to get the overall wam
            self.wam = total_wam / eligible_uoc


    def unselect_course(self, target, locked):
        """Given a course to unselect and a list of locked courses, remove the courses
        from the user and return a list of courses which would be affected by the unselection"""

        # Resolving circular imports
        from algorithms.create import create_condition
        from algorithms.objects.conditions import CACHED_CONDITIONS_TOKENS
    
        if not self.has_taken_course(target):
            # Nothing would be affected by unselecting this course since we never
            # took this course in the first place...
            return []

        # Load all the necessary conditions
        cached_conditions = {} # Mapping course to condition object
        for course in self.courses:
            if course in locked:
                # Do not bother creating condition for a locked course
                continue
            else:
                cached_conditions[course] = create_condition(CACHED_CONDITIONS_TOKENS[course], course)
                
        # First remove this course from our database (updating overall UOC and WAM)
        del self.courses[target]
        self.update_wam_uoc()

        affected_courses = []
        # Brute force loop through all courses and if we find a course which is
        # no longer unlocked, we unselect it, add it to the affected course list,
        # then restart loop.

        while True:
            changed = False

            for course in self.courses:
                if course in cached_conditions and cached_conditions[course] != None:
                    # The course is not locked and there exists a condition
                    cond = cached_conditions[course]
                    if (cond.is_unlocked(self))["result"] is False:
                        # This course is no longer selectable due to our unselection
                        affected_courses.append(course)
                        changed = True
                        del self.courses[course]
                        self.update_wam_uoc()
                        break
                        
            # If no new courses were affected, we do not need to loop again
            if not changed:
                break
             
        return sorted(affected_courses)