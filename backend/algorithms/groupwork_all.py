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
import os
import time

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException, WebDriverException

# Wait a max of 20 second before giving up on a necessary element of a page loading. Most of the time, it won't take
# that long
MAX_WAIT_TIME = 10
# Separate, much shorter budget for "is this course in the search results?". Measured: a course
# that exists resolves in <=1s, while one that does not burns the FULL timeout - and it burns it
# twice (once here, once after the year fallback). With MAX_WAIT_TIME that was ~55% of total
# runtime spent on courses that never resolve. 2s keeps 2x headroom over the slowest observed hit.
LINK_WAIT_TIME = float(os.environ.get("GROUPWORK_LINK_WAIT", "2"))
# Look this often to see if it's stopped changing. wait_for_stabilisation needs two consecutive
# equal readings, so this value is also the floor on every successful course.
POLL_FREQUENCY = 0.3
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
HOME_URL = "https://www.unsw.edu.au/course-outlines"
OUTPUT_PATH = "../data/final_data/coursesProcessed.json"
# Flush progress to disk every this many courses so a crash part-way through a
# long run doesn't throw away everything scraped so far.
SAVE_INTERVAL = 50

# Optional sharding so several browsers can work the list in parallel. Worker N of M handles
# only the courses at indices where idx % M == N. Workers must NOT all rewrite the 5MB
# coursesProcessed.json - they would clobber each other - so in shard mode each writes a small
# {code: bool} file of its own and groupwork_merge.py folds them in afterwards.
SHARD = int(os.environ.get("GROUPWORK_SHARD", "0"))
SHARDS = int(os.environ.get("GROUPWORK_SHARDS", "1"))
SHARD_PATH = f"../data/final_data/groupwork_shard_{SHARD}.json"

course_data = {}
with open(OUTPUT_PATH, "r", encoding="utf-8") as file:
    course_data = json.load(file)
    courses = list(course_data.keys())

# Everything scraped this run, applied to course_data (single process) or written to the
# shard file (parallel). Pre-loaded from an existing shard file so a killed worker resumes.
results: dict[str, bool] = {}
if SHARDS > 1 and os.path.exists(SHARD_PATH):
    with open(SHARD_PATH, "r", encoding="utf-8") as file:
        results = json.load(file)
    print(f"[shard {SHARD}/{SHARDS}] resuming with {len(results)} already done")

# Courses whose outline could not be fetched this run. These are deliberately left
# WITHOUT a "groupwork" key rather than being recorded as False: a scrape failure is
# "unknown", not "has no group work", and writing False would make the resume check
# below skip the course forever. Left absent, they are simply retried on the next run.
# Consumers already treat a missing key as False (CourseDetails.groupwork defaults to
# False), so the UI is unaffected either way.
failed: list[str] = []


def record_failure(course_code, reason):
    print(f"FAILED ({reason}): {course_code} - will retry on next run")
    failed.append(course_code)


def save_progress():
    # Written to a temp file and swapped in, because the plain "w" + json.dump this replaced
    # truncates the target first: killing the run mid-write left a corrupted file behind.
    target = SHARD_PATH if SHARDS > 1 else OUTPUT_PATH
    payload: dict = results
    if SHARDS == 1:
        for code, value in results.items():
            course_data[code]["groupwork"] = value
        payload = course_data
    try:
        tmp = f"{target}.tmp"
        with open(tmp, "w", encoding="utf-8") as out_file:
            json.dump(payload, out_file, indent=4)
        os.replace(tmp, target)
    except OSError as e:
        print(f"Error saving file: {e}")

# Uses your version of Chrome to run the script, please have Chrome installed, or alternatively, rewrite this to
# use whatever you usually use. Headless by default so a full run (thousands of courses,
# several hours) doesn't take over the desktop; set GROUPWORK_HEADLESS=0 to watch it work.
def make_driver():
    chrome_options = Options()
    if os.environ.get("GROUPWORK_HEADLESS", "1") != "0":
        chrome_options.add_argument("--headless=new")
        # Headless defaults to a cramped 756x556 viewport, which pushes controls under overlays.
        chrome_options.add_argument("--window-size=1920,1080")
    new_driver = webdriver.Chrome(options=chrome_options)  # pylint: disable=not-callable
    new_driver.get(HOME_URL)
    return new_driver


driver = make_driver()
# Sets wait times
wait = WebDriverWait(driver, MAX_WAIT_TIME)

# Needs to accept cookies when working via Selenium unfortunately otherwise the overlay blocks access
# to the form. This has to run after EVERY navigation, not just once at startup: headless Chrome does
# not retain OneTrust's OptanonAlertBoxClosed cookie across driver.get(), so the banner is re-rendered
# on each page load and silently intercepts the search button. Cheap to call when no banner is showing
# (find_elements returns nothing), so it is safe on every iteration in both headless and headed mode.
def dismiss_cookie_banner():
    banner = driver.find_elements(By.ID, "onetrust-banner-sdk")
    if not banner or not banner[0].is_displayed():
        return
    try:
        cookie_wait = WebDriverWait(driver, 10)
        cookie_wait.until(
            EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
        ).click()
        cookie_wait.until(
            EC.invisibility_of_element_located((By.ID, "onetrust-banner-sdk"))
        )
    except WebDriverException:
        print("Cookie banner present but could not be dismissed")


dismiss_cookie_banner()

def recover_driver():
    """Rebuild the browser after the chromedriver command channel dies - once it hangs,
    every later call on the old driver fails, so catching the error is not enough."""
    global driver, wait  # pylint: disable=global-statement
    print("Recreating browser after driver failure")
    try:
        driver.quit()
    except Exception:  # pylint: disable=broad-exception-caught
        pass
    driver = make_driver()
    wait = WebDriverWait(driver, MAX_WAIT_TIME)
    dismiss_cookie_banner()


def scrape_course(course):
    """Fetch one course. Returns True/False, or None if it could not be fetched."""
    dismiss_cookie_banner()

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
    except WebDriverException:
        # Content not loaded in time
        record_failure(course, "search form did not load")
        driver.get(HOME_URL)
        return None

    # As content is dynamically loaded, wait until it is loaded to try getting the link
    try:
        WebDriverWait(driver, LINK_WAIT_TIME).until(
            EC.element_to_be_clickable((By.XPATH, f"//a/span[normalize-space(text())='{course}']"))
        ).click()
    except WebDriverException:
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
            WebDriverWait(driver, LINK_WAIT_TIME).until(
                EC.element_to_be_clickable((By.XPATH, f"//a/span[normalize-space(text())='{course}']"))
            ).click()

        except WebDriverException:
            record_failure(course, "course link not found after year fallback")
            driver.get(HOME_URL)
            return None

    # Note: We can cache the pages generated by this program to avoid parsing again, and just use the
    # direct link, however I recommend just reloading every time, since links will change year to year.
    try:
        wait_for_stabilisation(driver, standard_XPath)
    except WebDriverException:
        # Content not loaded in time
        record_failure(course, "outline page did not stabilise")
        driver.get(HOME_URL)
        return None
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
    driver.get(HOME_URL)
    return groupwork


scraped_this_run = 0

for idx, code_to_scrape in enumerate(courses):
    # Only this worker's slice of the list.
    if idx % SHARDS != SHARD:
        continue

    # Resume support: skip courses that already have a groupwork value from a
    # previous run so re-running only scrapes what's left.
    if "groupwork" in course_data[code_to_scrape] or code_to_scrape in results:
        continue

    try:
        scraped_value = scrape_course(code_to_scrape)
    except WebDriverException:
        record_failure(code_to_scrape, "webdriver error")
        scraped_value = None
    except Exception as exc:  # pylint: disable=broad-exception-caught
        # Anything at all - notably urllib3's TimeoutError (an OSError, NOT a
        # WebDriverException) when the HTTP command channel to chromedriver hangs.
        # A single course must never be able to kill a multi-hour unattended run.
        record_failure(code_to_scrape, f"unexpected {type(exc).__name__}")
        scraped_value = None
        recover_driver()

    if scraped_value is None:
        continue

    results[code_to_scrape] = scraped_value
    scraped_this_run += 1
    # Periodically persist progress so the run can be resumed after a crash.
    if scraped_this_run % SAVE_INTERVAL == 0:
        save_progress()

# Save updated courses data
save_progress()

mine = [c for i, c in enumerate(courses) if i % SHARDS == SHARD]
print(f"\n[shard {SHARD}/{SHARDS}] scraped {len(results)} value(s) across {len(mine)} assigned course(s)")
if failed:
    print(f"{len(failed)} course(s) failed this run and were left unset for retry:")
    print("  " + ", ".join(failed))

driver.quit()
