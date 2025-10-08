import json

import requests
from server.tests.user.utility import clear, get_token, get_token_headers
from server.routers.model import DEFAULT_LOADOUT_NAME

PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)

def test_delete_loadout():
    """
    Test that a user can successfully delete a loadout. Also confirm that the active loadout is switched to the default loadout.
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

    assert user_create_loadout_response.status_code == 200

    user_data_response = requests.get(
        'http://127.0.0.1:8000/user/data/all',
        headers=headers
    )
    user_data = user_data_response.json()
    assert user_data['loadouts'][1]['loadoutName'] == 'Loadout 2'

    user_delete_loadout_response = requests.delete(
        'http://127.0.0.1:8000/loadouts/delete/Loadout 2',
        headers=headers
    )

    assert user_delete_loadout_response.status_code == 200

    user_data_response = requests.get(
        'http://127.0.0.1:8000/user/data/all',
        headers=headers
    )
    user_data = user_data_response.json()
    assert user_data['loadouts'][0]['loadoutName'] == DEFAULT_LOADOUT_NAME
    assert user_data['activeLoadout'] == DEFAULT_LOADOUT_NAME

    # check that the loadout was deleted
    assert len(user_data['loadouts']) == 1

def test_cannot_delete_default_loadout():
    """
    Test that a user cannot delete the default loadout.
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

    assert user_create_loadout_response.status_code == 200

    user_data_response = requests.get(
        'http://127.0.0.1:8000/user/data/all',
        headers=headers
    )
    user_data = user_data_response.json()
    assert len(user_data['loadouts']) == 2
    

    user_delete_loadout_response = requests.delete(
        f'http://127.0.0.1:8000/loadouts/delete/{DEFAULT_LOADOUT_NAME}',
        headers=headers
    )

    # shouldn't be able to delete default loadout
    assert user_delete_loadout_response.status_code == 400

    user_data_response = requests.get(
        'http://127.0.0.1:8000/user/data/all',
        headers=headers
    )
    user_data = user_data_response.json()
    # check that the default loadout was not deleted
    assert user_data['loadouts'][0]['loadoutName'] == DEFAULT_LOADOUT_NAME
    assert user_data['activeLoadout'] == 'Loadout 2'
    assert len(user_data['loadouts']) == 2