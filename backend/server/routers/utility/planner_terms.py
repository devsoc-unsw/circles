"""
Year-aware validation of planner term placements.

The number of standard terms per year is configured in data.config
(3 terms before 2028, 2 terms from 2028 onwards), so a term such as T3
only exists in some calendar years.
"""

from typing import Dict, List

from fastapi import HTTPException

from data.config import get_terms_list, get_terms_per_year


def validate_term_exists(year: int, term: str, is_summer_enabled: bool) -> None:
    """
    Raise a 400 if the given term identifier is not a real term in the given
    calendar year (the summer term T0 only counts when summer is enabled).
    """
    valid_terms = get_terms_list(year, include_summer=is_summer_enabled)
    if term not in valid_terms:
        raise HTTPException(
            status_code=400,
            detail=f'{term} is not a valid term in {year}. Valid terms: {", ".join(valid_terms)}'
        )


def validate_locked_term_string(termyear: str) -> None:
    """
    Raise a 400 if a lockedTerms key such as '2028T3' does not name a real
    term in its year. Locking T0 is always allowed as the summer toggle only
    affects course placement.
    """
    year_str, _, term_str = termyear.partition('T')
    if not (year_str.isnumeric() and term_str.isnumeric()):
        raise HTTPException(status_code=400, detail="Invalid term/year")

    year, term_num = int(year_str), int(term_str)
    if not 0 <= term_num <= get_terms_per_year(year):
        raise HTTPException(status_code=400, detail="Invalid term/year")


def validate_multiterm_terms(
    start_year: int,
    dest_row: int,
    terms_list: List[Dict[str, int | str]],
    is_summer_enabled: bool,
) -> None:
    """
    Raise a 400 if any placement of a multiterm course (as computed by
    planner.get_terms_list) lands in a term that does not exist in its
    calendar year, e.g. spilling into T3 of a 2-term year.
    """
    for term_row in terms_list:
        term = str(term_row['term'])
        year = start_year + dest_row + int(term_row['row_offset'])
        validate_term_exists(year, term, is_summer_enabled)
