"""
Configuration file for Data
"""
# NOTE: UNSW releases next year's handbook during the T2 holidays. However, it's
# assumed that circles will only stably update to this new handbook a few weeks
# into T3. In this case, all the students will have already locked in all their
# courses for the current year and thus, we can treat the current year as an
# archived year (saving us time from maintaining 2 sets of algorithms for the
# current AND the future year)

# The latest current handbook year that we will maintain all the algorithms for
LIVE_YEAR = 2022

# The years for which we have archived
ARCHIVED_YEARS = [2019, 2020, 2021, 2022]

# TODO: Consider adding file paths to this file so we don't have to type out
# the exact path to write to every time

CONDITIONS_TOKEN_FILE = "./data/final_data/conditionsTokens.json"
CONDITIONS_PICKLE_FILE = "./data/final_data/conditions.pkl"
