'''
DOCUMENTATION: https://github.com/csesoc/Circles/wiki/Tokenising-Conditions

Turns the processed conditions into a list, separated into logical blocks.
For example:
"COMP1511 || DPST1091 || COMP1911 || COMP1917"
==> [(, COMP1511, ||, DPST1091, ||, COMP1911, ||, COMP1917, )]

"65GRADE in COMP1927 || COMP2521"
==> [(, 65GRADE in COMP1927, ||, COMP2521, )]
'''

import re
from data.utility import dataHelpers

PARSED_LOGIC = {}

'''Converts the text condition into a json list'''


def tokenise_conditions():
    data = dataHelpers.read_data("data/finalData/conditionsProcessed.json")

    for code, condition in data.items():
        text = condition["processed"]

        # There are many words with (abcdefgh) where the brackets are attached
        # too tightly to the word. We first want to separate them like so:
        # ( abcdefgh ) so that our split can separate them cleanly.
        text = re.sub(r'\(', r' ( ', text)
        text = re.sub(r'\)', r' ) ', text)
        text = re.sub(r'\]', r' ] ', text)
        text = re.sub(r'\[', r' [ ', text)
        text = re.sub(r' +', r' ', text)
        
        logic = ["("]

        # Split on white space
        for word in text.split():
            logic.append(word)
        
        logic.append(")")

        PARSED_LOGIC[code] = logic

    dataHelpers.write_data(
        PARSED_LOGIC, "data/finalData/conditionsTokens.json")
