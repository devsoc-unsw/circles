# Don't be alarmed when selenium opens Chrome, this is needed for fetching data, as the data is
# loaded dynamically based on the fragments, and cannot be parsed via a standard
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

# All group
potential_group_tags = soup.find_all('dd')
groupwork = False
for potential_group_tag in potential_group_tags:
    if potential_group_tag.get_text() == "Group":
        groupwork = True
        break
if groupwork:
    print("Success: Groupwork found in COMP6080!")
else:
    print("I swear groupwork was part of this course")