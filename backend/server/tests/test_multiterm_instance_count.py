"""
Unit tests for year-aware multiterm instance counting
(server.routers.utility.common.get_multiterm_instance_count).

A multiterm course only needs multiple instances if it is actually offered in
a term that exists somewhere in the years being planned. Terms per year are
year-dependent (3 standard terms before 2028, 2 from 2028 onwards), so a
T3-only course is not multiterm-plannable in an all-semester planner.
"""

from server.routers.utility.common import get_multiterm_instance_count


def _details(terms, uoc=3, is_multiterm=True):
    return {'is_multiterm': is_multiterm, 'terms': terms, 'UOC': uoc}


def test_non_multiterm_course_needs_one_instance():
    assert get_multiterm_instance_count(
        _details(['T1', 'T2', 'T3'], is_multiterm=False), False, [2026, 2027]) == 1


def test_multiterm_course_expands_across_three_term_years():
    assert get_multiterm_instance_count(_details(['T1', 'T2', 'T3']), False, [2026, 2027]) == 2
    assert get_multiterm_instance_count(_details(['T1', 'T2'], uoc=2), False, [2026]) == 3


def test_t3_only_course_is_not_multiterm_in_an_all_semester_planner():
    # T3 does not exist from 2028, so there is nowhere for a second instance to go
    assert get_multiterm_instance_count(_details(['T3']), False, [2028, 2029]) == 1


def test_t3_only_course_still_expands_when_a_three_term_year_is_planned():
    assert get_multiterm_instance_count(_details(['T3']), False, [2027, 2028]) == 2


def test_summer_only_course_depends_on_the_summer_toggle():
    assert get_multiterm_instance_count(_details(['T0']), False, [2026, 2027]) == 1
    assert get_multiterm_instance_count(_details(['T0']), True, [2026, 2027]) == 2


def test_no_planned_years_needs_one_instance():
    assert get_multiterm_instance_count(_details(['T1', 'T2', 'T3']), False, []) == 1
