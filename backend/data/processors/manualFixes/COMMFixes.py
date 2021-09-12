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
    python3 -m data.processors.manualFixes.[CODE]Fixes
"""

from data.utility import dataHelpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = dataHelpers.read_data("data/finalData/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = dataHelpers.read_data("data/finalData/coursesProcessed.json")

def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["COMM0999"][PROCESSED] = COMM_0999()
    CONDITIONS["COMM1100"][PROCESSED] = COMM_1100()
    CONDITIONS["COMM1110"] = COMM_1110(CONDITIONS["COMM1110"])
    CONDITIONS["COMM1120"] = COMM_1120(CONDITIONS["COMM1120"])
    CONDITIONS["COMM1140"] = COMM_1140(CONDITIONS["COMM1140"])
    CONDITIONS["COMM1150"] = COMM_1150(CONDITIONS["COMM1150"])
    CONDITIONS["COMM1170"] = COMM_1170(CONDITIONS["COMM1170"])
    CONDITIONS["COMM1180"] = COMM_1180(CONDITIONS["COMM1180"])
    CONDITIONS["COMM1190"] = COMM_1190(CONDITIONS["COMM1190"])
    CONDITIONS["COMM1900"] = COMM_1900()
    CONDITIONS["COMM1999"] = COMM_1999(CONDITIONS["COMM1999"])
    CONDITIONS["COMM2222"] = COMM_2222(CONDITIONS["COMM2222"])
    CONDITIONS["COMM2233"] = COMM_2233()
    CONDITIONS["COMM2244"] = COMM_2244()
    CONDITIONS["COMM3020"] = COMM_2222(CONDITIONS["COMM3020"])
    CONDITIONS["COMM3030"] = COMM_3030()
    CONDITIONS["COMM3090"] = COMM_3090(CONDITIONS["COMM3090"])
    CONDITIONS["COMM3101"] = COMM_3101(CONDITIONS["COMM3101"])
    CONDITIONS["COMM3202"] = COMM_3202(CONDITIONS["COMM3202"])
    CONDITIONS["COMM3303"] = COMM_3303(CONDITIONS["COMM3303"])
    CONDITIONS["COMM3500"] = COMM_3500()
    CONDITIONS["COMM3900"] = COMM_3900(CONDITIONS["COMM3900"])
    CONDITIONS["COMM3999"] = COMM_3999(CONDITIONS["COMM3999"])

    # Updates the files with the modified dictionaries
    dataHelpers.write_data(
        CONDITIONS, "data/finalData/conditionsProcessed.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")

def COMM_0999():
    """
        "original": "Only available to students completing a Bachelor of Commerce as part of a single or double-degree<br/><br/>",

        "processed": "Only available to a Bachelor of Commerce as part of a single || double-degree"
    """
    return "COMM#"

def COMM_1100():
    """
        "original": "Students who have completed ECON1101 are not permitted to enrol. <br/><br/>",

        "processed": "who have ECON1101 are not permitted to enrol"
    """
    COURSES["COMM1100"]["exclusions"]["ECON1101"] = 1
    return ""

def COMM_1110(conditions):
    """
        "original": "Only available to single and double degree Business School students in Term 1. It will be offered to non-Business School students in Terms 2 and 3.<br/><br/>",
        "processed": "Only available to single && double degree Business School in Term 1. It will be offered to non-Business School in Terms 2 && 3"
    """

    return {
        "original": conditions["original"],
        "processed": conditions["processed"],
        "warning": "Only available to single and double degree Business School in Term 1. It will be offered to non-Business School in Terms 2 and 3."
    }

def COMM_1120(conditions):
    """
        "original": "Only available to single and double degree Business School students in Term 1. It will be offered to non-Business School students in Terms 2 and 3.<br/><br/>",
        "processed": "Only available to single && double degree Business School in Term 1. It will be offered to non-Business School in Terms 2 && 3"
    """

    return {
        "original": conditions["original"],
        "processed": conditions["processed"],
        "warning": "Only available to single and double degree Business School in Term 1. It will be offered to non-Business School in Terms 2 and 3."
    }

def COMM_1140(conditions):
    """
        "original": "Only available to single and double degree Business School students in Term 1. It will be offered to non-Business School students in Terms 2 and 3.<br/><br/>",
        "processed": "Only available to single && double degree Business School in Term 1. It will be offered to non-Business School in Terms 2 && 3"
    """

    return {
        "original": conditions["original"],
        "processed": conditions["processed"],
        "warning": "Only available to single and double degree Business School in Term 1. It will be offered to non-Business School in Terms 2 and 3."
    }

def COMM_1150(conditions):
    """
        "original": "Pre-requisite: COMM1100 and excludes MGMT1101. Only available to single and double degree Business School students in Term 2. It will be offered to non-Business School students in Term 3.<br/><br/>",
        "processed": "COMM1100 &&"
    """

    COURSES["COMM1150"]["exclusions"]["MGMT1101"] = 1
    return {
        "original": conditions["original"],
        "processed": "COMM1100",
        "warning": "Only available to single and double degree Business School students in Term 2. It will be offered to non-Business School students in Term 3."
    }

def COMM_1170(conditions):
    """
        "original": "Pre-requisite: COMM1140. Only available to single and double degree Business School students in Term 2. It will be offered to non-Business School students in Term 3.<br/><br/>",
        "processed": "COMM1140. Only available to single && double degree Business School in Term 2. It will be offered to non-Business School in Term 3"
    """

    return {
        "original": conditions["original"],
        "processed": "COMM1140",
        "warning": "Only available to single and double degree Business School students in Term 2. It will be offered to non-Business School students in Term 3."
    }

def COMM_1180(conditions):
    """
        "original": "Pre-requisite: COMM1140. Only available to single and double degree Business School students in Term 2. It will be offered to non-Business School students in Term 3.<br/><br/>",
        "processed": "COMM1140. Only available to single && double degree Business School in Term 2. It will be offered to non-Business School in Term 3"
    """

    return {
        "original": conditions["original"],
        "processed": "COMM1140",
        "warning": "Only available to single and double degree Business School students in Term 2. It will be offered to non-Business School students in Term 3."
    }

def COMM_1190(conditions):
    """
        "original": "Pre-requisite: COMM1110 or ECON1203 or MATH1041 or MATH1151 or MATH1131 or MATH1141. Only available to single and double degree Business School students in Term 2. It will be offered to non-Business School students in Term 3.<br/><br/>",
        "processed": "COMM1110 || ECON1203 || MATH1041 || MATH1151 || MATH1131 || MATH1141. Only available to single && double degree Business School in Term 2. It will be offered to non-Business School in Term 3"
    """
    
    return {
        "original": conditions["original"],
        "processed": "COMM1110 || ECON1203 || MATH1041 || MATH1151 || MATH1131 || MATH1141",
        "warning": "Only available to single and double degree Business School students in Term 2. It will be offered to non-Business School students in Term 3."

    }

def COMM_1900():
    """
        "original": "Enrolment is only permitted for students in program Actl/Comm (3155) or Comm/Econ (3521).<br/>Pre-req: (ECON1101 and ECON1102) or (DPBS1101 and DPBS1102)<br/><br/>",
        "processed": "Enrolment is only permitted for in program Actl/Comm (3155) || Comm/Econ (3521). (ECON1101 && ECON1102) || (DPBS1101 && DPBS1102)"
    """

    return "(3155 || 3521) && ((ECON1101 && ECON1102) || (DPBS1101 && DPBS1102))"

def COMM_1999(conditions):
    """
        "original": "Pre-requisite: COMM0999 AND completed 30 UOC of Integrated First Year Core<br/><br/>",
        "processed": "COMM0999 && 30UOC of Integrated First Year Core"
    """

    return {
        "original": conditions["original"],
        "processed": "COMM0999",
        "warning": "You must have completed 30UOC of Integrated First Year Core"
    }

def COMM_2222(conditions):
    """
        "original": "Pre-requisite: In Business degree, COMM6000 Career Accelerator or COMM1999 First Year Portfolio, WAM 65+, minimum 72 UOC completed, room in degree for course, Good academic standing.<br/>Excluded: Co-op students<br/>It is recommended a progression check is completed prior to enrolling.<br/><br/>",
        "processed": "In Business degree || COMM6000 Career Accelerator || COMM1999 First Year Portfolio, 65WAM, 72UOC , room in degree for course, Good academic standing"
    """

    return  {
        "original": conditions["original"],
        "processed": "(COMM6000 || COMM1999 || ZBUS) && 65WAM && 72UOC"
    }

def COMM_2233():
    """
        "original": "Completed 48 UOC, Good Standing, completed COMM6000 or COMM1999, and have space in degree for course.<br/>Its recommended to seek a progression check prior to application. Visit Career Accelerator page on Business School website for more info.<br/><br/>",
        "processed": "48UOC || Good Standing || COMM6000 || COMM1999 && have space in degree for course. Its recommended to seek a progression check prior to application. Visit Career Accelerator page on Business School website for more info"
    """

    return "(COMM6000 || COMM1999) && 48UOC"

def COMM_2244():
    """
        "original": "Must have completed COMM6000 CA:Essentials or COMM1999 First Year Portfolio, minimum 48 UoC, minimum 65 WAM, and be in good academic standing. Students who have completed COMM2233 or CDEV3000 (formerly DIPP1510) must not enrol into this course<br/><br/>",
        "processed": "COMM6000 CA:Essentials || COMM1999 First Year Portfolio && 48UOC && 65WAM && be in good academic standing. who have COMM2233 || CDEV3000 (formerly DIPP1510) must not enrol into this course"
    """

    return "(COMM6000 || COMM1999) && 65WAM && 48 UOC"

def COMM_3020(conditions):
    """
        "original": "WAM 65+, minimum 72 UOC, room in degree for this course, good academic standing, completed COMM6000 Career Accelerator: Essentials or COMM1999 First Year Portfolio.<br/>This course is by application only. Please visit Business School website for more information<br/><br/>",
        "processed": "65WAM || 72UOC || room in degree for this course || good academic standing || COMM6000 Career Accelerator: Essentials || COMM1999 First Year Portfolio. This course is by application only. Please visit Business School website for more information"
    """

    return {
        "original": conditions["original"],
        "processed": "(COMM6000 || COMM1999) && 65WAM && 72UOC",
        "warning": "This course is by application only. Please visit Business School website for more information."
    }

def COMM_3030():
    """
        "original": "\u2022\tminimum WAM of 65;<br/>\u2022\thave completed a minimum of 48 UOC at the commencement of this course;<br/>\u2022\thave room in their degree for this course;<br/>\u2022\tare in good academic standing;<br/>\u2022\thave completed COMM6000 Career Accelerator: Essentials or COMM1999 First Year Portfolio (Business School students only)<br/>This course may count as a Business School Free Elective, OR as a major elective within some schools. It is recommended a progression check is completed prior to enrolling.<br/><br/>",
        "processed": "\u2022\t65WAM; \u2022\thave a minimum 48UOC at the commencement of this course; \u2022\thave room in their degree for this course; \u2022\tare in good academic standing; \u2022\thave COMM6000 Career Accelerator: Essentials || COMM1999 First Year Portfolio (Business School only) This course may count as a Business School Free Elective || as a major elective within some schools. It is recommended a progression check is prior to enrolling"
    """

    return "(COMM6000 || COMM1999) && 65WAM && 72UOC"

def COMM_3090(conditions):
    """
        "original": "Students are expected to be in their final year of a Bachelor of Commerce single or dual degree with at least 108 UOC completed.<br/><br/>",
        "processed": "are expected to be in their final year of a Bachelor of Commerce single || dual degree with 108UOC"
    """

    return {
        "original": conditions["original"],
        "processed": "",
        "warning": "Students are expected to be in their final year of a Bachelor of Commerce single or dual degree with at least 108 UOC completed."
    }

def COMM_3101(conditions):
    """
        "original": "Pre-requisite: Completion of 48 UOC.<br/>This course is by application only.Please contact the Co-op office for more information.<br/>Students who have completed DIPP1510 or COMM2222 or are in Business Co-Op programs are excluded from this course.<br/><br/>",
        "processed": "48UOC. This course is by application only.Please contact the Co-op office for more information. who have DIPP1510 || COMM2222 || are in Business Co-Op programs are"
    """

    return {
        "original": conditions["original"],
        "processed": "48UOC",
        "warning": "This course is by application only.Please contact the Co-op office for more information. Students who have completed DIPP1510 or COMM2222 or are in Business Co-Op programs are excluded from this course."
    }

def COMM_3202(conditions):
    """
        "original": "Pre-requisite: COMM3101 or COMM2101<br/>Both terms of COMM3101/COMM2101 (12 UOC) must be successfully completed. <br/>This course is by application only. Please contact the Co-op office for more information.<br/>Excluded:DIPP1510, COMM2222, Business Co-Op programs<br/><br/>",
        "processed": "COMM3101 || COMM2101 terms of (COMM3101 || COMM2101) ( 12UOC) must be successfully . This course is by application only. Please contact the Co-op office for more information"
    """

    COURSES["COMM3202"]["exclusions"]["DIPP1510"] = 1
    COURSES["COMM3202"]["exclusions"]["COMM222"] = 1
    return {
        "original": conditions["original"],
        "processed": "COMM3101 || COMM2101",
        "warning": "This course is by application only. Please contact the Co-op office for more information. Excluded:DIPP1510, COMM2222, Business Co-Op programs."
    }

def COMM_3303(conditions):
    """
        "original": "Pre-requisite: This course is by application only. Please contact the Co-op office for more information.<br/><br/>",
        "processed": "This course is by application only. Please contact the Co-op office for more information"
    """

    return {
        "original": conditions["original"],
        "processed": "",
        "warning": "This course is by application only. Please contact the Co-op office for more information."
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
        "warning": "You must have completed all First Year core"
    }

def COMM_3999(conditions):
    """
        "original": "Pre-requisite: Completed myBCom First Year Portfolio (COMM1999) and in their final year of a single or double Commerce degree (completed at least 72 UOC of Business courses).<br/><br/>",
        "processed": "myBCom First Year Portfolio (COMM1999) && in their final year of a single || double Commerce degree ( 72UOC of Business courses)"
    """

    return {
        "original": conditions["original"],
        "processed": "COMM1999 && 72UOC && COMM",
        "warning": "Studetns must be in their final year"
    }


if __name__ == "__main__":
    fix_conditions()