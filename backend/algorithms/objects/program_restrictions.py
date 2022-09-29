"""
Contains `ProgramRestrictions` and relevant sub-classes
"""

from abc import ABC, abstractmethod
from typing import Optional
from algorithms.objects.categories import Category
from algorithms.objects.conditions import Condition

from algorithms.objects.user import User


class ProgramRestriction(ABC):
    """
    Abstract class for program restrictions
    """

    # TODO: In the long-run (imo), we should stop passing courses around as
    # just strings. Rather, they should be self-contained objects that
    # contain all their information (e.g. course code, name, Conditions)
    # Removes the need for this class to know how to fetch conditions
    @abstractmethod
    def validate_course_allowed(self, user: User, course: str) -> bool:
        """
        Returns whether or not the course is allowed.
        Future possibility: Also return back a str of why it may not
        be allowed
        """
        pass

    @abstractmethod
    def __str__(self) -> str:
        return super().__str__()

    @abstractmethod
    def __repr__(self) -> str:
        return super().__repr__()

class MaturityRestriction(ProgramRestriction):
    """
    Models the `Maturity Requirement` wherein, a certain condition (dependancy)
    must be achieved before a course from a given Category (dependant) can be taken.
    """

    def __init__(self, program: str, dependency: Condition, dependent: Category):
        self.program = program
        self.dependency = dependency
        self.dependent = dependent

    def match_dependant(self, course: str) -> bool:
        """
        Check if the given course is a match for the category defined in the dependant
        """
        return self.dependent.match_definition(course)

    def dependency_met(self, user: User) -> bool:
        return self.dependency.validate(user)[0]

    def validate_course_allowed(
            self, user: User, course: str,
        ) -> bool:
        """
        Validate whether a user can do the given course.
        Can not be done iff there is a match on dependant and dependency is not met
        """
        return not (self.match_dependant(course) and not self.dependency_met(user))

    def beneficial(self, user: User, course: dict[str, Tuple[int, int | None]]) -> bool:
        """
        Will a course be beneficial to advancing this condition?
        More specifically, can the course be used to meet the dependency?
        """
        return self.dependency.beneficial(user, course)

    def is_path_to(self, course: str) -> bool:
        return self.dependency.is_path_to(course)

    def __str__(self) -> str:
        return (
            f"MaturityCondition({self.program}): Dependency: {self.dependency}, self.dependent: {self.dependent}"
        )

