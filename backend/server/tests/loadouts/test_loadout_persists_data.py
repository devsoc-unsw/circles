import json

import requests
from server.tests.user.utility import clear, get_token, get_token_headers
from server.routers.model import DEFAULT_LOADOUT_NAME

PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)


def test_loadout_persists_data_on_loadout_switch():
    """
    Test that a user's loadout persists their data when they switch loadouts.
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

    user_create_loadout_response = requests.post(
        'http://127.0.0.1:8000/loadouts/create',
        headers=headers
    )
    # automatically switched to new loadout 'Loadout 2' upon creating a new loadout
    user_add_unplanned_course_response = requests.post(
        'http://127.0.0.1:8000/planner/addToUnplanned',
        json={'courseCode': 'COMP1511'},
        headers=headers
    )
    assert user_add_unplanned_course_response.status_code == 200
    
    # check that the course was added to the loadout
    user_data_response = requests.get(
        'http://127.0.0.1:8000/user/data/all',
        headers=headers
    )
    user_data = user_data_response.json()
    assert 'COMP1511' in user_data['loadouts'][1]['courses']
    assert user_data['activeLoadout'] == 'Loadout 2'

    # switch to default loadout and then switch back to 'Loadout 2'
    user_switch_to_default_loadout_response = requests.post(
        'http://127.0.0.1:8000/loadouts/switch/Default Plan',
        headers=headers
    )
    assert user_switch_to_default_loadout_response.status_code == 200
    
    user_switch_to_loadout_2_response = requests.post(
        'http://127.0.0.1:8000/loadouts/switch/Loadout 2',
        headers=headers
    )
    assert user_switch_to_loadout_2_response.status_code == 200
    
    # check that the course is in users courses field after switching back to 'Loadout 2'
    user_data_response = requests.get(
        'http://127.0.0.1:8000/user/data/all',
        headers=headers
    )
    user_data = user_data_response.json()
    assert 'COMP1511' in user_data['loadouts'][1]['courses']
    assert user_data['activeLoadout'] == 'Loadout 2'



def test_loadout_persists_data_in_database():
    """
    Test that a user's loadout data persists in the database across multiple requests.
    """
    clear()
    token = get_token()
    headers = get_token_headers(token)
    
    # import user and create loadout with data
    requests.put('http://127.0.0.1:8000/user/import', json=DATA["simple_year"], headers=headers)
    requests.post('http://127.0.0.1:8000/loadouts/create', headers=headers)
    requests.post('http://127.0.0.1:8000/planner/addToUnplanned', json={'courseCode': 'COMP1511'}, headers=headers)
    
    # get data from first request
    first_fetch = requests.get('http://127.0.0.1:8000/user/data/all', headers=headers).json()
    
    # make some other requests to simulate time passing
    requests.get('http://127.0.0.1:8000/courses/COMP1511', headers=headers)
    
    # Get data from second request. This tests how the data persists in the database because the /user/data/all route calls get_setup_user() which calls get_user() server/db/helpers which will directly get the data from the database 
    second_fetch = requests.get('http://127.0.0.1:8000/user/data/all', headers=headers).json()
    
    # Verify loadouts are identical across fetches
    assert first_fetch['loadouts'] == second_fetch['loadouts']
    assert first_fetch['activeLoadout'] == second_fetch['activeLoadout']
    assert 'COMP1511' in second_fetch['loadouts'][1]['courses']
    
         