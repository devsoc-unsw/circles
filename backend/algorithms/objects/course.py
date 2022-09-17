from dataclasses import dataclass
from typing import Tuple
from algorithms.objects.conditions import Condition

@dataclass
class Course:
    name: str
    condition: Condition
    mark: int
    uoc: int
    terms: dict[int, list[int]]
    def term_domain(self, start: Tuple[int, int]):
        numbers = []
        for key, value in self.terms.items():
            for term in value:
                numbers.append((key - start[0]) * 4 + term - start[1])
        return [[number, number] for number in numbers]
