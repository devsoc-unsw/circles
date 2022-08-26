"""
DOCUMENTATION: TBA

This file currently does the job of two. TODO: move stuff out

1. Pre-process condition tokenisations
2. Tokenise conditions


"""


from typing import Dict

from data.utility.data_helpers import read_data, write_data


def pre_process_program_requirements(program_info: Dict) -> Dict:
    """
    Recieves the relevant information from a course from `programsProcessed.json`
    and applies pre-processing requirements so that it can be tokenised.
    """
    return program_info

def tokenise_program_requirements(program_info: Dict) -> Dict:
    """
    Recieves the pre-processed program info and tokenises the conditions.
    """
    return program_info

def main():
    program_info = read_data()

    pre_processed: Dict = {}
    for code, info in program_info.items():
        pre_processed[code] = pre_process_program_requirements(info)

    final: Dict = {}
    for code, info in pre_processed.items():
        final[code] = tokenise_program_requirements(info)

    write_data(final)

main()


