""" a script that is used to compare 2 years in the archive (or with the current active year) """


import argparse
from contextlib import suppress
import json
from sys import exit


parser = argparse.ArgumentParser()
parser.add_argument(
    "--target",
    type=str,
    help="the year to be compared",
)
parser.add_argument(
    "--source",
    type=str,
    help=""" optional - if a year is selected, compare to that year in the archive """,
)

try:
    args = parser.parse_args()
except argparse.ArgumentError:
    parser.print_help()
    exit(0)

def check_in_fixes(coursename, courses_in_manual):
    """ mutates the list given to add the course name if it is in manual fixes"""
    with suppress(FileNotFoundError):
        with open(f"data/processors/manual_fixes/{coursename[0:4]}fixes.py", "r") as f:
            if f"CONDITIONS[\"{coursename}\"]" in f.read():
                courses_in_manual.append(coursename)


if __name__ == "__main__":
    source_courses = (
        "data/final_data/coursesProcessed.json"
        if args.source is None
        else f"data/final_data/archive/processed/{args.source}.json"
    )

    target_courses = f"data/final_data/archive/processed/{args.target}.json"

    with open(source_courses, "r") as f:
        source_courses = json.loads(f.read())

    with open(target_courses, "r") as f:
        target_courses = json.loads(f.read())

    all_source = set(source_courses.keys())
    all_target = set(target_courses.keys())
    courses_in_manual = []

    print("removed:")
    for removed in all_target - all_source:
        check_in_fixes(removed, courses_in_manual)
        print(f"\t- {removed}")

    print("added:")
    for added in all_source - all_target:
        check_in_fixes(added, courses_in_manual)
        print(f"\t- {added}")

    print("changed:")
    for coursename in all_source.intersection(all_target):
        target_course = target_courses[coursename]["raw_requirements"]
        source_course = source_courses[coursename]["raw_requirements"]
        if target_course != source_course:
            print()
            print(f"\t{coursename}:")
            check_in_fixes(coursename, courses_in_manual)
            print(f"\t\t - from: \"{source_course}\"")
            print(f"\t\t - to: \"{target_course}\"")
    print("inFixes:")
    for added in courses_in_manual:
        print(f"\t- {added}")
