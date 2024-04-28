class SessionError(Exception):
    # Base error
    def __init__(self, description: str):
        self.description = description

class SessionExpiredToken(SessionError):
    def __init__(self, token: str):
        super().__init__("Expired session token, is too old or has already been destroyed.")
        self.token = token

class SessionExpiredRefreshToken(SessionError):
    def __init__(self, token: str):
        super().__init__("Expired refresh token, is too old or has already been destroyed.")
        self.token = token

class SessionOldRefreshToken(SessionError):
    def __init__(self, token: str):
        super().__init__("Exhausted refresh token, likely a replay attack, should deestroy the OIDC session.")
        self.token = token

# TODO: rename these
