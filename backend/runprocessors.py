'''The driver for our procsesors. Provide the relevant command line arguments
in order to run the relevant drivers'''

import sys
import argparse
import subprocess
from algorithms.load_conditions import cache_conditions_pkl_file
from algorithms.log_broken import log_broken_conditions 

from data.scrapers.programsScraper import scrape_programs as scrape_prg_data
from data.scrapers.specialisationsScraper import scrape_spn_data
from data.scrapers.coursesScraper import scrape_courses as scrape_course_data

from data.scrapers.programsFormatting import format_data as format_prg_data
from data.scrapers.specialisationsFormatting import format_spn_data
from data.scrapers.coursesFormatting import format_course_data

from data.processors.programs_processing import process_data as process_prg_data
from data.processors.programs_processing_type1 import process_data as process_prg_data_type1
from data.processors.specialisations_processing import customise_spn_data
from data.processors.courses_processing import process_courses as process_course_data

from data.processors.conditions_preprocessing import preprocess_conditions
from data.processors.conditions_tokenising import tokenise_conditions

from algorithms.cache.cache import cache_exclusions
from algorithms.cache.cache import cache_warnings
from algorithms.cache.cache import cache_mappings
from algorithms.cache.cache import cache_program_mappings

parser = argparse.ArgumentParser()
parser.add_argument('--type', type=str,
                    help='program, specialisation, course, condition, algorithm')
parser.add_argument('--stage', type=str,
                    help=
                    '''
                    (any) --> all
                    program/specialisation/course --> scrape, format, process, type1
                    condition --> process, manual, tokenise
                    cache --> exclusion, warning, mapping, program
                    ''')

try:
    args = parser.parse_args()
except:
    parser.print_help()
    sys.exit(0)

def run_manual_fixes():
    subprocess.run(['data/processors/manualFixes/runManualFixes.sh'])

run = {
    'program': {
        'scrape': scrape_prg_data,
        'format': format_prg_data,
        'process': process_prg_data,
        'type1': process_prg_data_type1
    },
    'specialisation': {
        'scrape': scrape_spn_data,
        'format': format_spn_data,
        'process': customise_spn_data
    },
    'course': {
        'scrape': scrape_course_data,
        'format': format_course_data,
        'process': process_course_data
    },
    'condition': {
        'process': preprocess_conditions,
        'manual': run_manual_fixes,
        'tokenise': tokenise_conditions
    },
    'cache': {
        'conditions': cache_conditions_pkl_file,
        'exclusion': cache_exclusions,
        'warnings': cache_warnings,
        'mapping': cache_mappings,
        'program': cache_program_mappings,
        'parsingErrors': log_broken_conditions
    }
}
if __name__ == '__main__':
    if args.type == 'data-fix' and args.stage == 'all':
        '''run all the things except for the scrapers and formatters to deal with code changes'''
        for t in run:
            for stage in run[t]:
                if stage != 'scrape':
                    run[t][stage]()
    elif args.stage == 'all':
        # Run all the stages from top to bottom
        if args.type in ["program", "specialisation", "course"]:
            # NOTE: Be careful when using this as this will rerun the scrapers
            res = input(
                f"Careful. You are about to run all stages of {args.type} INCLUDING the scrapers... Enter 'y' if you wish to proceed or 'n' to cancel: ")
            if res == 'y':
                for s in run[args.type]:
                    run[args.type][s]()
        else:
            # Conditions
            for s in run[args.type]:
                run[args.type][s]()
    else:
        # Run the specific process
        run[args.type][args.stage]()
