'''Testing logic. This will include hard coded data tests. We want to
ensure our algorithms work as expected.

If these tests work, we can expect that the core logic works.
'''

from conditions import *
import pytest


def create_student_3707_COMPA1():
    user = User()
    user.add_program("3707")
    user.add_specialisation("COMPA1")
    return user

def test_no_condition():
    user = create_student_3707_COMPA1()

    no_cond = create_condition(["(", ")"])[0]
    assert (no_cond.is_unlocked(user))["result"] == True

    # Should work even if the user has taken courses already
    user.add_courses({
        "COMP1511": (6, 75),
        "COMP1521": (6, 80)
    })

    assert (no_cond.is_unlocked(user))["result"] == True