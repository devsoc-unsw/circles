"""
The driver for our procsesors. Provide the relevant command line arguments
in order to run the relevant drivers
if you need to bash this, use python3 -m data.final_data.archive.runprocessors_archive --year <year> --stage data-fix
"""

import argparse
from sys import exit

from data.processors.courses_processing import process_course_data

from data.scrapers.courses_formatting import format_course_data
from data.scrapers.courses_scraper import scrape_course_data

parser = argparse.ArgumentParser()
parser.add_argument(
    "--year",
    type=int,
)
parser.add_argument(
    "--stage",
    type=str,
    help="""scrape, format, process, all, data-fix""",
)

try:
    args = parser.parse_args()
except argparse.ArgumentError:
    parser.print_help()
    exit(0)



run = {
    "scrape": scrape_course_data,
    "format": format_course_data,
    "process": process_course_data,
}

if __name__ == "__main__":
    if args.stage is None:
        args.stage = "data-fix"

    if args.stage == "all":
        # Run all the stages from top to bottom
        res = input(
            f"Careful. You are about to run all stages INCLUDING the scrapers... Enter 'y' if you wish to proceed or 'n' to cancel: "
        )
        if res == "y":
            for s in run:
                run[s](args.year)
    elif args.stage == "data-fix":
        for s in run:
            if s != "scrape":
                run[s](args.year)
    else:
        run[args.stage](args.year)
