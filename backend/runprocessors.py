'''The driver for our procsesors. Provide the relevant command line arguments
in order to run the relevant drivers'''

# TODO: import courseScraper

import sys
import argparse
import glob

from data.scrapers.programsScraper import scrape_programs as scrape_prg_data
from data.scrapers.specialisationsScraper import scrape_spn_data
from data.scrapers.coursesScraper import scrape_courses as scrape_course_data

from data.scrapers.programsFormatting import format_data as format_prg_data
from data.scrapers.specialisationsFormatting import format_spn_data
from data.scrapers.coursesFormatting import format_course_data

from data.processors.programsProcessing import process_data as process_prg_data
from data.processors.specialisationsProcessing import customise_spn_data
from data.processors.coursesProcessing import process_courses as process_course_data

from data.processors.conditionsPreprocessing import preprocess_conditions
from data.processors.conditions_tokenising import tokenise_conditions


parser = argparse.ArgumentParser()
parser.add_argument('--type', type=str,
                    help='program, specialisation, course or condition')
parser.add_argument('--stage', type=str,
                    help='all, scrape, format, process (or manual/tokenise for conditions manual fixes)')

try:
    args = parser.parse_args()
except:
    parser.print_help()
    sys.exit(0)

run = {
    'program': {
        'scrape': scrape_prg_data,
        'format': format_prg_data,
        'process': process_prg_data
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
        # 'manual': fix_conditions
        'tokenise': tokenise_conditions
    }
}


if args.stage == 'all':
    # Run all the stages from top to bottom
    if args.type in ["program", "specialisation", "course"]:
        # NOTE: Be careful when using this as this will rerun the scrapers
        res = input(
            f"Careful. You are about to run all stages of {args.type} INCLUDING the scrapers... Enter 'y' if you wish to proceed or 'n' to cancel: ")
        if res == 'y':
            for s in run[args.type]:
                run[args.stage][s]()
    else:
        # Conditions
        for s in run[args.type]:
            run[args.stage][s]
else:
    # Run the specific process
    run[args.type][args.stage]()
