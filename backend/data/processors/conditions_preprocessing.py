"""
Preprocessing the conditions and logging to conditionsProcessed.json
Some examples of preprocessing are:
- Getting rid of "Prerequisite:" or similar at start of line
- Fixing extra white space
- Normalising AND/OR/and/or to && and ||
- Converting specialisation and program names to corresponding codes
"""

import re
from data.utility.data_helpers import read_data, write_data

PREPROCESSED_CONDITIONS = {}
CODE_MAPPING = read_data("data/utility/programCodeMappings.json")["title_to_code"]

SPECIALISATION_MAPPINGS = {
    'School of the Arts and Media honours': 'MDIA?H',
    'School of Social Sciences, Asian Studies or European Studies honours': 'ASIABH || EUROBH',
    'Creative Writing honours': 'CRWTWH',
    'Construction Management and Property undergraduate program or minor': 'BLDG??',
    'Media, Culture and Technology honours': 'MECTBH',
    'Theatre and Performance Studies honours': 'THSTBH',
    'Environmental Humanities honours': 'ENVPEH',
    'Physics Honours': 'ZPEMPH || PHYSGH',
    'Film Studies honours': 'FILMBH',
    'English honours': 'ENGLDH',
    'Dance Studies honours': 'DANCBH',
    'History honours': 'HISTCH || ZHSSHH',
    'Philosophy honours': 'PHILBH',
    'Asian Studies honours': 'ASIABH',
    'Chinese Studies honours': 'CHINBH',
    'French Studies honours': 'FRENBH',
    'Spanish Studies honours': 'SPANEH',
    'Japanese Studies honours': 'JAPNDH',
    'Korean Studies honours': 'KORECH',
    'Linguistics honours': 'LINGCH',
    'German Studies honours': 'GERSBH',
    'European Studies honours': 'EUROBH',
    'Sociology and Anthropology honours': 'SOCACH',
    'Politics and International Relations honours': 'POLSGH',
    'Global Development honours': 'COMDFH',
    'Media honours': 'MDIA?H',
    'Education honours': '4509',
    'Criminology honours': '4505',
    'Politics, Philosophy and Economics': '3478 || 4797',
    'single or double Music (Honours)': 'MUSC?H || 4508',
    'Music program': 'MUSC?? || 4508',
    'Social Work': '4033',
    'single or dual award Media': '4510 || 3454 || 3438 || 3453',
    'single or double degree Media': '4510 || 3454 || 3438 || 3453',
    'Social Science or Social Research and Policy': '3321 || 3420',
    'Education program': '4509 || 4056',
    'International Studies(?:\s+single)?(?:\s+or\s+((double)|(dual))\s+((degree)|(program)))?(?:\s*\(2017 onwards\))?': '3447',
}

def preprocess_conditions():
    """
    As title says. Preprocess conditions. Clean HTMl to something readable,
    convert symbols like brackets, grades, etc to their objects. Also
    process logical operators, logic and fix spacing and brackets.
    """
    data = read_data("data/scrapers/coursesFormattedRaw.json")

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
        processed = convert_program_type(processed)
        processed = convert_fslash(processed)
        processed = convert_including(processed)
        processed = convert_manual_programs_and_specialisations(processed)
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

    write_data(PREPROCESSED_CONDITIONS, "data/final_data/conditionsProcessed.json")


# -----------------------------------------------------------------------------
# Phase 1: Deletions
# -------------------


def delete_exclusions(processed):
    """Removes exclusions from enrolment conditions"""
    # Remove exclusion string which appears before prerequisite plaintext
    excl_string = re.search(r"(excl.*?:.*?)(pre)", processed, flags=re.IGNORECASE)
    if excl_string:
        processed = re.sub(excl_string.group(1), "", processed)

    # Remove exclusion string appearing after prerequisite plaintext, typically
    # at the end of the enrolment rule
    processed = re.sub(r"excl.*", "", processed, flags=re.IGNORECASE)

    return processed


def delete_HTML(processed):
    """Remove HTML tags"""
    # Will replace with a space because they sometimes appear in the middle of the text
    # so "and<br/>12 UOC" would turn into and12 UOC
    return re.sub("<[a-z]*/>", " ", processed, flags=re.IGNORECASE)


def delete_self_referencing(code, processed):
    """Remove any references to this course"""
    # E.g. "COMP4962: {
    #     "processed_rule": "COMP4962 COMP4951"
    # } "
    return re.sub(code, "", processed)


def delete_extraneous_phrasing(processed):
    """Sometimes there's extraneous phrasing which needs to be handled"""
    # Must have completed COMP1511 ==> COMP1511
    # processed = re.sub("Must have completed ", "", processed, flags=re.IGNORECASE)

    # Remove 'Both' as it also usually preceeds handled logical phrases
    processed = re.sub("Both", "", processed, flags=re.IGNORECASE)

    # Remove 'or higher' as XXWAM implies XX minimum
    processed = re.sub("or higher", "", processed)

    # Remove 'student' references as it is implied
    processed = re.sub("students?", "", processed, flags=re.IGNORECASE)

    # Removed enrollment language since course and program codes imply this
    processed = re.sub("enrolled in", "", processed, flags=re.IGNORECASE)

    # Remove completion language
    completion_text = [
        "completion of",
        "must successfully complete",
        "must have completed",
        "completing",
        "completed",
        "a pass in",
    ]
    for text in completion_text:
        processed = re.sub(text, "", processed, flags=re.IGNORECASE)

    return processed


def delete_prereq_label(processed):
    """Removes 'prerequisite' and variations"""
    # variations incude ["prerequisite", "pre-requisite", "prer-requisite", "pre req", "prereq:"]
    return re.sub(r"[Pp]re( req)?[A-Za-z\/_-]* ?[:;]*", "", processed)


def delete_trailing_punc(processed):
    """Deletes any trailing punctuation"""
    return re.sub(r"(\.|;)\s*$", "", processed)


# -----------------------------------------------------------------------------
# Phase 2: Conversions
# -------------------


def convert_square_brackets(processed):
    """Converts '[' to '(' and ']' to ')'"""
    processed = re.sub(r"\[", r"(", processed)
    processed = re.sub(r"]", r")", processed)
    return processed


def convert_UOC(processed):
    """Converts to XXUOC"""
    # Converts unit(s) of credit(s) to UOC and removes spacing
    processed = re.sub(
        r"\s*units? (of credits?|completed?)", "UOC", processed, flags=re.IGNORECASE
    )
    # Places UOC right next to the numbers
    processed = re.sub(r"\s*UOC", "UOC", processed, flags=re.IGNORECASE)

    # After UOC has been mainly converted, remove some extraneous phrasing
    processed = re.sub(
        r"(of|at least)?\s*(\d+UOC)", r" \2", processed, flags=re.IGNORECASE
    )
    processed = re.sub(
        r"(\d+UOC)(\s*overall\s*)", r"\1 ", processed, flags=re.IGNORECASE
    )

    # Remove "minimum" since it is implied
    processed = re.sub(r"minimum (\d+UOC)", r"\1", processed, flags=re.IGNORECASE)

    return processed


def convert_WAM(processed):
    """Converts WAM requirements. WAM refers to overall mark."""
    # Look for integer within 3 words after 'WAM' or 'mark', e.g.:
    #    - "WAM of 65" -> "65WAM"
    #    - "WAM of at least 65" -> "65WAM"
    processed = re.sub(
        r"WAM ([a-z]* ){0,3}(\d\d)", r"\2WAM", processed, flags=re.IGNORECASE
    )

    # Then delete any superfluous preceding words, chars or spaces, e.g.:
    #    - "minimum 65WAM" -> "65WAM"
    #    - "A 65WAM" -> "65WAM"
    processed = re.sub(
        r"[a|minimum]+ (\d\d)\s*WAM", r"\1WAM", processed, flags=re.IGNORECASE
    )

    # Compress any remaining spaces between digits and WAM and remove misc chars
    # like '+' and '>', e.g.:
    #    - ">65WAM" -> "65WAM"
    #    - "65+ WAM" -> "65WAM"
    #    - "65WAM+" -> "65WAM"
    processed = re.sub(
        r">?(\d\d)\+?\s*WAM\+?", r"\1WAM", processed, flags=re.IGNORECASE
    )

    return processed


def convert_GRADE(processed):
    """Converts mark/grade requirements, usually relating to a specific course.
    NOTE: We prefer to use 'GRADE' here because 'MARK' could interfere with Marketing
    courses"""

    # Converts "mark of at least XX to XXGRADE"
    processed = re.sub(
        r"(a )?(minimum )?mark of (at least )?(\d\d)( or (greater|above))?",
        r"\4GRADE",
        processed,
        flags=re.IGNORECASE,
    )

    # Further handle CR and DN. These usually follow a course code
    # MATH1141 (CR) ==> 65WAM MATH1141
    # Use "in" as a joining word"
    processed = re.sub(r"([A-Z]{4}[\d]{4})\s*\(CR\)", r"65GRADE in \1", processed)
    processed = re.sub(r"([A-Z]{4}[\d]{4})\s*\(DN\)", r"75GRADE in \1", processed)

    return processed


def convert_level(processed):
    """Converts level X to LX"""
    return re.sub(r"level (\d)", r"L\1", processed, flags=re.IGNORECASE)


def convert_program_type(processed):
    """Converts complex phrases into something of the form CODE# for specifying a program type"""
    # TODO: make this more generic
    processed = map_word_to_program_type(processed, r"actuarial( studies)?", "ACTL#")
    processed = map_word_to_program_type(processed, r"business", "BUSN#")
    processed = map_word_to_program_type(processed, r"commerce", "COMM#")
    return processed


def convert_fslash(processed):
    """Converts forward slashes to || and surrounds in brackets"""
    # E.g.:
    #    - "(COMP1521/DPST1092 && COMP2521)" -> "((COMP1521 || DPST1092) && COMP2521)"
    #    - "COMP9444 / COMP9417 / COMP9517/COMP4418" -> "(COMP9444 || COMP9417 || COMP9517 || COMP4418)"
    matches = re.findall(r"[A-Z]{4}[\d]{4}(?:\s*/\s*[A-Z]{4}[\d]{4})+", processed)

    for match in matches:
        subbed_phrase = re.sub(r"/", r" || ", match)
        subbed_phrase = f"({subbed_phrase})"
        processed = re.sub(match, subbed_phrase, processed)

    return processed


def convert_including(processed):
    """Convert 'including' to &&"""
    return re.sub("including", "&&", processed)


def convert_manual_programs_and_specialisations(processed):
    """
    Deals with the following cases:
    - Enrolment in a x program
    - Enrolment in x program
    - Enrolment in x
    - Enrolment in the x honours program
    """
    for prog_str, code in SPECIALISATION_MAPPINGS.items():
        processed = re.sub(
            rf"\s*enrolment\s+in\s+((?:an?\s+)|(?:the\s+))?{prog_str}(?:\s+program)?\s*",
            f" ({code}) ",
            processed,
            flags=re.IGNORECASE
        )
    return processed


def convert_AND_OR(processed):
    """Convert 'and' to '&&' and 'or' to '||'"""
    processed = re.sub(" and ", " && ", processed, flags=re.IGNORECASE)
    processed = re.sub(" & ", " && ", processed, flags=re.IGNORECASE)
    processed = re.sub(" and/or ", " || ", processed, flags=re.IGNORECASE)
    processed = re.sub(" plus ", " && ", processed, flags=re.IGNORECASE)
    processed = re.sub(r" \+ ", " && ", processed, flags=re.IGNORECASE)
    processed = re.sub(" or ", " || ", processed, flags=re.IGNORECASE)
    return processed


def convert_coreqs(processed):
    """Puts co-requisites inside square brackets"""
    processed = processed.rstrip()
    return re.sub(
        r",*;*\.*\s*(co-?requisites?|concurrentl?y?)\s*;?:?\s*(.*)", r" [\2]", processed, flags=re.IGNORECASE
    )


# -----------------------------------------------------------------------------
# Phase 3: Algo logic
# -------------------


def joining_terms(processed):
    """Currently, we aim to use "in" as a joining term"""
    # UOC at LX ==> UOC in LX
    processed = re.sub(r"UOC at (L\d)", r"UOC in \1", processed)

    # UOC of LX ==> UOC in LX
    processed = re.sub(r"UOC of (L\d)", r"UOC in \1", processed)

    return processed


def handle_comma_logic(processed):
    """
    Handles commas and either removes or converts into AND/OR
    We might need to perform lookaheads to detect if the comma should become an AND or an OR.
    3 main types of cases:
    A, B, && C ==> , becomes &&
    A, B, || C ==> , becomes ||
    A, B, C ==> , becomes &&
    NOTE: This logic will mishandle some conditions where its ambiguous,
    e.g. COMP1531, and COMP2521 or COMP1927 ??????????
    --> we turn it into COMP1531 && COMP2521 || COMP1927 < YO BUT THIS EVALUATES PROPERLY AHAHAHAHA
    """
    # If the word 'either' is still in processed. If so, must replace commas with ||s instead of &&s later on
    # when it's ambiguous between the two
    if 'either' in processed:
        joining_cond = '||'
    else:
        joining_cond = '&&'
    processed = re.sub("either", "", processed, flags=re.IGNORECASE)

    # First we will just convert , || and , && into || and &&
    processed = re.sub(r",\s*(&&|\|\|)", r" \1", processed)

    # Scan for combos of commas until we hit the first || or && and replace the
    # the commas with that
    # e.g. phrase, phrase || phrase ==> phrase || phrase || phrase
    # e.g. phrase, phrase && phrase ==> phrase && phrase && phrase
    if bool(re.match(r'^\s*[A-Z]{4}[0-9]{4}', processed)):
        matches = re.findall(r'([^&|]+,\s*[^&|]+\s*)(&&|\|\|)', processed)

        for match in matches:
            # Substitute the commas in the phrase with their respective logic operators
            subbed_phrase = re.sub(r',\s*', f" {match[1]} ", match[0])

            # Escape the matched phrase so regex doesn't misintrepret unclosed brackets, etc
            escaped_phrase = re.escape(match[0])

            processed = re.sub(escaped_phrase, subbed_phrase, processed)

        # Check if there were only commas in between course codes. If work has already been done DO NOTHING.
        # E.g, "72UOC , room in degree for course, Good academic standing" -> considered but no changes
        # "2303, 3303 && 3304" -> Not considered
        # "CEIC2001, CEIC2002, MATH2019, CEIC3000" -> "CEIC2001 && CEIC2002 && MATH2019 && CEIC3000"
        # "at least one of the following: ECON2112, ECON2206, ..." -> Not considered

        # If there are no &&s and ||s between course codes, just replace them with &&s.
        if '&&' not in processed and '||' not in processed:
            matches = re.findall(r'(?=([A-Z]{4}[0-9]{4}\s*,\s*[A-Z]{4}[0-9]{4}))', processed)
            for match in matches:
                # Replace each ' , ' with ' && ', where the amount
                # of whitespace on either side of the comma doesn't matter
                replacement = match.split(',')
                processed = re.sub(match, f'{replacement[0]} {joining_cond} {replacement[1]}', processed)

    # add &&s before coreqs if coreqs is not preceded by an OR logic
    if re.search(r'(?<!\|\|\s)\[.*\]', processed):
        processed = re.sub(r'&*\s*\[(.*)\]', r' && [\1]', processed)

    # remove &&s or ||s if it's the start of string
    processed = re.sub(r'^\s*&&', '', processed)
    processed = re.sub(r'^\s*\|\|', '', processed)

    return processed


# -----------------------------------------------------------------------------
# Phase 4: Final touches
# -------------------


def strip_spaces(processed):
    """Strip multiple repeated whitespace"""
    processed = re.sub(" +", " ", processed)

    # Get rid of white spaces at start and end of word
    return processed.strip()

def strip_bracket_spaces(processed):
    """Strips spaces immediately before and after brackets"""
    processed = re.sub(r"([([]) ", r"\1", processed)
    processed = re.sub(r" ([)]])", r"\1", processed)

    return processed


# """Converts majors and minors into their respective specialisation codes.
# E.g. Bsc COMP major """
# def

# """
# Maybe don't need here, put it in another file at the end.
# Adds opening and closing brackets if they do not exist. Apparently it helps
# to make the code cleaner in enrolment algorithms.
# TODO: Ensure brackets are evenly matched and any mismatched brackets are fixed
# before this point
# """
# def surround_brackets(processed):
#     return "(" + processed + ")"


# -----------------------------------------------------------------------------
# Phase 4: Common patterns
# -------------------
def uoc_in_business_school(processed):
    """Converts \d+UOC offered by the UNSW Business School to \d+UOC in F Business"""
    processed = re.sub(
        r"(\d+UOC) offered by the UNSW Business School", r"\1 in F Business", processed
    )
    return processed


def l2_math_courses(processed):
    """Converts L2 Maths courses to L@ MATH"""
    processed = re.sub(r"L2 Maths? courses", r"L2 MATH", processed, flags=re.IGNORECASE)
    processed = re.sub(
        r"L2 Mathematics? courses", r"L2 MATH", processed, flags=re.IGNORECASE
    )
    return processed


def map_word_to_program_type(processed, regex_word, type):
    return re.sub(
        rf"in {regex_word} (programs?|single or dual degrees?)",
        type,
        processed,
        flags=re.IGNORECASE,
    )  # hard to capture a generic case?

if __name__ == "__main__":
    preprocess_conditions()
