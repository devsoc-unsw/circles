'''Turns the processed conditions into a list, separated into logical blocks.
For example:
"COMP1511 || DPST1091 || COMP1911 || COMP1917"
==> [(, COMP1511, ||, DPST1091, ||, COMP1911, ||, COMP1917, )]

"65GRADE in COMP1927 || COMP2521"
==> [(, 65GRADE in COMP1927, ||, COMP2521, )]
'''

import re
from data.utility import dataHelpers

PARSED_LOGIC = {}

split_key = ["(", ")", "&&", "||"]

'''Converts the text condition into a json list'''
def parse_conditions_logic():
    data = dataHelpers.read_data("data/finalData/preprocessedRules.json")
    
    for code, condition in data.items():
        text = condition["processed_rule"]

        logic = ["("]

        # Split on ands/ors and brackets
        phrase = ""
        for word in text.split():
            if word in split_key:
                # End the logical phrase and split on this word
                logic.append(phrase.strip())
                logic.append(word)
                phrase = ""
            else:
                # Keep building the logical phrase
                phrase += word + " "
        
        logic.append(phrase.strip())

        logic.append(")")

        PARSED_LOGIC[code] = logic

    
    dataHelpers.write_data(PARSED_LOGIC, "data/finalData/conditionsParsedLogic.json")