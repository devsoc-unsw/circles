import json

import requests
from server.routers.model import MAX_LOADOUTS
from server.tests.user.utility import clear, get_token, get_token_headers
from server.routers.model import DEFAULT_LOADOUT_NAME

PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)

def test_create_new_loadout():
    """
    Test that a user can successfully create a new loadout. Also confirm that the new loadout is independent from the default loadout so that changes to the new loadout do not affect the default loadout.
    """
    clear()
    token = get_token()
    headers = get_token_headers(token)

    import_response = requests.put(
        'http://127.0.0.1:8000/user/import', 
        json=DATA["simple_year"], 
        headers=headers
    )

    assert import_response.status_code == 200

    user_loadouts_response = requests.get(
        'http://127.0.0.1:8000/loadouts/data',
        headers=headers
    )

    assert user_loadouts_response.status_code == 200
    user_loadouts = user_loadouts_response.json()

    assert len(user_loadouts) == 1

    assert user_loadouts[0]['loadoutName'] == DEFAULT_LOADOUT_NAME

    create_loadout_response = requests.post(
        'http://127.0.0.1:8000/loadouts/create',
        headers=headers
    )

    assert create_loadout_response.status_code == 200

    user_data_response= requests.get(
        'http://127.0.0.1:8000/user/data/all',
        headers=headers
    )
    assert user_data_response.status_code == 200
    user_data = user_data_response.json()

    # check that the new loadout was created properly
    assert len(user_data['loadouts']) == 2
    assert user_data['loadouts'][1]['loadoutName'] == 'Loadout 2'

    # check that new loadout is empty
    assert user_data['loadouts'][1]['courses'] == {}
    # check that active loadout is automatically switched to the new loadout upon creating a new loadout
    assert user_data['activeLoadout'] == 'Loadout 2'

    newCourse = {
        'courseCode': 'COMP3231'
    }
    user_add_course_response = requests.post(
        'http://127.0.0.1:8000/planner/addToUnplanned', json=newCourse,
        headers=headers,
    )

    assert user_add_course_response.status_code == 200

    user_loadouts_response = requests.get(
        'http://127.0.0.1:8000/loadouts/data',
        headers=headers
    )
    assert user_loadouts_response.status_code == 200
    user_loadouts = user_loadouts_response.json()

    # check that the new course was added to the new loadout
    assert 'COMP3231' in user_loadouts[1]['courses']

    # check that the new course was not added to the default loadout
    assert 'COMP3231' not in user_loadouts[0]['courses']

def test_create_loadout_maximum_reached(): 
    """
    Test that a user cannot create a new loadout if they have reached the maximum number of loadouts.
    """
    clear()
    token = get_token()
    headers = get_token_headers(token)

    import_response = requests.put(
        'http://127.0.0.1:8000/user/import', 
        json=DATA["simple_year"], 
        headers=headers
    )
    
    for i in range(MAX_LOADOUTS - 1):
        user_create_loadout_response = requests.post(
            'http://127.0.0.1:8000/loadouts/create',
            headers=headers
        )

        assert user_create_loadout_response.status_code == 200

    user_create_loadout_response = requests.post(
        'http://127.0.0.1:8000/loadouts/create',
        headers=headers
    )
    # can't create new loadout if we have reached maximum number of loadouts
    assert user_create_loadout_response.status_code == 400
    
    

