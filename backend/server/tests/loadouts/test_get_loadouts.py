import json

import requests
from server.tests.user.utility import clear, get_token, get_token_headers
from server.routers.model import DEFAULT_LOADOUT_NAME

PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)


def test_imported_user_gets_default_loadout():
    """
    Test that when a user imports their profile from example_local_storage_data.json
    (which doesn't include loadouts), a default loadout is automatically created
    with their imported courses and planner data.
    """
    clear()
    token = get_token()
    headers = get_token_headers(token)
    
    # Import user data (which doesn't include loadouts)
    import_response = requests.put(
        'http://127.0.0.1:8000/user/import', 
        json=DATA["simple_year"], 
        headers=headers
    )
    assert import_response.status_code == 200
    
    # Get user data and verify loadouts were created
    user_data_response = requests.get(
        'http://127.0.0.1:8000/user/data/all', 
        headers=headers
    )
    assert user_data_response.status_code == 200
    user_data = user_data_response.json()
    
    # Verify loadouts field exists and has one loadout
    assert 'loadouts' in user_data
    assert len(user_data['loadouts']) == 1
    
    # Verify the default loadout has the correct name
    default_loadout = user_data['loadouts'][0]
    assert default_loadout['loadoutName'] == DEFAULT_LOADOUT_NAME
    
    # Verify the default loadout contains the imported planner data
    assert 'planner' in default_loadout
    assert default_loadout['planner']['startYear'] == DATA["simple_year"]["planner"]["startYear"]
    assert default_loadout['planner']['isSummerEnabled'] == DATA["simple_year"]["planner"]["isSummerEnabled"]
    assert default_loadout['planner']['unplanned'] == DATA["simple_year"]["planner"]["unplanned"]
    
    # Verify the default loadout contains the imported courses
    assert 'courses' in default_loadout
    # Check that at least one course from the import exists in the loadout
    assert "COMP6447" in default_loadout['courses']
    
    # Verify activeLoadout is set to the default loadout
    assert 'activeLoadout' in user_data
    assert user_data['activeLoadout'] == DEFAULT_LOADOUT_NAME
    
    # Verify the loadout API endpoint also returns the default loadout
    loadouts_response = requests.get(
        'http://127.0.0.1:8000/loadouts/data',
        headers=headers
    )
    assert loadouts_response.status_code == 200
    loadouts = loadouts_response.json()
    assert len(loadouts) == 1
    assert loadouts[0]['loadoutName'] == DEFAULT_LOADOUT_NAME


def test_imported_user_migration_persists():
    """
    Test that the default loadout created during import is persisted to the database,
    so subsequent requests don't need to recreate it.
    """
    clear()
    token = get_token()
    headers = get_token_headers(token)
    
    # Import user data
    requests.put(
        'http://127.0.0.1:8000/user/import', 
        json=DATA["simple_year"], 
        headers=headers
    )
    
    # First request - should create and persist the default loadout
    first_response = requests.get(
        'http://127.0.0.1:8000/user/data/all', 
        headers=headers
    )
    assert first_response.status_code == 200
    first_data = first_response.json()
    
    # Second request - should retrieve the persisted loadout
    second_response = requests.get(
        'http://127.0.0.1:8000/user/data/all', 
        headers=headers
    )
    assert second_response.status_code == 200
    second_data = second_response.json()
    
    # Verify both responses have the same loadout structure
    assert first_data['loadouts'] == second_data['loadouts']
    assert first_data['activeLoadout'] == second_data['activeLoadout']
    assert len(first_data['loadouts']) == 1
    assert first_data['loadouts'][0]['loadoutName'] == DEFAULT_LOADOUT_NAME
