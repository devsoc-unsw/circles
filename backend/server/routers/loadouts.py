"""
APIs for the /loadouts/ route.
"""

import copy
from math import lcm
from operator import itemgetter
from typing import Annotated, Dict, List, Optional

from algorithms.autoplanning import autoplan
from algorithms.transcript import parse_transcript
from algorithms.validate_term_planner import validate_terms
from fastapi import APIRouter, HTTPException, Security, UploadFile
from server.routers.utility.sessions.middleware import HTTPBearerToUserID
from server.routers.utility.user import get_setup_user, set_user, user_storage_to_algo_user, user_storage_to_raw_plan
from server.routers.model import CourseCode, CoursesState, LoadoutStorage, PlannedToTerm, ProgramTime, Storage, UnPlannedToTerm
from server.routers.utility.common import get_course_details, get_course_object

router = APIRouter(
    prefix="/loadouts", 
    tags=["loadouts"]
)

require_uid = HTTPBearerToUserID()

@router.get("/data")
def get_user_loadouts(uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    return user['loadouts']

@router.get("/getActiveLoadoutName")
def get_active_loadout_name(uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    return user['activeLoadout']

@router.get("/getActiveLoadout")
def get_active_loadout(uid: Annotated[str, Security(require_uid)]):
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
    user = get_setup_user(uid)

    # user can have maximum 3 loadouts
    if len(user['loadouts']) >= 3:
        raise HTTPException(status_code=400, detail="Maximum number of loadouts reached")
    
    num_curr_loadouts = len(user['loadouts'])

    new_loadout_name = f'Loadout {num_curr_loadouts + 1}'

    new_loadout: LoadoutStorage = {
        'loadoutName': new_loadout_name,
        'planner': copy.deepcopy(user['planner']),
        'courses': copy.deepcopy(user['courses']),
    }

    user['loadouts'].append(new_loadout)
    set_user(uid, user, True)

@router.post("/switch/{loadout_name}")
def switch_loadout(loadout_name: str, uid: Annotated[str, Security(require_uid)]):
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

