'''
Preprocessing the conditions and logging to enrolmentRules.json
Some examples of preprocessing are:
- Getting rid of "Prerequisite:" or similar at start of line
- Fixing extra white space
- Normalising AND/OR/and/or to && and ||
- Converting specialisation and program names to corresponding codes
'''

import re 
from data.utility import dataHelpers

PREPROCESSED_RULES = {}
CODE_MAPPING = dataHelpers.read_data("data/utility/programCodeMappings.json")["title_to_code"]

def preprocess_rules():
    data = dataHelpers.read_data("data/scrapers/coursesFormattedRaw.json")

    for code, course in data.items():
        if not course["enrolment_rules"]:
            continue
        original = course["enrolment_rules"]
        
        rules = {}

        # Store original text for debugging
        rules["original_rule"] = original
        
        processed = original
        processed = delete_HTML(processed)
        processed = convert_program_codes(processed)
        processed = convert_UOC(processed)
        processed = convert_WAM(processed)
        processed = convert_AND_OR(processed)
        processed = delete_trailing_punc(processed)
        processed = delete_prereq_label(processed)
        processed = strip_spaces(processed)
        
        # At the end, remove remaining lowercase prepositions

        rules["processed_rule"] = processed

        PREPROCESSED_RULES[code] = rules

    dataHelpers.write_data(PREPROCESSED_RULES, "data/finalData/preprocessedRules.json")

def delete_HTML(processed):
    """ Remove HTML tags """
    return re.sub("<[a-z]*/>", "", processed, flags=re.IGNORECASE)

def convert_program_codes(processed):
    """ Converts program codes to their code mappings: e.g. 'Computer Science' 
        to 'COMP' """
    # Query: is there a more efficient way to do this?
    for program in CODE_MAPPING:
        if program in processed:
            processed = re.sub(program, CODE_MAPPING[program], processed)
    
    return processed

def convert_UOC(processed):
    """ Converts 'units of credit' to UOC and removes any spacing """
    processed = re.sub(" units of credit", "UOC", processed, flags=re.IGNORECASE)
    processed = re.sub(" UOC", "UOC", processed, flags=re.IGNORECASE)
    processed = re.sub("completion of( at least)? (\d+UOC)", "\\2", processed, flags=re.IGNORECASE)
    return processed

def convert_WAM(processed):
    """ Converts WAM requirements """
    # Look for integer within 3 words after 'WAM' or 'mark', e.g.:
    #    - "WAM of 65" -> "65WAM"
    #    - "WAM of at least 65" -> "65WAM"
    #    - "mark of at least 65" -> "65WAM"
    processed = re.sub("(WAM|mark) ([a-z]* ){0,3}(\d\d)", "\\3WAM", processed, flags=re.IGNORECASE)

    # Then delete any superfluous preceding words, e.g.:
    #    - "minimum 65WAM" -> "65WAM"
    #    - "A 65WAM" -> "65WAM"
    processed = re.sub("[a-z]+ (\d\dWAM)", "\\1", processed, flags=re.IGNORECASE)
    return processed

def convert_AND_OR(processed):
    """ Convert 'and' to '&&' and 'or' to '||' """
    processed = re.sub(" and ", " && ", processed, flags=re.IGNORECASE)
    processed = re.sub(" or ", " || ", processed, flags=re.IGNORECASE)
    return processed

def delete_trailing_punc(processed):
    """ Deletes any trailing punctuation """
    return re.sub("\.$", "", processed)

def delete_prereq_label(processed):
    """ Removes 'prerequisite' and variations """
    # variations incude ["prerequisite", "pre-requisite", "prer-requisite"]
    return re.sub("[Pp]re[A-Za-z/_-]*:?", "", processed)

def strip_spaces(processed):
    """ Strip multiple repeated whitespace """
    return " ".join(processed.split())

# def delete_completion_language(processed):
#     language = ["must have completed"]

if __name__ == "__main__":
    preprocess_rules()