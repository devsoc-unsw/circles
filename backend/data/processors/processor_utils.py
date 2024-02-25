import re


def replace_HTML_br_with_newline(s: str) -> str:
    """
    # Replace HTML <br> tags with a newline character
    """
    return re.sub("<br/?>", "\n", s, flags=re.IGNORECASE)

def delete_HTML(s: str) -> str:
    """
    # Remove HTML tags and replace them with a space

    Will replace with a space because they sometimes appear in the middle of
    the text so "and<br/>12 UOC" would turn into and12 UOC. Instead, we want
    "and 12 UOC".

    If there already exists whitespace to either side of the tag, extra whitespace
    will not be added.
    i.e. "hi <br/> there" -> "hi there"
    """
    return re.sub(" *<[a-z]*/> *", " ", s, flags=re.IGNORECASE)


