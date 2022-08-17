from dataclasses import dataclass
from algorithms.objects.conditions import Condition

@dataclass
class Course:
    name: str
    condition: Condition
    mark: int
    uoc: int
    terms: dict[int, list[int]]