# This is a basic checker, if this doesn't work, your groupwork parsing won't work either.

# Don't be alarmed when selenium opens Chrome, this is needed for fetching data, as the data is
# loaded dynamically based on the fragments, and cannot be parsed via standard Beautiful Soup
from selenium import webdriver
from bs4 import BeautifulSoup

# Uses your version of Chrome to run the script, please have Chrome installed, or alternatively, rewrite this to
#use whatever you usually use
driver = webdriver.Chrome()
id="degree-search-input"
driver.get("https://www.unsw.edu.au/course-outlines/course-outline#year=2025&term=Term%201&deliveryMode=Multimodal&deliveryFormat=Standard&teachingPeriod=T1&deliveryLocation=Kensington&courseCode=COMP6080&activityGroupId=1")
html = driver.page_source
driver.quit()

# Puts the HTML in nicer beautiful soup format
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
    print("Success: Groupwork found in COMP6080!")
else:
    # If you are getting this error, either change the link at driver.get() to a course you
    # are certain has groupwork (At present it is COMP6080), and if it works you're good to go.
    # If it still doesn't work, you're going to have to find a different source for your links
    # because the website doesn't work
    print("I swear groupwork was part of this course, either it's been reworked, or the website's changed formats")