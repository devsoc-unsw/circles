"""
APIs for the /loadouts/ route.
"""

import copy
from typing import Annotated, Optional

from fastapi import APIRouter, HTTPException, Security
from server.routers.utility.sessions.middleware import HTTPBearerToUserID
from server.routers.utility.user import get_setup_user, set_user
from server.routers.model import LoadoutStorage,PlannerLocalStorage, Storage
MAX_LOADOUTS = 3

router = APIRouter(
    prefix="/loadouts", 
    tags=["loadouts"]
)

require_uid = HTTPBearerToUserID()

@router.get("/data")
def get_user_loadouts(uid: Annotated[str, Security(require_uid)]):
    """
    Gets user loadouts, a list of loadouts
    Args:
        token (str, optional): The user's authentication token. Defaults to DUMMY_TOKEN.

    Returns:
        List[Loadout]: a list of the users loadouts
            - loadoutName(str): The name of the loadout
            - planner(PlannerLocalStorage): The loadout's planner
            - courses (dict[str, CourseStorage]): The loadout's courses
    """
    user = get_setup_user(uid)
    return user['loadouts']

@router.get("/getActiveLoadoutName")
def get_active_loadout_name(uid: Annotated[str, Security(require_uid)]):
    """
    Gets the name of the active loadout for the user

    Args:
        token (str, optional): The user's authentication token. Defaults to DUMMY_TOKEN.

    Returns:
        str: the name of the currently active loadout
    """
    user = get_setup_user(uid)
    return user['activeLoadout']

@router.get("/getActiveLoadout")
def get_active_loadout(uid: Annotated[str, Security(require_uid)]):
    """
    Gets the user's active loadout

    Args:
        token (str, optional): The user's authentication token. Defaults to DUMMY_TOKEN.
    
    Returns:
        Loadout: the users current active loadout
            - loadoutName(str): The name of the active loadout
            - planner(PlannerLocalStorage): The active loadout's planner
            - courses(dict[str, CourseStorage]): The active loadout's courses
    """
    user = get_setup_user(uid)
    

    if not user['activeLoadout']:
        raise HTTPException(status_code=400, detail="No current active loadout")
    
    active_loadout = None

    active_loadout = get_target_loadout(user['activeLoadout'], user)
    if not active_loadout:
        raise HTTPException(status_code=400, detail="user active loadout is set but loadout doesn't exist")

    return active_loadout

@router.post("/create")
def create_user_loadout(uid: Annotated[str, Security(require_uid)]):
    """
    Create's a new loadout for the user (Maximum of MAX_LOADOUTS = 3 loadouts)

    Args:
        token (str, optional): The user's authentication token. Defaults to DUMMY_TOKEN.

    Raises:
        HTTPException: The user has already created the maximum number of loadouts
    """
    user = get_setup_user(uid)

    # user can have maximum MAX_LOADOUTS loadouts
    if len(user['loadouts']) >= MAX_LOADOUTS:
        raise HTTPException(status_code=400, detail="Maximum number of loadouts reached")
    
    num_curr_loadouts = len(user['loadouts'])

    new_loadout_name = f'Loadout {num_curr_loadouts + 1}'

    new_planner: PlannerLocalStorage = {
        'unplanned': [],
        'isSummerEnabled': False,
        'startYear': user['planner']['startYear'],
        'lockedTerms': {},
        'years': [],
    }

    num_years = len(user['planner']['years'])

    new_planner['years'] = [
        {"T0": [], "T1": [], "T2": [], "T3": []}
        for _ in range(num_years)
    ]

    new_loadout: LoadoutStorage = {
        'loadoutName': new_loadout_name,
        'planner': new_planner,
        'courses': {},
    }

    user['loadouts'].append(new_loadout)

    # switch to the new loadout
    user['courses'] = new_loadout['courses']
    user['planner'] = new_loadout['planner']
    user['activeLoadout'] = new_loadout_name

    set_user(uid, user, True)

    

@router.post("/switch/{loadout_name}")
def switch_loadout(loadout_name: str, uid: Annotated[str, Security(require_uid)]):
    """
    Args:
        loadout_name: The name of the loadout to switch to
        token (str, optional): The user's authentication token. Defaults to DUMMY_TOKEN.

    Raises:
        HTTPException: The loadout the user requested to switch to does not exist
    """
    user = get_setup_user(uid)

    target_loadout = get_target_loadout(loadout_name, user)

    if not target_loadout:
        raise HTTPException(status_code=400, detail=f"Cannot switch to loadout {loadout_name}: loadout not found")
    
    # load the data of the loadout being switched to into user fields
    user['courses'] = target_loadout['courses']
    user['planner'] = target_loadout['planner']
    user['activeLoadout'] = loadout_name

    set_user(uid, user, True)

@router.delete("/delete/{loadout_name}")
def delete_loadout(loadout_name: str, uid: Annotated[str, Security(require_uid)]):
    """
    Args:
        loadout_name: The name of the loadout to delete
        token (str, optional): The user's authentication token. Defaults to DUMMY_TOKEN.

    Raises:
        HTTPException: The loadout the user requested to delete does not exist
    """
    user = get_setup_user(uid)

    target_loadout = get_target_loadout(loadout_name, user)

    if not target_loadout:
        raise HTTPException(status_code=400, detail=f"Cannot delete loadout {loadout_name} as it does not exist")
    
    if len(user['loadouts']) <= 1:
        raise HTTPException(status_code=400, detail=f"Cannot delete loadout {loadout_name}: cannot delete all loadouts")
    user['loadouts'] = [l for l in user['loadouts'] if l['loadoutName'] != loadout_name]
    
    # if deleting the active loadout, switch to the first remaining loadout
    if user['activeLoadout'] == loadout_name:
        if len(user['loadouts']) == 0:
            raise HTTPException(status_code=400, detail=f"Somehow deleted last loadout")
        new_active_loadout = user['loadouts'][0]
        user['courses'] = new_active_loadout['courses']
        user['planner'] = new_active_loadout['planner']
        user['activeLoadout'] = new_active_loadout['loadoutName']

    set_user(uid, user, True)


def get_target_loadout(loadoutName: str, user: Storage) -> Optional[LoadoutStorage]:
    """
    Retrieves a loadout from the user by its name
    
    Args:
        loadoutName (str): name of the loadout
        user (Storage): the user being searched
    
    Returns:
        LoadoutStorage | None: The loadout if found, otherwise None
    """
    for loadout in user['loadouts']:
        if loadout['loadoutName'] == loadoutName:
            return loadout
    
    return None

