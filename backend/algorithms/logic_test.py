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

    # TODO: None WAM should pass (with warning) we return just True for now
    cond1 = create_condition(["(", "70WAM", ")"])[0]
    print(f"User wam is {user.wam}")
    assert cond1.validate(user) == True

    user1 = create_student_3707_COMPA1()
    user1.add_courses({
        "COMP1511": (6, 80),
        "COMP1521": (6, 90),
        "COMP1531": (6, 100)
    })
    assert cond1.validate(user1) == True

    cond2 = create_condition((["(", "90WAM", ")"]))[0]
    assert cond2.validate(user1) == True

    cond3 = create_condition((["(", "90WAM", ")"]))[0]
    assert cond3.validate(user1) == True

    cond4 = create_condition((["(", "100WAM", ")"]))[0]
    assert cond4.validate(user1) == False


def test_wam_condition_complex():
    '''Testing wam condition including keywords'''
    user = create_student_3707_COMPA1()
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
        "MATH1131": (6, None),
        "MATH1141": (6, None),
    })

    # TODO: None WAM should pass (with warning) we return just True for now
    comp_cond_70 = create_condition(["(", "70WAM", "in", "COMP", ")"])[0]
    assert comp_cond_70.validate(user) == True

    math_cond_70 = create_condition(["(", "70WAM", "in", "MATH", ")"])[0]
    assert math_cond_70.validate(user) == True

    comp_math_cond_70 = create_condition(
        ["(", "70WAM", "in", "COMP", "||", "70WAM", "in", "MATH", ")"])[0]
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


def test_grade_condition():
    user = create_student_3707_COMPA1()
    user.add_courses({
        "COMP1511": (6, None),
        "MATH1131": (6, None)
    })

    comp1511_70 = create_condition(["(", "70GRADE", "in", "COMP1511", ")"])[0]
    comp1521_70 = create_condition(["(", "70GRADE", "in", "COMP1521", ")"])[0]
    math1131_70 = create_condition(["(", "70GRADE", "in", "MATH1131", ")"])[0]

    # TODO: None grades should pass (with warning) we just return True for now
    assert comp1511_70.validate(user) == True
    assert math1131_70.validate(user) == True

    # Has not taken the course. Should be false
    assert comp1521_70.validate(user) == False

    comp1511_60 = create_condition(["(", "60GRADE", "in", "COMP1511", ")"])[0]

    comp1511_90 = create_condition(["(", "90GRADE", "in", "COMP1511", ")"])[0]
    comp1521_90 = create_condition(["(", "90GRADE", "in", "COMP1521", ")"])[0]
    math1131_90 = create_condition(["(", "90GRADE", "in", "COMP1131", ")"])[0]

    user1 = create_student_3707_COMPA1()
    user1.add_courses({
        "COMP1511": (6, 70),
        "MATH1131": (6, 70),
    })

    assert comp1511_60.validate(user1) == True
    assert comp1511_70.validate(user1) == True
    assert comp1521_70.validate(user1) == False
    assert math1131_70.validate(user1) == True
    assert comp1511_90.validate(user1) == False
    assert comp1521_90.validate(user1) == False
    assert math1131_90.validate(user1) == False

    # Test complex grade conditions
    user2 = create_student_3707_COMPA1()
    user2.add_courses({
        "ENGG1000": (6, 50),
        "COMP1511": (6, 65),
        "COMP1521": (6, 85),
        "COMP1531": (6, 90),
    })

    complex_cond_100 = create_condition(
        ["(", "100GRADE", "in", "ENGG1000", "||", "100GRADE", "in", "COMP1511", "||", "100GRADE", "in", "COMP1521", ")"])[0]
    assert complex_cond_100.validate(user2) == False

    complex_cond_60 = create_condition(
        ["(", "60GRADE", "in", "ENGG1000", "||", "60GRADE", "in", "COMP1511", "||", "60GRADE", "in", "COMP1521", ")"])[0]
    assert complex_cond_60.validate(user2) == True

    # Some courses are not even taken
    complex_cond_70_not_taken = create_condition(
        ["(", "70GRADE", "in", "MATH1081", "||", "70GRADE", "in", "MATH1131", "||", "70GRADE", "in", "COMP1511", ")"])[0]
    assert complex_cond_70_not_taken.validate(user2) == False


def test_specialisation_condition_simple():
    """Testing simple specialisation condition such as enrolled in COMPA1"""
    user = create_student_3707_COMPA1()
    user.add_specialisation("ACCTA2")
    
    compa1_cond = create_condition(["(", "COMPA1", ")"])[0]
    accta2_cond = create_condition(["(", "ACCTA2", ")"])[0]
    finsa2_cond = create_condition(["(", "FINSA2", ")"])[0]

    assert compa1_cond.validate(user) == True
    assert accta2_cond.validate(user) == True
    assert finsa2_cond.validate(user) == False


def test_program_condition_simple():
    """Testing simple program condition such as enrolled in 3707"""
    user = create_student_3707_COMPA1()
    
    cond_3707 = create_condition(["(", "3707", ")"])[0]
    cond_3778 = create_condition(["(", "3778", ")"])[0]

    assert cond_3707.validate(user) == True
    assert cond_3778.validate(user) == False


def test_level_course_condition():
    '''Testing level conditions with course category such as L2 MATH'''
    user = create_student_3707_COMPA1()
    user.add_courses({
        "COMP1511": (6, None),
        "MATH1131": (6, None),
        "MATH1151": (6, None),
        "MATH2400": (3, None),
        "MATH2859": (3, None),
        "MATH2931": (6, None),
    })

    # UOC conditions
    l1_comp_6uoc_cond = create_condition(["(", "6UOC", "in", "L1", "COMP", ")"])[0]
    l1_comp_12uoc_cond = create_condition(["(", "12UOC", "in", "L1", "COMP", ")"])[0]
    l1_math_6uoc_cond = create_condition(["(", "6UOC", "in", "L1", "MATH", ")"])[0]
    l2_math_12uoc_cond = create_condition(["(", "12UOC", "in", "L2", "MATH", ")"])[0]
    l2_math_18uoc_cond = create_condition(["(", "18UOC", "in", "L2", "MATH", ")"])[0]

    assert l1_comp_6uoc_cond.validate(user) == True
    assert l1_comp_12uoc_cond.validate(user) == False
    assert l1_math_6uoc_cond.validate(user) == True
    assert l2_math_12uoc_cond.validate(user) == True
    assert l2_math_18uoc_cond.validate(user) == False

    # WAM conditions
    l1_comp_70wam_cond = create_condition(["(", "70WAM", "in", "L1", "COMP", ")"])[0]
    l1_comp_90wam_cond = create_condition(["(", "90WAM", "in", "L1", "COMP", ")"])[0]
    l2_comp_70wam_cond = create_condition(["(", "70WAM", "in", "L2", "COMP", ")"])[0]
    l2_comp_90wam_cond = create_condition(["(", "90WAM", "in", "L2", "COMP", ")"])[0]
    l1_math_70wam_cond = create_condition(["(", "70WAM", "in", "L1", "MATH", ")"])[0]
    l1_math_90wam_cond = create_condition(["(", "90WAM", "in", "L1", "MATH", ")"])[0]
    l2_math_70wam_cond = create_condition(["(", "70WAM", "in", "L2", "MATH", ")"])[0]
    l2_math_90wam_cond = create_condition(["(", "90WAM", "in", "L2", "MATH", ")"])[0]

    # TODO: None grades should pass (with warning) we just return True for now
    assert l1_comp_70wam_cond.validate(user) == True 
    assert l1_comp_90wam_cond.validate(user) == True
    assert l2_comp_70wam_cond.validate(user) == True
    assert l2_comp_90wam_cond.validate(user) == True
    assert l1_math_70wam_cond.validate(user) == True
    assert l1_math_90wam_cond.validate(user) == True
    assert l2_math_70wam_cond.validate(user) == True
    assert l2_math_90wam_cond.validate(user) == True

    user1 = create_student_3707_COMPA1()
    user1.add_courses({
        "COMP1511": (6, 80),
        "MATH1131": (6, 100),
        "MATH1151": (6, 100),
        "MATH2400": (3, 70),
        "MATH2859": (3, 70),
        "MATH2931": (6, 70)
    })

    assert l1_comp_70wam_cond.validate(user1) == True 
    assert l1_comp_90wam_cond.validate(user1) == False

    # TODO: How to deal with this? None grade but we haven't even taken the courses...
    assert l2_comp_70wam_cond.validate(user1) == True
    assert l2_comp_90wam_cond.validate(user1) == True
    assert l1_math_70wam_cond.validate(user1) == True
    assert l1_math_90wam_cond.validate(user1) == True
    assert l2_math_70wam_cond.validate(user1) == True
    assert l2_math_90wam_cond.validate(user1) == False
