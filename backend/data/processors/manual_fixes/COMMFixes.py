"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Copy this into a new file for the relevant faculty's fixes:
e.g. COMPFixes.py, ACCTFixes.py, PSYCFixes.py

Apply manual [code] fixes to processed conditions in conditionsProcessed.json so
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.COMMFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["COMM0999"][PROCESSED] = COMM_0999()
    CONDITIONS["COMM1040"] = COMM_1040(CONDITIONS["COMM1040"])
    CONDITIONS["COMM1100"] = COMM_1100(CONDITIONS["COMM1100"])
    CONDITIONS["COMM1110"] = COMM_1110(CONDITIONS["COMM1110"])
    CONDITIONS["COMM1120"][PROCESSED] = COMM_1120()
    CONDITIONS["COMM1140"][PROCESSED] = COMM_1140()
    CONDITIONS["COMM1150"] = COMM_1150(CONDITIONS["COMM1150"])
    CONDITIONS["COMM1170"][PROCESSED] = COMM_1170_1180()
    CONDITIONS["COMM1180"][PROCESSED] = COMM_1170_1180()
    CONDITIONS["COMM1190"][PROCESSED] = COMM_1190()
    CONDITIONS["COMM1999"] = COMM_1999(CONDITIONS["COMM1999"])
    CONDITIONS["COMM2222"] = COMM_2222(CONDITIONS["COMM2222"])
    CONDITIONS["COMM2233"] = COMM_2233(CONDITIONS["COMM2233"])
    CONDITIONS["COMM2244"][PROCESSED] = COMM_2244()
    CONDITIONS["COMM3020"] = COMM_2222(CONDITIONS["COMM3020"])
    CONDITIONS["COMM3030"][PROCESSED] = COMM_3030()
    CONDITIONS["COMM3090"] = COMM_3090(CONDITIONS["COMM3090"])
    CONDITIONS["COMM3091"][PROCESSED] = COMM_3091()
    CONDITIONS["COMM3101"] = COMM_3101(CONDITIONS["COMM3101"])
    CONDITIONS["COMM3202"] = COMM_3202(CONDITIONS["COMM3202"])
    CONDITIONS["COMM3303"] = COMM_3303(CONDITIONS["COMM3303"])
    CONDITIONS["COMM3500"][PROCESSED] = COMM_3500()
    CONDITIONS["COMM3900"] = COMM_3900(CONDITIONS["COMM3900"])
    CONDITIONS["COMM3999"] = COMM_3999(CONDITIONS["COMM3999"])
    CONDITIONS["COMM6700"][PROCESSED] = COMM_6700()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")


def COMM_0999():
    """
        "original": "Only available to students completing a Bachelor of Commerce as part of a single or double-degree<br/><br/>",

        "processed": "Only available to a Bachelor of Commerce as part of a single || double-degree"
    """
    return "COMM#"


def COMM_1040(conditions):
    """
    "original": "Prerequisite: Students must be in Good Academic Standing<br/><br/>",

    "processed": "",

    "handbook_note": "Students must be in Good Academic Standing"
    """
    return {
        "original": conditions["original"],
        "processed": "",
        "handbook_note": "Students must be in Good Academic Standing"
    }


def COMM_1100(conditions):
    """
        "original": "Students who have completed ECON1101 are not permitted to enrol. <br/><br/>",

        "processed": "who have ECON1101 are not permitted to enrol"
    """
    return {
        "original": conditions["original"],
        "processed": "",
        "handbook_note": "Students enrolled in Actuarial Studies or Economics programs (in single or double degree mode) are not permitted to enrol."
    }


def COMM_1110(conditions):
    """
        "original": "Only available to single and double degree Business School students in Term 1. It will be offered to non-Business School students in Terms 2 and 3.<br/><br/>",
        "processed": "Only available to single && double degree Business School in Term 1. It will be offered to non-Business School in Terms 2 && 3"
    """

    return {
        "original": conditions["original"],
        "processed": "",
        "handbook_note": "Students enrolled in 3764 (Eng/Comm), Actuarial Studies or Economics programs (in both single and double degree mode) are not permitted to enrol."
    }

def COMM_1120():
    """
        "original": "Only available to single and double degree Business School students in Term 1. It will be offered to non-Business School students in Terms 2 and 3.<br/><br/>",
        "processed": "Only available to single && double degree Business School in Term 1. It will be offered to non-Business School in Terms 2 && 3"
    """
    return ""

def COMM_1140():
    """
        "original": "Only available to single and double degree Business School students in Term 1. It will be offered to non-Business School students in Terms 2 and 3.<br/><br/>",
        "processed": "Only available to single && double degree Business School in Term 1. It will be offered to non-Business School in Terms 2 && 3"
    """

    return ""

def COMM_1150(conditions):
    """
        "original": "Pre-requisite: COMM1100 and excludes MGMT1101. Only available to single and double degree Business School students in Term 2. It will be offered to non-Business School students in Term 3.<br/><br/>",
        "processed": "COMM1100 &&"
    """

    COURSES["COMM1150"]["exclusions"]["MGMT1101"] = 1
    return {
        "original": conditions["original"],
        "processed": "COMM1100",
        "handbook_note": "Only available to single and double degree Business School students in Term 2. Offered to non-Business School students in Term 3."
    }

def COMM_1170_1180():
    """
        "original": "Pre-requisite: COMM1140. Only available to single and double degree Business School students in Term 2. It will be offered to non-Business School students in Terms 1 and 3.<br/><br/>",
        "processed": "COMM1140. Only available to single && double degree Business School in Term 2. It will be offered to non-Business School in Terms 1 && 3"
    """
    # TODO: add handbook_note

    return "COMM1140"

def COMM_1190():
    """
        "original": "Pre-requisite: COMM1110 or ECON1203 or MATH1031 or MATH1041 or MATH1131 or MATH1141 or MATH1151. Only available to single and double degree Business School students in Term 2. It will be offered to non-Business School students in Term 3.<br/><br/>",

        "processed": "COMM1110 || ECON1203 || MATH1031 || MATH1041 || MATH1131 || MATH1141 || MATH1151"
    """

    return "COMM1110 || ECON1203 || MATH1031 || MATH1041 || MATH1131 || MATH1141 || MATH1151"

def COMM_1999(conditions):
    """
        "original": "Pre-requisite: COMM0999 AND completed 30 UOC of Integrated First Year Core<br/><br/>",
        "processed": "COMM0999 && 30UOC of Integrated First Year Core"
    """

    return {
        "original": conditions["original"],
        "processed": "COMM0999",
        "handbook_note": "You must have completed 30UOC of Integrated First Year Core"
    }


def COMM_2222(conditions):
    """
        "original": "Pre-requisite: In Business degree, COMM6000 Career Accelerator or COMM1999 First Year Portfolio, WAM 65+, minimum 72 UOC completed, room in degree for course, Good academic standing.<br/>Excluded: Co-op students<br/>It is recommended a progression check is completed prior to enrolling.<br/><br/>",
        "processed": "(COMM6000 || COMM1999) && ZBUS# && 65WAM && 72UOC",
        "handbook_note": "Good Academic Standing. Co-op students are excluded. It is recommended to do a progression check prior to enrolling"
    """

    return {
        "original": conditions["original"],
        "processed": "(COMM6000 || COMM1999) && ZBUS# && 65WAM && 72UOC",
        "handbook_note": "Good Academic Standing. Co-op students are excluded. It is recommended to do a progression check prior to enrolling"
    }


def COMM_2233(conditions):
    """
        "original": "Completed 48 UOC, Good Standing, completed COMM6000 or COMM1999, and have space in degree for course.<br/>Its recommended to seek a progression check prior to application. Visit Career Accelerator page on Business School website for more info.<br/><br/>",
        "processed": "48UOC || Good Standing || COMM6000 || COMM1999 && have space in degree for course. Its recommended to seek a progression check prior to application. Visit Career Accelerator page on Business School website for more info"
    """

    return {
        "original": conditions["original"],
        "processed": "(COMM6000 || COMM1999) && 48UOC",
        "handbook_note": "It is recommended to do a progression check prior to enrolling."
    }


def COMM_2244():
    """
        "original": "Must have completed COMM6000 CA:Essentials or COMM1999 First Year Portfolio, minimum 48 UoC, minimum 65 WAM, and be in good academic standing. Students who have completed COMM2233 or CDEV3000 (formerly DIPP1510) must not enrol into this course<br/><br/>",
        "processed": "COMM6000 CA:Essentials || COMM1999 First Year Portfolio && 48UOC && 65WAM && be in good academic standing. who have COMM2233 || CDEV3000 (formerly DIPP1510) must not enrol into this course"
    """
    COURSES["COMM1150"]["exclusions"]["COMM2233"] = 1
    COURSES["COMM1150"]["exclusions"]["CDEV3000"] = 1
    COURSES["COMM1150"]["exclusions"]["DIPP1510"] = 1

    return "(COMM6000 || COMM1999) && 65WAM && 48UOC"


def COMM_3020(conditions):
    """
        "original": "WAM 65+, minimum 72 UOC, room in degree for this course, good academic standing, completed COMM6000 Career Accelerator: Essentials or COMM1999 First Year Portfolio.<br/>This course is by application only. Please visit Business School website for more information<br/><br/>",
        "processed": "65WAM || 72UOC || room in degree for this course || good academic standing || COMM6000 Career Accelerator: Essentials || COMM1999 First Year Portfolio. This course is by application only. Please visit Business School website for more information"
    """

    return {
        "original": conditions["original"],
        "processed": "(COMM6000 || COMM1999) && 65WAM && 72UOC",
        "handbook_note": "This course is by application only. Please visit Business School website for more information."
    }


def COMM_3030():
    """
        "original": "\u2022\tminimum WAM of 65;<br/>\u2022\thave completed a minimum of 48 UOC at the commencement of this course;<br/>\u2022\thave room in their degree for this course;<br/>\u2022\tare in good academic standing;<br/>\u2022\thave completed COMM6000 Career Accelerator: Essentials or COMM1999 First Year Portfolio (Business School students only)<br/>This course may count as a Business School Free Elective, OR as a major elective within some schools. It is recommended a progression check is completed prior to enrolling.<br/><br/>",
        "processed": "\u2022\t65WAM; \u2022\thave a minimum 48UOC at the commencement of this course; \u2022\thave room in their degree for this course; \u2022\tare in good academic standing; \u2022\thave COMM6000 Career Accelerator: Essentials || COMM1999 First Year Portfolio (Business School only) This course may count as a Business School Free Elective || as a major elective within some schools. It is recommended a progression check is prior to enrolling"
    """

    return "(COMM6000 || COMM1999) && 65WAM && 48UOC"


def COMM_3090(conditions):
    """
        "original": "Students are expected to be in their final year of a Bachelor of Commerce single or dual degree with at least 108 UOC completed.<br/><br/>",
        "processed": "108UOC",
        "handbook_note": "Students are expected to be in their final year of a Bachelor of Commerce single or dual degree with at least 108 UOC completed."
    """

    return {
        "original": conditions["original"],
        "processed": "108UOC",
        "handbook_note": "Students are expected to be in their final year of a Bachelor of Commerce single or dual degree"
    }

def COMM_3091():
    """
        "original": "Completed at least 72 UoC and be enrolled in a Commerce Program; be in good academic standing, and completed COMM1999<br/><br/>",
        "processed": "72UOC && be a Commerce Program; be in good academic standing && COMM1999"
    """
    return "72UOC && COMM1999"

def COMM_3101(conditions):
    """
        "original": "Pre-requisite: Completion of 48 UOC.<br/>This course is by application only.Please contact the Co-op office for more information.<br/>Students who have completed DIPP1510 or COMM2222 or are in Business Co-Op programs are excluded from this course.<br/><br/>",
        "processed": "48UOC. This course is by application only.Please contact the Co-op office for more information. who have DIPP1510 || COMM2222 || are in Business Co-Op programs are"
    """

    COURSES["COMM3101"]["exclusions"]["DIPP1510"] = 1
    COURSES["COMM3101"]["exclusions"]["COMM2222"] = 1

    return {
        "original": conditions["original"],
        "processed": "48UOC",
        "handbook_note": "This course is by application only.Please contact the Co-op office for more information. Students who have completed DIPP1510 or COMM2222 or are in Business Co-Op programs are excluded from this course."
    }


def COMM_3202(conditions):
    """
        "original": "Pre-requisite: COMM3101 or COMM2101<br/>Both terms of COMM3101/COMM2101 (12 UOC) must be successfully completed. <br/>This course is by application only. Please contact the Co-op office for more information.<br/>Excluded:DIPP1510, COMM2222, Business Co-Op programs<br/><br/>",
        "processed": "COMM3101 || COMM2101 terms of (COMM3101 || COMM2101) ( 12UOC) must be successfully . This course is by application only. Please contact the Co-op office for more information"
    """

    COURSES["COMM3202"]["exclusions"]["DIPP1510"] = 1
    COURSES["COMM3202"]["exclusions"]["COMM2222"] = 1
    return {
        "original": conditions["original"],
        "processed": "COMM3101 || COMM2101",
        "handbook_note": "This course is by application only. Please contact the Co-op office for more information. Excluded:DIPP1510, COMM2222, Business Co-Op programs."
    }


def COMM_3303(conditions):
    """
        "original": "Pre-requisite: This course is by application only. Please contact the Co-op office for more information.<br/><br/>",
        "processed": "This course is by application only. Please contact the Co-op office for more information"
    """

    return {
        "original": conditions["original"],
        "processed": "",
        "handbook_note": "This course is by application only. Please contact the Co-op office for more information."
    }


def COMM_3500():
    """
        "original": "Pre-requisite: COMM1822, COMM2050, COMM2501, Business Analytics Modelling I course (ECON2206 or ECON2209 or RISK2002) and completing the Business Analytics major (COMMJ1). It is recommended students are in their final year when taking this course.<br/><br/>",
        "processed": "COMM1822 || COMM2050 || COMM2501 || Business Analytics Modelling I course (ECON2206 || ECON2209 || RISK2002) && the Business Analytics major (COMMJ1). It is recommended are in their final year when taking this course"
    """

    return "(COMM1822 && COMM2050 && COMM2501) && (ECON2206 || ECON2209 || RISK2002) && COMMJ1"


def COMM_3900(conditions):
    """
        "original": "Pre-requisite: Completed a minimum of 108 UOC (including First Year core), on Good standing and completed Career Accelerator Essentials (COMM6000).<br/>It is strongly recommended that students only complete this course within their final 2 terms of study.<br/><br/>",
        "processed": "a minimum 108UOC (&& First Year core) && on Good standing && Career Accelerator Essentials (COMM6000). It is strongly recommended that only complete this course within their final 2 terms of study"
    """

    return {
        "original": conditions["original"],
        "processed": "COMM6000 && 108UOC",
        "handbook_note": "You must have completed all First Year core"
    }


def COMM_3999(conditions):
    """
        "original": "Pre-requisite: Completed myBCom First Year Portfolio (COMM1999) and in their final year of a single or double Commerce degree (completed at least 72 UOC of Business courses).<br/><br/>",
        "processed": "myBCom First Year Portfolio (COMM1999) && in their final year of a single || double Commerce degree ( 72UOC of Business courses)"
    """

    return {
        "original": conditions["original"],
        "processed": "COMM1999 && 72UOC in ZBUS && COMM#",
        "handbook_note": "Studetns must be in their final year"
    }


def COMM_6700():
    """
        "original": "Prerequisite: undergraduate students must have completed 72 units of credit <br/><br/>",
        "processed": "undergraduate 72UOC"
    """
    return "72UOC"


if __name__ == "__main__":
    fix_conditions()
