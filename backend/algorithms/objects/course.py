from dataclasses import dataclass
from typing import TYPE_CHECKING, Optional, Tuple

from data.config import get_terms_per_year

if TYPE_CHECKING:
    from algorithms.objects.conditions import Condition

@dataclass
class Course:
    name: str
    condition: "Condition"
    mark: int
    uoc: int
    terms: dict[int, list[int]]
    locked: Optional[tuple[int, int]] = None
    def term_domain(self, start: Tuple[int, int], end: Tuple[int, int]):
        """ create a domain of terms this course can be in for autoplanning """
        if self.locked:
            locked_number = (self.locked[0] - start[0]) * 4 + self.locked[1] - start[1]
            return [[locked_number, locked_number]]
        numbers = []
        for key, value in self.terms.items():
            for term in value:
                # skip terms that do not exist in that calendar year,
                # e.g. T3 from 2028 onwards (the summer term T0 always exists)
                if term != 0 and term > get_terms_per_year(key):
                    continue
                new_number = (key - start[0]) * 4 + term - start[1]
                if new_number <= (end[0] - start[0]) * 4 + end[1] - start[1]:
                    numbers.append(new_number)
        return [[number, number] for number in numbers]
