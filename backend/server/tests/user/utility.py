import requests

def clear():
    x = requests.post('http://127.0.0.1:8000/user/drop')
    if x.status_code == 404:
        assert False, "ERROR: You need to set the DANGEROUS_ALLOW_DELETE_DB_REQUEST variable to run tests. Never run this test suite in prod."
