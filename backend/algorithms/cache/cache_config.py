"""
Is the configuration file for `cache.py`
"""

# Config for mapping course -> code
# This json has two fields. `"codes"` and `"keywords"`
# "codes" is a list of valid codes
# "keyword_mapping" is a dict where the key is a keyword and the value
# is the codes that keyword maps to
CACHE_CONFIG = "./algorithms/cache/cache_config.json"

# INPUT SOURCES
COURSES_PROCESSED_FILE = "./data/final_data/coursesProcessed.json"

PROGRAMS_FORMATTED_FILE = "./data/scrapers/programsFormattedRaw.json"

CACHED_EXCLUSIONS_FILE = "./algorithms/cache/exclusions.json"

CONDITIONS_PROCESSED_FILE = "./data/final_data/conditionsProcessed.json"


# OUTPUT SOURCES
CACHED_WARNINGS_FILE = "./algorithms/cache/handbook_note.json"

MAPPINGS_FILE = "./algorithms/cache/mappings.json"

COURSE_MAPPINGS_FILE = "./algorithms/cache/courseMappings.json"

PROGRAM_MAPPINGS_FILE = "./algorithms/cache/programMappings.json"
