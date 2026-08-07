"""
Tests for GET /courses/popularElectives - "popular electives per degree".

Integration tests: they hit the live backend at 127.0.0.1:8000 and ALSO connect
to the same Mongo directly to inject a controlled user population.

Response contract (what the endpoint returns):
    {
      "programCode": "3778",
      "sampleSize": <int>,                       # setup users in this program
      "popular": [                               # electives only, top N, desc by count
          {"courseCode": "COMP3121", "count": 5, "percent": 0.83}, ...
      ]
    }

Import order matters: importing user.utility FIRST points Mongo/Redis at
localhost before any connection opens.
"""
import pytest
import requests

from server.tests.user.utility import clear, insert_setup_users, make_setup_user
from server.routers.courses import MIN_POPULAR_SAMPLE, POPULAR_LIMIT
from server.routers.utility.common import get_core_courses, get_elective_courses, get_gen_eds

BASE = "http://127.0.0.1:8000"
PROGRAM = "3778"     # Computer Science
SPEC = "COMPA1"      # the CS major
SPECS = [SPEC]
# Endpoint tests need a cohort at or above the floor, or they get an empty list.
COHORT = MIN_POPULAR_SAMPLE

# Genuine core/elective codes from the seeded handbook data; forced disjoint.
_CORES = get_core_courses(PROGRAM, SPECS)
_ELECTIVES = sorted(get_elective_courses(PROGRAM, SPECS))
CORE = next(c for c in _CORES if c not in _ELECTIVES)
ELECTIVES = [e for e in _ELECTIVES if e not in _CORES]
E1, E2, E3 = ELECTIVES[0], ELECTIVES[1], ELECTIVES[2]


def get_popular(program=PROGRAM, spec=SPEC):
    return requests.get(f"{BASE}/courses/popularElectives/{program}/{spec}")


def by_code(body):
    """popular list -> {courseCode: entry} for easy lookup."""
    return {e["courseCode"]: e for e in body["popular"]}


# --- Classification: get_elective_courses excludes core + gen-ed -----------

def test_elective_set_excludes_core_and_gened():
    electives = get_elective_courses(PROGRAM, SPECS)
    cores = set(get_core_courses(PROGRAM, SPECS))
    geneds = set(get_gen_eds(PROGRAM)["courses"].keys())

    assert electives
    assert not (electives & cores)
    assert not (electives & geneds)


# --- Level A: the aggregation helper alone (raw counts) --------------------

def test_query_counts_courses_for_program():
    clear()
    insert_setup_users([make_setup_user(f"u{i}", PROGRAM, SPECS, [E1]) for i in range(6)])

    from server.routers.courses import count_program_course_frequencies
    counts, sample_size = count_program_course_frequencies(PROGRAM)

    assert sample_size == 6
    assert counts[E1] == 6


def test_query_only_counts_matching_program():
    clear()
    insert_setup_users(
        [make_setup_user(f"a{i}", PROGRAM, SPECS, [E1]) for i in range(4)]
        + [make_setup_user(f"b{i}", "3502", [], [E2]) for i in range(3)]
    )

    from server.routers.courses import count_program_course_frequencies
    counts, sample_size = count_program_course_frequencies(PROGRAM)

    assert sample_size == 4
    assert E2 not in counts


def test_query_only_counts_matching_spec():
    clear()
    insert_setup_users(
        [make_setup_user(f"s{i}", PROGRAM, SPECS, [E1]) for i in range(5)]
        + [make_setup_user(f"o{i}", PROGRAM, ["COMPD1"], [E2]) for i in range(4)]
    )

    from server.routers.courses import count_program_course_frequencies
    counts, sample_size = count_program_course_frequencies(PROGRAM, SPECS)

    # only the 5 COMPA1 students are in scope; the other spec's plans are ignored
    assert sample_size == 5
    assert counts[E1] == 5
    assert E2 not in counts

    # ...and without a spec filter, the whole program is counted
    all_counts, all_sample = count_program_course_frequencies(PROGRAM)
    assert all_sample == 9
    assert all_counts[E2] == 4


def test_query_empty_when_no_users():
    clear()

    from server.routers.courses import count_program_course_frequencies
    counts, sample_size = count_program_course_frequencies(PROGRAM)

    assert sample_size == 0
    assert counts == {}


# --- Level B: endpoint - specific courses, exact counts, ordering ----------

def test_invalid_program_returns_400():
    clear()
    res = requests.get(f"{BASE}/courses/popularElectives/NOTAPROGRAM/{SPEC}")
    assert res.status_code == 400


def test_empty_below_min_sample():
    clear()
    short = MIN_POPULAR_SAMPLE - 1
    insert_setup_users([make_setup_user(f"u{i}", PROGRAM, SPECS, [E1]) for i in range(short)])

    res = get_popular()

    assert res.status_code == 200
    body = res.json()
    assert body["sampleSize"] == short
    assert body["popular"] == []      # one short of the floor -> nothing reported


def test_reports_once_min_sample_reached():
    clear()
    insert_setup_users([make_setup_user(f"u{i}", PROGRAM, SPECS, [E1]) for i in range(MIN_POPULAR_SAMPLE)])

    body = get_popular().json()

    assert body["sampleSize"] == MIN_POPULAR_SAMPLE
    assert by_code(body)[E1]["count"] == MIN_POPULAR_SAMPLE


def test_core_course_not_popular_even_if_everyone_takes_it():
    clear()
    insert_setup_users([make_setup_user(f"u{i}", PROGRAM, SPECS, [CORE, E1]) for i in range(COHORT)])

    table = by_code(get_popular().json())

    assert CORE not in table               # core: never popular
    assert table[E1]["count"] == COHORT    # elective: counted


def test_gen_ed_course_not_popular_even_if_everyone_takes_it():
    clear()
    gen_ed = next(iter(get_gen_eds(PROGRAM)["courses"].keys()))
    insert_setup_users([make_setup_user(f"u{i}", PROGRAM, SPECS, [gen_ed, E1]) for i in range(COHORT)])

    table = by_code(get_popular().json())

    assert gen_ed not in table        # gen-ed: never popular
    assert table[E1]["count"] == COHORT


def test_specific_counts_percentages_and_ordering():
    clear()
    # Of COHORT students: E1 placed by all but one, E2 by three, E3 by nobody.
    e1_only = COHORT - 4
    plans = (
        [[E1, E2]] * 3          # 3 users take E1 and E2
        + [[E1]] * e1_only      # the rest take only E1  -> E1 = COHORT - 1
        + [[CORE]]              # 1 user takes only a core -> still in the sample
    )
    insert_setup_users([make_setup_user(f"u{i}", PROGRAM, SPECS, plan) for i, plan in enumerate(plans)])

    body = get_popular().json()
    table = by_code(body)

    assert body["sampleSize"] == COHORT
    # exact student counts per specific elective
    assert table[E1]["count"] == COHORT - 1
    assert table[E2]["count"] == 3
    assert table[E1]["percent"] == pytest.approx((COHORT - 1) / COHORT)
    assert table[E2]["percent"] == pytest.approx(3 / COHORT)
    # E3 was placed by nobody -> specifically NOT popular
    assert E3 not in table
    # ordered by count desc -> the most-placed elective is first
    assert body["popular"][0]["courseCode"] == E1


def test_caps_at_popular_limit():
    clear()
    # One more distinct elective than the cap, so the least-placed is cut off.
    top = ELECTIVES[: POPULAR_LIMIT + 1]
    # user i places top[0..i] -> count(top[j]) = (COHORT - j), all distinct
    insert_setup_users([
        make_setup_user(f"u{i}", PROGRAM, SPECS, top[: min(i + 1, len(top))])
        for i in range(COHORT)
    ])

    body = get_popular().json()
    table = by_code(body)

    assert len(body["popular"]) == POPULAR_LIMIT
    assert table[top[0]]["count"] == COHORT      # most-placed
    assert top[POPULAR_LIMIT] not in table       # least-placed, cut off
