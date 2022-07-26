# pylint: disable=missing-class-docstring
# pylint: disable=missing-module-docstring
from typing import TypedDict, Optional


class ProgramContainer(TypedDict):
    type: str
    courses: Optional[dict[str, str | list[str]]]
    title: str
    credits_to_complete: Optional[int]
    levels: Optional[list[int]]
    notes: str

class SpecData(TypedDict):
    is_optional: bool
    specs: dict[str, str]
    notes: str

class SpecsData(TypedDict):
    honours: Optional[dict[str, SpecData]]
    minors: Optional[dict[str, SpecData]]
    majors: Optional[dict[str, SpecData]]

class Components(TypedDict):
    non_spec_data: list[ProgramContainer]
    spec_data: Optional[SpecsData]

class Program(TypedDict):
    title: str
    code: str
    duration: Optional[int]
    UOC: int
    faculty: str
    overview: str
    Structure_summary: str
    components: Components
    processing_warnings: list[str]
