'''Testing logic. This will include hard coded data tests. We want to
ensure our algorithms work as expected.

If these tests work, we can expect that the core logic works.
'''

from algorithms.create import create_condition
from algorithms.objects.conditions import *
from algorithms.objects.user import User

PATH = "./algorithms/exampleUsers.json"

with open(PATH) as f:
    USERS = json.load(f)
f.close()

def test_no_condition():
    user = User(USERS["user3"])

    no_cond = create_condition(["(", ")"])
    assert (no_cond.validate(user))[0] == True

    # Should work even if the user has taken courses already
    user.add_courses({
        "COMP1511": (6, 75),
        "COMP1521": (6, 80)
    })

    assert (no_cond.validate(user))[0] == True


def test_course_condition():
    user = User(USERS["user3"])

    single_cond = create_condition(["(", "COMP1511", ")"])
    assert (single_cond.validate(user))[0] == False

    user.add_courses({
        "MATH1141": (6, 80)
    })
    assert (single_cond.validate(user))[0] == False

    user.add_courses({
        "COMP1511": (6, 80)
    })
    assert (single_cond.validate(user))[0] == True


def test_composite_condition_course():
    '''AND/OR conditions with only course requirements'''
    user = User(USERS["user3"])

    and_cond = create_condition(["(", "COMP1511", "&&", "COMP1521", "&&", "COMP1531", ")"])
    assert (and_cond.validate(user))[0] == False

    user.add_courses({
        "COMP1511": (6, 80),
        "COMP1531": (6, None),
        "MATH1141": (6, None)
    })
    assert (and_cond.validate(user))[0] == False

    user.add_courses({
        "COMP1521": (6, None)
    })
    assert (and_cond.validate(user))[0] == True

    or_cond = create_condition(["(", "MATH1081", "||", "MATH1151", "||", "MATH1241", ")"])
    assert (or_cond.validate(user))[0] == False

    user.add_courses({
        "MATH1151": (6, 90),
    })
    assert (or_cond.validate(user))[0] == True

    and_or_cond = create_condition(["(", "(", "COMP1511", "||", "COMP1521", ")", "&&",
                                   "(", "MATH1141", "&&", "MATH1151", ")", "&&", "(", "COMP2041", "&&", "COMP1531", ")", ")"])
    assert (and_or_cond.validate(user))[0] == False

    user.add_courses({
        "COMP1141": (6, None)
    })
    assert (and_or_cond.validate(user))[0] == False

    user.add_courses({
        "COMP2041": (6, None)
    })
    assert (and_or_cond.validate(user))[0] == True


def test_composite_condition_course():
    '''AND/OR conditions with only course requirements'''
    user = User(USERS["user3"])

    and_cond = create_condition(
        ["(", "COMP1511", "&&", "COMP1521", "&&", "COMP1531", ")"])
    assert (and_cond.validate(user))[0] == False

    user.add_courses({
        "COMP1511": (6, 80),
        "COMP1531": (6, None),
        "MATH1141": (6, None)
    })
    assert (and_cond.validate(user))[0] == False

    user.add_courses({
        "COMP1521": (6, None)
    })
    assert (and_cond.validate(user))[0] == True

    or_cond = create_condition(
        ["(", "MATH1081", "||", "MATH1151", "||", "MATH1241", ")"])
    assert (or_cond.validate(user))[0] == False

    user.add_courses({
        "MATH1151": (6, 90),
    })
    assert (or_cond.validate(user))[0] == True

    and_or_cond = create_condition(["(", "(", "COMP1511", "||", "COMP1521", ")", "&&",
                                   "(", "MATH1141", "&&", "MATH1151", ")", "&&", "(", "COMP2041", "&&", "COMP1531", ")", ")"])
    assert (and_or_cond.validate(user))[0] == False

    user.add_courses({
        "COMP1141": (6, None)
    })
    assert (and_or_cond.validate(user))[0] == False

    user.add_courses({
        "COMP2041": (6, None)
    })
    assert (and_or_cond.validate(user))[0] == True


def test_uoc_condition_simple():
    '''Testing simple uoc condition without complex keywords'''
    user = User(USERS["user3"])
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
        "COMP1531": (6, None),
        "MATH2859": (3, None)
    })

    cond_12 = create_condition(["(", "12UOC", ")"])
    cond_21 = create_condition(["(", "21UOC", ")"])
    cond_30 = create_condition(["(", "30UOC", ")"])

    assert (cond_12.validate(user))[0] == True
    assert (cond_21.validate(user))[0] == True
    assert (cond_30.validate(user))[0] == False


def test_uoc_condition_complex():
    '''Testing uoc condition including keywords'''
    user = User(USERS["user3"])
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
        "COMP1531": (6, None),
        "MATH1141": (6, 90),
        "MATH1151": (6, 90),
        "MATH2400": (3, 90),
    })

    cond_12_comp = create_condition(["(", "12UOC", "in", "COMP", ")"])
    cond_12_math = create_condition(["(", "12UOC", "in", "MATH", ")"])
    cond_18_comp = create_condition(["(", "18UOC", "in", "COMP", ")"])
    cond_15_math = create_condition(["(", "15UOC", "in", "MATH", ")"])
    cond_30_comp = create_condition(["(", "30UOC", "in", "COMP", ")"])
    cond_30_math = create_condition(["(", "30UOC", "in", "MATH", ")"])

    assert (cond_12_comp.validate(user))[0] == True
    assert (cond_12_math.validate(user))[0] == True
    assert (cond_18_comp.validate(user))[0] == True
    assert (cond_15_math.validate(user))[0] == True
    assert (cond_30_comp.validate(user))[0] == False
    assert (cond_30_math.validate(user))[0] == False

    # Nonexistent categories shouldn't work...
    cond_12_engg = create_condition(["(", "12UOC", "in", "ENGG", ")"])
    assert (cond_12_engg.validate(user))[0] == False


def test_wam_condition_simple():
    '''Testing simple wam condition without complex keywords. We must check for
    warnings since we will return True by default'''
    user = User(USERS["user3"])
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None)
    })

    cond1 = create_condition(["(", "70WAM", ")"])
    cond1_user_unlocked = cond1.validate(user)
    assert cond1_user_unlocked[0] == True
    assert len(cond1_user_unlocked[1]) == 1
    assert "Requires 70 WAM in all courses. Your WAM in all courses has not been recorded" in cond1_user_unlocked[1]

    user1 = User(USERS["user3"])
    user1.add_courses({
        "COMP1511": (6, 80),
        "COMP1521": (6, 90),
        "COMP1531": (6, 100)
    })
    cond1_user1_unlocked = cond1.validate(user1)
    assert cond1_user1_unlocked[0] == True
    assert len(cond1_user1_unlocked[1]) == 0

    cond2 = create_condition((["(", "90WAM", ")"]))
    cond2_user1_unlocked = cond2.validate(user1)
    assert cond2_user1_unlocked[0] == True
    assert len(cond2_user1_unlocked[1]) == 0


    cond4 = create_condition((["(", "100WAM", ")"]))
    cond4_user1_unlocked = cond4.validate(user1)
    assert cond4_user1_unlocked[0] == True
    assert len(cond4_user1_unlocked[1]) == 1
    assert "Requires 100 WAM in all courses. Your WAM in all courses is currently 90.000" in cond4_user1_unlocked[1]

def test_wam_condition_complex():
    '''Testing wam condition including keywords'''
    user = User(USERS["user3"])
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
        "MATH1131": (6, None),
        "MATH1141": (6, None),
    })

    comp_cond_70 = create_condition(["(", "70WAM", "in", "COMP", ")"])
    assert (comp_cond_70.validate(user))[0] == True

    math_cond_70 = create_condition(["(", "70WAM", "in", "MATH", ")"])
    assert (math_cond_70.validate(user))[0] == True

    comp_math_cond_70 = create_condition(
        ["(", "70WAM", "in", "COMP", "||", "70WAM", "in", "MATH", ")"])
    assert (comp_math_cond_70.validate(user))[0] == True

    user1 = User(USERS["user3"])
    user1.add_courses({
        "COMP1511": (6, 65),
        "COMP1521": (6, 80),
        "MATH1131": (6, 50),
        "MATH1141": (6, 50),
    })

    assert (comp_cond_70.validate(user1))[0] == True
    assert (math_cond_70.validate(user1))[0] == True
    assert (comp_math_cond_70.validate(user1))[0] == True


def test_grade_condition():
    user = User(USERS["user3"])
    user.add_courses({
        "COMP1511": (6, None),
        "MATH1131": (6, None)
    })

    comp1511_70 = create_condition(["(", "70GRADE", "in", "COMP1511", ")"])
    comp1521_70 = create_condition(["(", "70GRADE", "in", "COMP1521", ")"])
    math1131_70 = create_condition(["(", "70GRADE", "in", "MATH1131", ")"])

    comp1511_70_user_unlocked = comp1511_70.validate(user)
    assert comp1511_70_user_unlocked[0] == True
    assert len(comp1511_70_user_unlocked[1]) == 1
    assert "Requires 70 mark in COMP1511. Your mark has not been recorded"

    math1131_70_user_unlocked = math1131_70.validate(user)
    assert math1131_70_user_unlocked[0] == True
    assert len(math1131_70_user_unlocked[1]) == 1
    assert "Requires 70 mark in MATH1131. Your mark has not been recorded"

    # Has not taken the course. Should be false
    assert (comp1521_70.validate(user))[0] == False
    assert len((comp1521_70.validate(user))[1]) == 0
    
    comp1511_60 = create_condition(["(", "60GRADE", "in", "COMP1511", ")"])
    comp1511_90 = create_condition(["(", "90GRADE", "in", "COMP1511", ")"])
    comp1521_90 = create_condition(["(", "90GRADE", "in", "COMP1521", ")"])
    math1131_90 = create_condition(["(", "90GRADE", "in", "COMP1131", ")"])

    user1 = User(USERS["user3"])
    user1.add_courses({
        "COMP1511": (6, 70),
        "MATH1131": (6, 70),
    })

    assert (comp1511_60.validate(user1))[0] == True
    assert (comp1511_70.validate(user1))[0] == True
    assert (comp1521_70.validate(user1))[0] == False
    assert (math1131_70.validate(user1))[0] == True
    assert (comp1511_90.validate(user1))[0] == False
    assert (comp1521_90.validate(user1))[0] == False
    assert (math1131_90.validate(user1))[0] == False

    # Test complex grade conditions
    user2 = User(USERS["user3"])
    user2.add_courses({
        "ENGG1000": (6, 50),
        "COMP1511": (6, 65),
        "COMP1521": (6, 85),
        "COMP1531": (6, 90),
    })

    complex_cond_100 = create_condition(
        ["(", "100GRADE", "in", "ENGG1000", "||", "100GRADE", "in", "COMP1511", "||", "100GRADE", "in", "COMP1521", ")"])
    assert (complex_cond_100.validate(user2))[0] == False

    complex_cond_60 = create_condition(
        ["(", "60GRADE", "in", "ENGG1000", "||", "60GRADE", "in", "COMP1511", "||", "60GRADE", "in", "COMP1521", ")"])
    assert (complex_cond_60.validate(user2))[0] == True

    # Some courses are not even taken
    complex_cond_70_not_taken = create_condition(
        ["(", "70GRADE", "in", "MATH1081", "||", "70GRADE", "in", "MATH1131", "||", "70GRADE", "in", "COMP1511", ")"])
    assert (complex_cond_70_not_taken.validate(user2))[0] == False


def test_specialisation_condition_simple():
    """Testing simple specialisation condition such as enrolled in COMPA1"""
    user = User(USERS["user3"])
    user.add_specialisation("ACCTA2")
    compa1_cond = create_condition(["(", "COMPA1", ")"])
    accta2_cond = create_condition(["(", "ACCTA2", ")"])
    finsa2_cond = create_condition(["(", "FINSA2", ")"])

    assert (compa1_cond.validate(user))[0] == True
    assert (accta2_cond.validate(user))[0] == True
    assert (finsa2_cond.validate(user))[0] == False


def test_program_condition_simple():
    """Testing simple program condition such as enrolled in 3707"""
    user = User(USERS["user3"])

    cond_3707 = create_condition(["(", "3707", ")"])
    cond_3778 = create_condition(["(", "3778", ")"])

    assert (cond_3707.validate(user))[0] == True
    assert (cond_3778.validate(user))[0] == False


def test_level_condition_simple():
    '''Testing simple level conditions with levels such as 24UOC in L1
    NOTE: Only UOC conditions realistically exist for this
    '''
    user = User(USERS["user3"])
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
        "MATH1081": (6, None),
        "COMP2521": (6, None),
        "MATH2931": (6, None),
        "SENG3011": (6, None)
    })

    # UOC conditions
    l1_6uoc_cond = create_condition(["(", "6UOC", "in", "L1", ")"])
    l1_18uoc_cond = create_condition(["(", "18UOC", "in", "L1", ")"])
    l1_30uoc_cond = create_condition(["(", "30UOC", "in", "L1", ")"])
    l2_6uoc_cond = create_condition(["(", "6UOC", "in", "L2", ")"])
    l2_12uoc_cond = create_condition(["(", "12UOC", "in", "L2", ")"])
    l2_18uoc_cond = create_condition(["(", "18UOC", "in", "L2", ")"])
    l3_6uoc_cond = create_condition(["(", "6UOC", "in", "L3", ")"])
    l3_12uoc_cond = create_condition(["(", "12UOC", "in", "L3", ")"])

    assert (l1_6uoc_cond.validate(user))[0] == True
    assert (l1_18uoc_cond.validate(user))[0] == True
    assert (l1_30uoc_cond.validate(user))[0] == False
    assert (l2_6uoc_cond.validate(user))[0] == True
    assert (l2_12uoc_cond.validate(user))[0] == True
    assert (l2_18uoc_cond.validate(user))[0] == False
    assert (l3_6uoc_cond.validate(user))[0] == True
    assert (l3_12uoc_cond.validate(user))[0] == False

def test_level_course_condition():
    '''Testing level conditions with course category such as L2 MATH
    NOTE: Only UOC conditions realistically exist for this
    '''
    user = User(USERS["user3"])
    user.add_courses({
        "COMP1511": (6, None),
        "MATH1131": (6, None),
        "MATH1151": (6, None),
        "MATH2400": (3, None),
        "MATH2859": (3, None),
        "MATH2931": (6, None),
    })

    # UOC conditions
    l1_comp_6uoc_cond = create_condition(["(", "6UOC", "in", "L1", "COMP", ")"])
    l1_comp_12uoc_cond = create_condition(["(", "12UOC", "in", "L1", "COMP", ")"])
    l1_math_6uoc_cond = create_condition(["(", "6UOC", "in", "L1", "MATH", ")"])
    l2_math_12uoc_cond = create_condition(["(", "12UOC", "in", "L2", "MATH", ")"])
    l2_math_18uoc_cond = create_condition(["(", "18UOC", "in", "L2", "MATH", ")"])

    assert (l1_comp_6uoc_cond.validate(user))[0] == True
    assert (l1_comp_12uoc_cond.validate(user))[0] == False
    assert (l1_math_6uoc_cond.validate(user))[0] == True
    assert (l2_math_12uoc_cond.validate(user))[0] == True
    assert (l2_math_18uoc_cond.validate(user))[0] == False


def test_exclusion():
    '''Testing that you are properly blocked from taking exclusion courses'''
    user = User(USERS["user3"])
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
    })

    # Excludes COMP1511
    comp1010_cond = create_condition(["(", ")"], "COMP1010")
    assert (comp1010_cond.validate(user))[0] == False

    # Excludes COMP1521
    dpst1092_cond = create_condition(["(", "COMP1511", ")"], "DPST1092")
    assert (dpst1092_cond.validate(user))[0] == False

    # ECON1101 should exclude 3155 and 3521
    user1 = User()
    user1.add_program("3155")
    econ1011_cond = create_condition(["(", ")"], "ECON1101")
    assert (econ1011_cond.validate(user1))[0] == False
    
    # TODO: Test exclusion for other types


def test_coreq_condition():
    """Testing corequisite conditions"""
    user = User(USERS["user3"])
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
    })
    user.add_current_course("COMP1531")

    # Testing simple co-requisite conditions
    coreq_cond1 = create_condition(["(", "[", "COMP1531", "]", ")"])
    coreq_cond2 = create_condition(["(", "[", "COMP1511", "]", ")"])
    coreq_cond3 = create_condition(["(", "[", "COMP1521", "]", ")"])
    coreq_cond4 = create_condition(["(", "[", "COMP1541", "]", ")"])

    assert (coreq_cond1.validate(user))[0] == True
    assert (coreq_cond2.validate(user))[0] == True
    assert (coreq_cond3.validate(user))[0] == True
    assert (coreq_cond4.validate(user))[0] == False

    user.add_current_course("COMP1541")

    # Testing more complex co-requisite conditions
    complex_coreq_cond1 = create_condition(["(", "[", "COMP1521", "&&", "COMP1531", "&&", "COMP1541", "]", ")"])
    complex_coreq_cond2 = create_condition(["(", "[", "COMP1511", "||", "COMP1551", "]", ")"])
    complex_coreq_cond3 = create_condition(["(", "COMP1511", "&&", "[", "COMP1531", "&&", "COMP1541", "]", "&&", "COMP1521", ")"])
    complex_coreq_cond4 = create_condition(["(", "[", "COMP1521", "&&", "COMP1531", "&&", "COMP9999", "]", ")"])
    complex_coreq_cond5 = create_condition(["(", "[", "COMP7777", "||", "COMP1511", "||", "COMP9999", "]", ")"])
    complex_coreq_cond6 = create_condition(["(", "[", "COMP7777", "||", "COMP8888", "||", "COMP9999", "]", ")"])

    assert (complex_coreq_cond1.validate(user))[0] == True
    assert (complex_coreq_cond2.validate(user))[0] == True
    assert (complex_coreq_cond3.validate(user))[0] == True
    assert (complex_coreq_cond4.validate(user))[0] == False
    assert (complex_coreq_cond5.validate(user))[0] == True
    assert (complex_coreq_cond6.validate(user))[0] == False


def test_school_condition():
    """Testing school conditions such as 12UOC in S Comp"""
    user = User(USERS["user3"])
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
    })

    comp_12uoc_cond = create_condition(["(", "12UOC", "in", "S", "Computer", ")"])
    comp_18uoc_cond = create_condition(["(", "18UOC", "in", "S", "Computer", ")"])

    assert (comp_12uoc_cond.validate(user))[0] == True
    assert (comp_18uoc_cond.validate(user))[0] == False

def test_faculty_condition():
    """Testing faculty conditions such as 12UOC in F Engineering"""
    user = User(USERS["user3"])
    user.add_courses({
        "COMP1511": (6, None),
        "COMP1521": (6, None),
    })

    comp_12uoc_cond = create_condition(["(", "12UOC", "in", "F", "Engineering", ")"])
    comp_18uoc_cond = create_condition(["(", "18UOC", "in", "F", "Engineering", ")"])

    assert (comp_12uoc_cond.validate(user))[0] == True
    assert (comp_18uoc_cond.validate(user))[0] == False

def test_program_type():
    """Testing program type conditions such as ACTL#
    Refer to the cache programMappings.json
    """
    comp_user = User(USERS["user3"])
    actl_user = User()
    actl_user.add_program("3154")

    actl_program_cond = create_condition(["(", "ACTL#", ")"], "COMP1511")
    assert (actl_program_cond.validate(comp_user))[0] == False
    assert (actl_program_cond.validate(actl_user))[0] == True
