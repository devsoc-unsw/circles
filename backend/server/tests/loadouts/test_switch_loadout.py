import json

import requests
from server.tests.user.utility import clear, get_token, get_token_headers
from server.routers.model import DEFAULT_LOADOUT_NAME

PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)

def test_switch_loadout():
    """
    Test that a user can successfully switch to a different loadout. Also confirm that the active loadout is switched to the new loadout.
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
    assert user_data['activeLoadout'] == 'Loadout 2'

    # switch to default loadout
    user_switch_loadout_response = requests.post(
        'http://127.0.0.1:8000/loadouts/switch/Default Plan',
        headers=headers
    )

    assert user_switch_loadout_response.status_code == 200

    user_data_response = requests.get(
        'http://127.0.0.1:8000/user/data/all',
        headers=headers
    )
    user_data = user_data_response.json()
    assert user_data['activeLoadout'] == 'Default Plan'

    # switch back to new loadout
    user_switch_loadout_response = requests.post(
        'http://127.0.0.1:8000/loadouts/switch/Loadout 2',
        headers=headers
    )

    assert user_switch_loadout_response.status_code == 200

    # check that we successfully switched back to the new loadout
    user_data_response = requests.get(
        'http://127.0.0.1:8000/user/data/all',
        headers=headers
    )
    user_data = user_data_response.json()
    assert user_data['activeLoadout'] == 'Loadout 2'
