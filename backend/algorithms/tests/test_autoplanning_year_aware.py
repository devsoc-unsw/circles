"""
Year-aware autoplanning: terms that do not exist in a calendar year
(e.g. T3 from 2028 onwards) must never receive autoplanned courses.
"""

from pytest import raises

from algorithms.autoplanning import autoplan, consecutive_existing_slot_pairs
from algorithms.create import create_condition
from algorithms.objects.course import Course
from algorithms.objects.user import User


def unconditional():
    return create_condition(["(", ")"])


def blank_user() -> User:
    return User({
        "program": "3778",
        "specialisations": ["COMPA1"],
        "courses": {},
    })


def test_term_domain_excludes_terms_that_do_not_exist():
    course = Course("FAKE1001", unconditional(), 75, 6, {2027: [1, 2, 3], 2028: [1, 2, 3]})
    domain = course.term_domain((2027, 0), (2028, 3))
    # 2027 keeps T1-T3 (slots 1-3), 2028 keeps only T1-T2 (slots 5-6)
    assert [interval[0] for interval in domain] == [1, 2, 3, 5, 6]


def test_term_domain_keeps_summer_term_from_2028():
    course = Course("FAKE1001", unconditional(), 75, 6, {2028: [0, 3]})
    domain = course.term_domain((2028, 0), (2028, 3))
    assert [interval[0] for interval in domain] == [0]


def test_consecutive_existing_slot_pairs_are_adjacent_before_2028():
    assert consecutive_existing_slot_pairs((2020, 0), (2021, 3)) == [
        (0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 7),
    ]


def test_consecutive_existing_slot_pairs_skip_missing_t3():
    assert consecutive_existing_slot_pairs((2027, 0), (2029, 2)) == [
        (0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 8), (8, 9), (9, 10),
    ]


def test_autoplan_never_places_into_nonexistent_term():
    results = autoplan(
        [Course("FAKE1001", unconditional(), 75, 6, {2028: [1, 2, 3], 2029: [1, 2, 3]})],
        blank_user(),
        (2028, 0),
        (2029, 2),
        [12, 20, 20, 20, 12, 20, 20],
    )
    assert all(term != 3 for _, (_, term) in results)


def test_autoplan_infeasible_when_course_only_offered_in_nonexistent_terms():
    with raises(ValueError):
        autoplan(
            [Course("FAKE1001", unconditional(), 75, 6, {2028: [3]})],
            blank_user(),
            (2028, 0),
            (2028, 3),
            [12, 20, 20, 20],
        )


def test_autoplan_multiterm_spills_across_missing_t3_via_summer():
    multiterm_instances = [
        Course("FAKE1001", unconditional(), 75, 3, {2028: [0, 1, 2], 2029: [0, 1, 2]})
        for _ in range(2)
    ]
    # Caps only leave room in T2 2028 and T0 2029, so the consecutive
    # multiterm instances must spill over the nonexistent T3 2028.
    results = autoplan(
        multiterm_instances,
        blank_user(),
        (2028, 0),
        (2029, 2),
        [0, 0, 3, 0, 3, 0, 0],
    )
    assert sorted(placement for _, placement in results) == [(2028, 2), (2029, 0)]
