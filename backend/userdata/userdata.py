"""
Stores the data for a user.

Not to be confused with `user.py` which only stores the user data relevant
to the backend algorithms
TODO: eventual merge of those two
"""

from time import time
from typing import Dict, Optional

from algorithms.objects.user import User

class UserData():
    """
        A complete data class for a user.
        Combines course data with metadata
    """

    def __init__(
            self, uid: str, data: Optional[Dict] =None, email: Optional[str] = "",
            given_name: Optional[str]="", family_name: Optional[str]="",
        ) -> None:
        self.uid: str = uid
        self.email: Optional[str] = email
        self.user: User = User(data)
        self.given_name: Optional[str] = given_name
        self.family_name: Optional[str] = family_name

        self.time_created: int = int(time())
        self.login_instances: Dict[int, int] = {}
        self.add_login_instance()

    def add_login_instance(self, ts: int=None):
        """ Increment the number of login instances for today """
        day = unix_time_to_day(ts)
        try:
            self.login_instances[day] += 1
        except KeyError:
            self.login_instances[day] = 1
        return ts


def unix_time_to_day(ts: int = None) -> int:
    """
        Returns the number of days since unix epoch for the given timestamp
        - If no timestamp given then, the current time will be used
    """
    ts = time() if ts is None else ts
    SECONDS_PER_DAY: int = 86400
    return ts // SECONDS_PER_DAY

