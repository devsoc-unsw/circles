'''
Preprocessing the conditions and logging to conditionsProcessed.json
Some examples of preprocessing are:
- Getting rid of "Prerequisite:" or similar at start of line
- Fixing extra white space
- Normalising AND/OR/and/or to && and ||
- Converting specialisation and program names to corresponding codes
'''

import re
from data.utility import dataHelpers

PREPROCESSED_CONDITIONS = {}
CODE_MAPPING = dataHelpers.read_data(
    "data/utility/programCodeMappings.json")["title_to_code"]


def preprocess_conditions():
    data = dataHelpers.read_data("data/scrapers/coursesFormattedRaw.json")

    for code, course in data.items():
        # if not course["enrolment_rules"]:
        #     # Store it as empty rule
        #     continue

        original = course["enrolment_rules"]
        conditions = {}

        # Store original text for debugging
        conditions["original"] = original
        processed = original

        # Phase 1: Deletions
        processed = delete_exclusions(processed)
        processed = delete_HTML(processed)
        processed = delete_self_referencing(code, processed)
        processed = delete_extraneous_phrasing(processed)
        processed = delete_prereq_label(processed)
        processed = delete_trailing_punc(processed)

        # Phase 2: Conversions
        processed = convert_square_brackets(processed)
        processed = convert_UOC(processed)
        processed = convert_WAM(processed)
        processed = convert_GRADE(processed)
        processed = convert_level(processed)
        processed = convert_fslash(processed)
        processed = convert_including(processed)
        processed = convert_AND_OR(processed)
        processed = convert_coreqs(processed)

        # Phase 3: Algo logic
        processed = joining_terms(processed)
        processed = handle_comma_logic(processed)

        # Phase 4: Final touches
        processed = strip_spaces(processed)
        processed = strip_bracket_spaces(processed)

        # Phase 5: Common patterns
        processed = uoc_in_business_school(processed)
        processed = l2_math_courses(processed)

        conditions["processed"] = processed

        PREPROCESSED_CONDITIONS[code] = conditions

    dataHelpers.write_data(
        PREPROCESSED_CONDITIONS, "data/finalData/conditionsProcessed.json")

# -----------------------------------------------------------------------------
# Phase 1: Deletions
# -------------------


def delete_exclusions(processed):
    """ Removes exclusions from enrolment conditions """
    # Remove exclusion string which appears before prerequisite plaintext
    excl_string = re.search(r"(excl.*?:.*?)(pre)",
                            processed, flags=re.IGNORECASE)
    if excl_string:
        processed = re.sub(excl_string.group(1), "", processed)

    # Remove exclusion string appearing after prerequisite plaintext, typically
    # at the end of the enrolment rule
    processed = re.sub(r"excl.*", "", processed, flags=re.IGNORECASE)

    return processed


def delete_HTML(processed):
    """ Remove HTML tags """
    # Will replace with a space because they sometimes appear in the middle of the text
    # so "and<br/>12 UOC" would turn into and12 UOC
    return re.sub("<[a-z]*/>", " ", processed, flags=re.IGNORECASE)


def delete_self_referencing(code, processed):
    """ Remove any references to this course """
    # E.g. "COMP4962: {
    #     "processed_rule": "COMP4962 COMP4951"
    # } "
    return re.sub(code, "", processed)


def delete_extraneous_phrasing(processed):
    '''Sometimes there's extraneous phrasing which needs to be handled'''
    # Must have completed COMP1511 ==> COMP1511
    # processed = re.sub("Must have completed ", "", processed, flags=re.IGNORECASE)

    # Remove 'Either' as it usually preceeds handled logical phrases
    processed = re.sub("Either", "", processed, flags=re.IGNORECASE)

    # Remove 'Both' as it also usually preceeds handled logical phrases
    processed = re.sub("Both", "", processed, flags=re.IGNORECASE)

    # Remove 'or higher' as XXWAM implies XX minimum
    processed = re.sub("or higher", "", processed)

    # Remove 'student' references as it is implied
    processed = re.sub("students?", "", processed, flags=re.IGNORECASE)

    # Removed enrollment language since course and program codes imply this
    processed = re.sub("enrolled in", "", processed, flags=re.IGNORECASE)

    # Remove completion language
    completion_text = ["completion of", "must successfully complete",
                       "must have completed", "completing", "completed"]
    for text in completion_text:
        processed = re.sub(text, "", processed, flags=re.IGNORECASE)

    return processed


def delete_prereq_label(processed):
    """ Removes 'prerequisite' and variations """
    # variations incude ["prerequisite", "pre-requisite", "prer-requisite"]
    return re.sub(r"[Pp]re[A-Za-z/_-]*:*", "", processed)


def delete_trailing_punc(processed):
    """ Deletes any trailing punctuation """
    return re.sub(r"(\.|;)\s*$", "", processed)

# -----------------------------------------------------------------------------
# Phase 2: Conversions
# -------------------


def convert_square_brackets(processed):
    """ Converts '[' to '(' and ']' to ')' """
    processed = re.sub(r"\[", r"(", processed)
    processed = re.sub(r"]", r")", processed)
    return processed


def convert_UOC(processed):
    """ Converts to XXUOC """
    # Converts unit(s) of credit(s) to UOC and removes spacing
    processed = re.sub(r'\s?units? of credits?', "UOC",
                       processed, flags=re.IGNORECASE)

    # Places UOC right next to the numbers
    processed = re.sub("\s?UOC", "UOC", processed, flags=re.IGNORECASE)

    # After UOC has been mainly converted, remove some extraneous phrasing
    processed = re.sub(r'(of|at least)?\s?(\d+UOC)', r' \2',
                       processed, flags=re.IGNORECASE)
    processed = re.sub(r'(\d+UOC)(\s?overall\s?)', r'\1 ',
                       processed, flags=re.IGNORECASE)

    # Remove 'minimum' since it is implied
    processed = re.sub(r"minimum (\d\dUOC)", r"\1",
                       processed, flags=re.IGNORECASE)

    return processed


def convert_WAM(processed):
    """ Converts WAM requirements. WAM refers to overall mark. """
    # Look for integer within 3 words after 'WAM' or 'mark', e.g.:
    #    - "WAM of 65" -> "65WAM"
    #    - "WAM of at least 65" -> "65WAM"
    processed = re.sub(
        r"WAM ([a-z]* ){0,3}(\d\d)", r"\2WAM", processed, flags=re.IGNORECASE)

    # Then delete any superfluous preceding words, chars or spaces, e.g.:
    #    - "minimum 65WAM" -> "65WAM"
    #    - "A 65WAM" -> "65WAM"
    processed = re.sub(r"[a|minimum]+ (\d\d)\s?WAM",
                       r"\1WAM", processed, flags=re.IGNORECASE)

    # Compress any remaining spaces between digits and WAM and remove misc chars
    # like '+' and '>', e.g.:
    #    - ">65WAM" -> "65WAM"
    #    - "65+ WAM" -> "65WAM"
    #    - "65WAM+" -> "65WAM"
    processed = re.sub(r">?(\d\d)\+?\s?WAM\+?", r"\1WAM",
                       processed, flags=re.IGNORECASE)

    return processed


def convert_GRADE(processed):
    '''Converts mark/grade requirements, usually relating to a specific course.
    NOTE: We prefer to use 'GRADE' here because 'MARK' could interfere with Marketing
    courses'''

    # Converts "mark of at least XX to XXGRADE"
    processed = re.sub(r"(a )?mark of at least (\d\d)",
                       r"\2GRADE", processed, flags=re.IGNORECASE)

    # Further handle CR and DN. These usually follow a course code
    # MATH1141 (CR) ==> 65WAM MATH1141
    # Use "in" as a joining word"
    processed = re.sub(r'([A-Z]{4}[\d]{4})\s?\(CR\)',
                       r'65GRADE in \1', processed)
    processed = re.sub(r'([A-Z]{4}[\d]{4})\s?\(DN\)',
                       r'75GRADE in \1', processed)

    return processed


def convert_level(processed):
    """ Converts level X to LX """
    return re.sub(r"level (\d)", r"L\1", processed, flags=re.IGNORECASE)


def convert_fslash(processed):
    """ Converts forward slashes to || and surrounds in brackets """
    # E.g.:
    #    - "(COMP1521/DPST1092 && COMP2521)" -> "((COMP1521 || DPST1092) && COMP2521)"
    #    - "COMP9444 / COMP9417 / COMP9517/COMP4418" -> "(COMP9444 || COMP9417 || COMP9517 || COMP4418)"
    matches = re.findall(
        r"[A-Z]{4}[\d]{4}(?:\s?/\s?[A-Z]{4}[\d]{4})+", processed)

    for match in matches:
        subbed_phrase = re.sub(r"/", r" || ", match)
        subbed_phrase = f"({subbed_phrase})"
        processed = re.sub(match, subbed_phrase, processed)

    return processed


def convert_including(processed):
    """ Convert 'including' to && """
    return re.sub("including", "&&", processed)


def convert_AND_OR(processed):
    """ Convert 'and' to '&&' and 'or' to '||' """
    processed = re.sub(" and ", " && ", processed, flags=re.IGNORECASE)
    processed = re.sub(" or ", " || ", processed, flags=re.IGNORECASE)
    return processed


def convert_coreqs(processed):
    """ Puts co-requisites inside square brackets """
    processed = processed.rstrip()
    return re.sub(r"co-?requisites?;?:?\s?(.*)", r"[\1]", processed, flags=re.IGNORECASE)

# -----------------------------------------------------------------------------
# Phase 3: Algo logic
# -------------------


def joining_terms(processed):
    '''Currently, we aim to use "in" as a joining term'''
    # UOC at LX ==> UOC in LX
    processed = re.sub(r'UOC at (L\d)', r'UOC in \1', processed)

    # UOC of LX ==> UOC in LX
    processed = re.sub(r'UOC of (L\d)', r'UOC in \1', processed)

    return processed


def handle_comma_logic(processed):
    '''Handles commas and either removes or converts into AND/OR
    We might need to perform lookaheads to detect if the comma should become an AND or an OR.
    3 main types of cases:
    A, B, && C ==> , becomes &&
    A, B, || C ==> , becomes ||
    A, B, C ==> , becomes &&
    NOTE: This logic will mishandle some conditions where its ambiguous,
    e.g. COMP1531, and COMP2521 or COMP1927 ??????????
    --> we turn it into COMP1531 && COMP2521 || COMP1927 < YO BUT THIS EVALUATES PROPERLY AHAHAHAHA
    '''
    # First we will just convert , || and , && into || and &&
    processed = re.sub(r',\s?(&&|\|\|)', r' \1', processed)

    # Scan for combos of commas until we hit the first || or && and replace the
    # the commas with that
    # e.g. phrase, phrase || phrase ==> phrase || phrase || phrase
    # e.g. phrase, phrase && phrase ==> phrase && phrase && phrase
    matches = re.findall(r'([^&|]+,\s?[^&|]+\s?)(&&|\|\|)', processed)

    for match in matches:
        # Substitute the commas in the phrase with their respective logic operators
        subbed_phrase = re.sub(r',\s?', f" {match[1]} ", match[0])

        # Escape the matched phrase so regex doesn't misintrepret unclosed brackets, etc
        escaped_phrase = re.escape(match[0])

        processed = re.sub(escaped_phrase, subbed_phrase, processed)

    return processed

# -----------------------------------------------------------------------------
# Phase 4: Final touches
# -------------------


def strip_spaces(processed):
    """ Strip multiple repeated whitespace """
    processed = re.sub(' +', ' ', processed)

    # Get rid of white spaces at start and end of word
    return processed.strip()


def strip_bracket_spaces(processed):
    """Strips spaces immediately before and after brackets"""
    processed = re.sub(r'([([]) ', r'\1', processed)
    processed = re.sub(r' ([)]])', r'\1', processed)

    return processed

# '''Converts majors and minors into their respective specialisation codes.
# E.g. Bsc COMP major '''
# def

# '''
# Maybe don't need here, put it in another file at the end.
# Adds opening and closing brackets if they do not exist. Apparently it helps
# to make the code cleaner in enrolment algorithms.
# TODO: Ensure brackets are evenly matched and any mismatched brackets are fixed
# before this point
# '''
# def surround_brackets(processed):
#     return "(" + processed + ")"


# -----------------------------------------------------------------------------
# Phase 4: Common patterns
# -------------------
def uoc_in_business_school(processed):
    '''Converts \d+UOC offered by the UNSW Business School to \d+UOC in S Business'''
    processed = re.sub(
        r'(\d+UOC) offered by the UNSW Business School', r'\1 in S Business', processed)
    return processed

def l2_math_courses(processed):
    '''Converts L2 Maths courses to L@ MATH'''
    processed = re.sub(r'L2 Maths? courses', r'L2 MATH', processed, flags=re.IGNORECASE)
    processed = re.sub(r'L2 Mathematics? courses', r'L2 MATH', processed, flags=re.IGNORECASE)
    return processed

if __name__ == "__main__":
    preprocess_conditions()
