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
    assert no_cond.validate(user) == True

    # Should work even if the user has taken courses already
    user.add_courses({
        "COMP1511": (6, 75),
        "COMP1521": (6, 80)
    })

    assert no_cond.validate(user) == True


def test_course_condition():
    user = create_student_3707_COMPA1()

    single_cond = create_condition(["(", "COMP1511", ")"])[0]
    assert single_cond.validate(user) == False

    user.add_courses({
        "MATH1141": (6, 80)
    })
    assert single_cond.validate(user) == False

    user.add_courses({
        "COMP1511": (6, 80)
    })
    assert single_cond.validate(user) == True


def test_composite_condition_course():
    '''AND/OR conditions with only course requirements'''
    user = create_student_3707_COMPA1()

    and_cond = create_condition(
        ["(", "COMP1511", "&&", "COMP1521", "&&", "COMP1531", ")"])[0]
    assert and_cond.validate(user) == False

    user.add_courses({
        "COMP1511": (6, 80),
        "COMP1531": (6, None),
        "MATH1141": (6, None)
    })
    assert and_cond.validate(user) == False

    user.add_courses({
        "COMP1521": (6, None)
    })
    assert and_cond.validate(user) == True

    or_cond = create_condition(
        ["(", "MATH1081", "||", "MATH1151", "||", "MATH1241", ")"])[0]
    assert or_cond.validate(user) == False

    user.add_courses({
        "MATH1151": (6, 90),
    })
    assert or_cond.validate(user) == True

    and_or_cond = create_condition(["(", "(", "COMP1511", "||", "COMP1521", ")", "&&",
                                   "(", "MATH1141", "&&", "MATH1151", ")", "&&", "(", "COMP2041", "&&", "COMP1531", ")", ")"])[0]
    assert and_or_cond.validate(user) == False

    user.add_courses({
        "COMP1141": (6, None)
    })
    assert and_or_cond.validate(user) == False

    user.add_courses({
        "COMP2041": (6, None)
    })
    assert and_or_cond.validate(user) == True


def test_uoc_condition_simple():
    '''Testing simple uoc condition without complex keywords'''
    user = create_student_3707_COMPA1()
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
        "COMP1531": (6, None),
        "MATH2859": (3, None)
    })

    cond_12 = create_condition(["(", "12UOC", ")"])[0]
    cond_21 = create_condition(["(", "21UOC", ")"])[0]
    cond_30 = create_condition(["(", "30UOC", ")"])[0]

    assert cond_12.validate(user) == True
    assert cond_21.validate(user) == True
    assert cond_30.validate(user) == False


def test_uoc_condition_complex():
    '''Testing uoc condition including keywords'''
    user = create_student_3707_COMPA1()
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
        "COMP1531": (6, None),
        "MATH1141": (6, 90),
        "MATH1151": (6, 90),
        "MATH2400": (3, 90),
    })

    cond_12_comp = create_condition(["(", "12UOC", "in", "COMP", ")"])[0]
    cond_12_math = create_condition(["(", "12UOC", "in", "MATH", ")"])[0]
    cond_18_comp = create_condition(["(", "18UOC", "in", "COMP", ")"])[0]
    cond_15_math = create_condition(["(", "15UOC", "in", "MATH", ")"])[0]
    cond_30_comp = create_condition(["(", "30UOC", "in", "COMP", ")"])[0]
    cond_30_math = create_condition(["(", "30UOC", "in", "MATH", ")"])[0]

    assert cond_12_comp.validate(user) == True
    assert cond_12_math.validate(user) == True
    assert cond_18_comp.validate(user) == True
    assert cond_15_math.validate(user) == True
    assert cond_30_comp.validate(user) == False
    assert cond_30_math.validate(user) == False

    # Nonexistent categories shouldn't work...
    cond_12_engg = create_condition(["(", "12UOC", "in", "ENGG", ")"])[0]
    assert cond_12_engg.validate(user) == False


def test_wam_condition_simple():
    '''Testing simple wam condition without complex keywords'''
    user = create_student_3707_COMPA1()
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None)
    })

    # Pass on None WAM
    cond1 = create_condition(["(", "70WAM", ")"])[0]
    assert cond1.validate(user) == True

    user1 = create_student_3707_COMPA1()
    user1.add_courses({
        "COMP1511": (6, 80),
        "COMP1521": (6, 90),
        "COMP1531": (6, 100)
    })
    assert cond1.validate(user) == True

    cond2 = create_condition((["(", "90WAM", ")"]))[0]
    assert cond2.validate(user) == True

    cond3 = create_condition((["(", "90WAM", ")"]))[0]
    assert cond3.validate(user) == True

    cond4 = create_condition((["(", "100WAM", ")"]))[0]
    assert cond2.validate(user) == False


def test_wam_condition_complex():
    '''Testing wam condition including keywords'''
    user = create_student_3707_COMPA1()
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
        "MATH1131": (6, None),
        "MATH1141": (6, None),
    })

    # Pass on None WAM
    comp_cond_70 = create_condition(["(", "70WAM", "in", "COMP", ")"])[0]
    assert comp_cond_70.validate(user) == True

    math_cond_70 = create_condition(["(", "70WAM", "in", "MATH", ")"])[0]
    assert math_cond_70.validate(user) == True

    comp_math_cond_70 = create_condition(
        ["(", "70WAM", "in", "(", "COMP", "||" "MATH", ")"])[0]
    assert comp_math_cond_70.validate(user) == True

    user1 = create_student_3707_COMPA1()
    user1.add_courses({
        "COMP1511": (6, 65),
        "COMP1521": (6, 80),
        "MATH1131": (6, 50),
        "MATH1141": (6, 50),
    })

    assert comp_cond_70.validate(user1) == True
    assert math_cond_70.validate(user1) == False
    assert comp_math_cond_70.validate(user1) == True
