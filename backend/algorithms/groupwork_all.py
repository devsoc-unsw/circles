# Prerequisite: have Chrome installed or change the line driver = webdriver.Chrome() to whatever you prefer
# e.g. driver = webdriver.Firefox(). May want to multiprocess this later if impatient, use multiprocessing to
# get around Python's GIL (global interpreter lock), as threads are just secretly one.

# Don't be alarmed when Selenium opens Chrome, this is needed for fetching data, as the data is
# loaded dynamically based on the fragments, and cannot be parsed via a standard. By isn't needed
# but the old way with just normal Selenium is deprecated anyways, so better to use it. WebDriverWait
# and EC (expected conditions) are needed, as content is dynamically loaded, and otherwise failures
# may occur. If parsing using Selenium, remember to use expected conditions to wait for content to load before
# interacting with it. XPath selectors are used, you can search documentation on that.
# Final parse is done using Beautiful Soup, since it's a little faster, but if you're a future subcomm
# reading this, feel free to use Selenium again if you only want to learn one.

import json
import time

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException

# Wait a max of 20 second before giving up on a necessary element of a page loading. Most of the time, it won't take
# that long
MAX_WAIT_TIME = 10
# Look every 1 seconds to see if it's stopped changing
POLL_FREQUENCY = 1
INVALID_COUNT = -1

standard_XPath = "//dd"

# Waits until the number of the element is consistent to show that dynamic content is fully loaded,
# In this case, description details tag is used, since the elements we're fetching have that tag,
# and it's also one of the most common tags on the page.
def wait_for_stabilisation(web_driver, XPath):
    end_time = time.time() + MAX_WAIT_TIME
    last_count = INVALID_COUNT
    while time.time() < end_time:
        elements = web_driver.find_elements(By.XPATH, XPath)
        count = len(elements)
        if count == last_count and count > 0:
            return
        last_count = count
        time.sleep(POLL_FREQUENCY)
    raise TimeoutException("Elements did not stabilize in time")

# Function to get all course codes from coursesProcessed.json, since we need them as input
# into beautiful soup. Not good design, but it's temp helper and should be replaced with another
# source
OUTPUT_PATH = "../data/final_data/coursesProcessed.json"
# Flush progress to disk every this many courses so a crash part-way through a
# long run doesn't throw away everything scraped so far.
SAVE_INTERVAL = 50

course_data = {}
with open(OUTPUT_PATH, "r", encoding="utf-8") as file:
    course_data = json.load(file)
    courses = list(course_data.keys())


def save_progress():
    try:
        with open(OUTPUT_PATH, "w", encoding="utf-8") as out_file:
            json.dump(course_data, out_file, indent=4)
    except OSError as e:
        print(f"Error saving file: {e}")

# Uses your version of Chrome to run the script, please have Chrome installed, or alternatively, rewrite this to
#use whatever you usually use
# chrome_options = Options()
# chrome_options.add_argument("--headless=new")
# driver = webdriver.Chrome(options=chrome_options)
driver = webdriver.Chrome()  # pylint: disable=not-callable  # selenium false positive
driver.get("https://www.unsw.edu.au/course-outlines")
# Sets wait times
wait = WebDriverWait(driver, MAX_WAIT_TIME)

# Needs to accept cookies when working via Selenium unfortunately otherwise overlay will block access
# to form. Can also have information sent via Javascript execution probably, but no clue about UNSW's
# level of protection against external scripting.
try:
    cookie_wait = WebDriverWait(driver, 10)
    cookie_button = cookie_wait.until(
        EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
    )
    cookie_button.click()

    # Wait until the banner is actually gone
    cookie_wait.until(
        EC.invisibility_of_element_located((By.ID, "onetrust-banner-sdk"))
    )
    print("Accepted cookies")
except TimeoutException:
    print("Cookie banner not found, possibly already handled")

for idx, course in enumerate(courses):
    # Periodically persist progress so the run can be resumed after a crash.
    if idx and idx % SAVE_INTERVAL == 0:
        save_progress()

    # Resume support: skip courses that already have a groupwork value from a
    # previous run so re-running only scrapes what's left.
    if "groupwork" in course_data[course]:
        continue

    # This is the search form's Id and the submit button's id, wait til they both exist,
    # fill in the form and send keys
    search_form_id = "degree-search-input"
    search_form_submit_button = "degree-search-submit"
    try:
        wait.until(
            EC.element_to_be_clickable((By.ID, search_form_submit_button))
        )
        # Fills in the form
        wait.until(
            EC.presence_of_element_located((By.ID, search_form_id))
        ).send_keys(course)
        wait.until(
            EC.element_to_be_clickable((By.ID, search_form_submit_button))
        ).click()
    except TimeoutException:
        # Content not loaded in time
        print(f"Element not found on webpage when searching from homepage: {course}")
        course_data[course]["groupwork"] = False
        driver.get("https://www.unsw.edu.au/course-outlines")
        continue

    # As content is dynamically loaded, wait until it is loaded to try getting the link
    try:
        wait = WebDriverWait(driver, MAX_WAIT_TIME)
        wait.until(
            EC.element_to_be_clickable((By.XPATH, f"//a/span[normalize-space(text())='{course}']"))
        ).click()
    except TimeoutException:
        # If content not loaded in time or returns no results
        # it may be some courses have not updated yet for 2026
        # so try again by changing the filter by year to 2025
        try:
            # open the Year dropdown (the combobox button)
            wait.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[@role='combobox' and contains(@aria-labelledby,'dropdown-year')]"
                ))
            ).click()

            # click year option
            wait.until(
                EC.element_to_be_clickable((By.ID, "dropdown-year-1"))
            ).click()

            time.sleep(1) # wait for React to refresh results

            # The year filter only refreshes the result list, it doesn't navigate anywhere, so the
            # course link still has to be clicked to actually land on the course outline page
            wait.until(
                EC.element_to_be_clickable((By.XPATH, f"//a/span[normalize-space(text())='{course}']"))
            ).click()

        except TimeoutException:
            print(f"Element not found on webpage when trying to fetch link {course}")
            course_data[course]["groupwork"] = False
            driver.get("https://www.unsw.edu.au/course-outlines")
            continue

    # Note: We can cache the pages generated by this program to avoid parsing again, and just use the
    # direct link, however I recommend just reloading every time, since links will change year to year.
    try:
        wait_for_stabilisation(driver, standard_XPath)
    except TimeoutException:
        # Content not loaded in time
        print(f"Element not found on webpage when trying to fetch link {course}")
        course_data[course]["groupwork"] = False
        driver.get("https://www.unsw.edu.au/course-outlines")
        continue
    html = driver.page_source

    # Puts the HTML in nicer beautiful soup format for the final parse, it's quicker than using Selenium
    soup = BeautifulSoup(html, 'html.parser')

    # Gets whether it's group work or not, all group work specifications is stored under a tag called description details,
    # and it conveniently enough can be parsed out. There's a bunch of unrelated description details tags, so
    # we get all the ones that contain the exact text "Group", since that's a standard way of formatting
    # group projects or tasks worth a percentage of the mark for the course. The below is approximately the
    # format from the webpage:
    # <dt>Assessment Format: <dt> <dd>Group<dd>
    potential_group_tags = soup.find_all('dd')
    groupwork = False
    for potential_group_tag in potential_group_tags:
        if potential_group_tag.get_text() == "Group":
            groupwork = True
            break
    if groupwork:
        print(f"Groupwork found in {course}!")
    else:
        print(f"Groupwork not found in {course}!")
    course_data[course]["groupwork"] = groupwork
    driver.get("https://www.unsw.edu.au/course-outlines")

# Save updated courses data
save_progress()

driver.quit()
