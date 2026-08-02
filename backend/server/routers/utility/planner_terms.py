"""
Year-aware validation of planner term placements.

The number of standard terms per year is configured in data.config
(3 terms before 2028, 2 terms from 2028 onwards), so a term such as T3
only exists in some calendar years.
"""

from typing import Dict, List

from fastapi import HTTPException

from data.config import get_terms_list, get_terms_per_year


# How many years a multiterm placement walk may cross before giving up.
# Guards against endless walks when a course's offered terms never exist
# again, e.g. a T3-only course spilling forward past 2028.
MAX_MULTITERM_YEAR_SPAN = 100


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


def get_multiterm_placements(  # pylint: disable=too-many-arguments,too-many-positional-arguments
    dest_year: int,
    current_term: str,
    num_instances: int,
    terms_offered: List[str],
    is_summer_enabled: bool,
    instance_num: int,
) -> List[Dict[str, int | str]]:
    """
    Determines which terms each instance of a multiterm course lands in when
    the instance numbered instance_num is placed in current_term of dest_year.

    Placements walk chronologically through the terms that exist in each
    calendar year, so a term the course is offered in but which does not
    exist in a given year (e.g. T3 from 2028 onwards) is skipped over.

    Returns:
        A list of {'term': str, 'row_offset': int} placements, ordered
        chronologically, with row_offset relative to dest_year. Empty if the
        course is not offered in current_term or current_term does not exist
        in dest_year.

    Raises:
        HTTPException: 400 if the course's remaining instances can never be
            placed because its offered terms stop existing.
    """
    def offered_terms_in(year: int) -> List[str]:
        return [
            term for term in get_terms_list(year, include_summer=is_summer_enabled)
            if term in terms_offered
        ]

    def unplaceable() -> HTTPException:
        return HTTPException(
            status_code=400,
            detail='This multiterm course cannot be placed here: the terms it '
                   'is offered in do not exist in the surrounding years'
        )

    dest_terms = offered_terms_in(dest_year)
    if current_term not in dest_terms:
        return []

    placements: List[Dict[str, int | str]] = []

    # Walk backwards to place the instances before the dragged one
    row_offset = 0
    terms = dest_terms
    index = terms.index(current_term) - 1
    for _ in range(instance_num):
        while index < 0:
            row_offset -= 1
            if row_offset < -MAX_MULTITERM_YEAR_SPAN:
                raise unplaceable()
            terms = offered_terms_in(dest_year + row_offset)
            index = len(terms) - 1
        placements.insert(0, {'term': terms[index], 'row_offset': row_offset})
        index -= 1

    # Walk forwards from the dragged instance
    row_offset = 0
    terms = dest_terms
    index = terms.index(current_term)
    for _ in range(instance_num, num_instances):
        while index >= len(terms):
            row_offset += 1
            if row_offset > MAX_MULTITERM_YEAR_SPAN:
                raise unplaceable()
            terms = offered_terms_in(dest_year + row_offset)
            index = 0
        placements.append({'term': terms[index], 'row_offset': row_offset})
        index += 1

    return placements


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
