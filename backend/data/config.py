"""
Configuration file for Data.

This is intended to be imported by modules executed from `/backend`.
Assumes that `/backend` is the current working directory.
"""
# NOTE: UNSW releases next year's handbook during the T2 holidays. However, it's
# assumed that circles will only stably update to this new handbook a few weeks
# into T3. In this case, all the students will have already locked in all their
# courses for the current year and thus, we can treat the current year as an
# archived year (saving us time from maintaining 2 sets of algorithms for the
# current AND the future year)

# The latest current handbook year that we will maintain all the algorithms for
from typing import Dict, List

# Don't forget to update live year in the frontend too
LIVE_YEAR: int = 2026

# Number of standard academic terms (T1, T2, ...) per year, excluding the
# optional summer term (T0). Each key is the first year its value applies
# from; a year uses the value of the latest key at or before it.
# UNSW moves from 3 terms to 2 terms per year from 2028 onwards.
# Don't forget to keep this in sync with TERMS_PER_YEAR in the frontend too
TERMS_PER_YEAR: Dict[int, int] = {
    2019: 3,
    2028: 2,
}


def get_terms_per_year(year: int) -> int:
    """Number of standard terms (excluding summer term T0) in the given year."""
    applicable_years = [y for y in TERMS_PER_YEAR if y <= year]
    effective_year = max(applicable_years) if applicable_years else min(TERMS_PER_YEAR)
    return TERMS_PER_YEAR[effective_year]


def get_terms_list(year: int, include_summer: bool = False) -> List[str]:
    """Term identifiers for the given year, e.g. ['T1', 'T2', 'T3'].

    The summer term 'T0' is prepended when include_summer is True.
    """
    terms = [f"T{i}" for i in range(1, get_terms_per_year(year) + 1)]
    return (["T0"] + terms) if include_summer else terms

# The years for which we have archived
ARCHIVED_YEARS: List[int] = list(range(2019, LIVE_YEAR + 1))

# TODO: Consider adding file paths to this file so we don't have to type out
# the exact path to write to every time

CONDITIONS_TOKEN_FILE: str = "./data/final_data/conditionsTokens.json"
CONDITIONS_PICKLE_FILE: str = "./data/final_data/conditions.pkl"

GRAPH_CACHE_FILE = "./data/final_data/graph.json"
