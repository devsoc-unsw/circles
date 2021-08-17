import re
s = "78UOC"
print(re.findall(r"(\d+)UOC", s)[0])