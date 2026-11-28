"""
Tests for the "share my course data" opt-out setting, which controls whether a
user's plan is counted in GET /courses/popularElectives.
"""
import requests

from server.tests.user.utility import clear, get_token, get_token_headers, usersCOL

BASE = "http://127.0.0.1:8000"
WIZARD = {
    "programCode": "3778",
    "startYear": 2024,
    "endYear": 2026,
    "specs": ["COMPA1"],
}


def setup_user(**overrides):
    token = get_token()
    headers = get_token_headers(token)
    res = requests.post(f"{BASE}/user/setupDegreeWizard", headers=headers, json={**WIZARD, **overrides})
    assert res.status_code == 200
    return headers


def get_settings(headers):
    return requests.get(f"{BASE}/user/data/settings", headers=headers).json()


def test_wizard_defaults_to_sharing():
    clear()
    headers = setup_user()
    assert get_settings(headers)["shareCourseData"] is True


def test_wizard_saves_opt_out():
    clear()
    headers = setup_user(shareCourseData=False)
    assert get_settings(headers)["shareCourseData"] is False


def test_toggle_flips_and_persists():
    clear()
    headers = setup_user()
    url = f"{BASE}/user/settings/toggleShareCourseData"

    assert requests.post(url, headers=headers).status_code == 200
    assert get_settings(headers)["shareCourseData"] is False

    assert requests.post(url, headers=headers).status_code == 200
    assert get_settings(headers)["shareCourseData"] is True


def test_toggle_leaves_other_settings_alone():
    clear()
    headers = setup_user()
    requests.post(f"{BASE}/user/settings/toggleShowMarks", headers=headers)
    requests.post(f"{BASE}/user/settings/toggleShareCourseData", headers=headers)
    settings = get_settings(headers)
    assert settings["showMarks"] is True
    assert settings["shareCourseData"] is False


def test_toggle_requires_auth():
    assert requests.post(f"{BASE}/user/settings/toggleShareCourseData").status_code in (401, 403)


def test_import_keeps_existing_opt_out():
    """Importing an older plan file (no shareCourseData) must not opt the user back in."""
    clear()
    headers = setup_user(shareCourseData=False)
    exported = requests.get(f"{BASE}/user/data/all", headers=headers).json()
    exported["settings"].pop("shareCourseData", None)
    exported["courses"] = {
        code: {"mark": c["mark"], "ignoreFromProgression": c["ignoreFromProgression"]}
        for code, c in exported["courses"].items()
    }
    res = requests.put(f"{BASE}/user/import", headers=headers, json=exported)
    assert res.status_code == 200, res.text
    assert get_settings(headers)["shareCourseData"] is False


# --- one-time notice ("shareNoticeSeen") ---

def make_pre_notice_account(headers):
    """Strip the notice flag, like an account created before the notice existed."""
    usersCOL.update_many({}, {"$unset": {"settings.shareNoticeSeen": ""}})
    return headers


def test_wizard_marks_notice_seen():
    clear()
    headers = setup_user()
    assert get_settings(headers)["shareNoticeSeen"] is True


def test_old_account_has_not_seen_notice_but_is_counted():
    clear()
    headers = make_pre_notice_account(setup_user())
    settings = get_settings(headers)
    assert settings["shareNoticeSeen"] is False
    assert settings["shareCourseData"] is True


def test_dismiss_marks_seen_and_keeps_sharing():
    clear()
    headers = make_pre_notice_account(setup_user())
    assert requests.post(f"{BASE}/user/settings/dismissShareNotice", headers=headers).status_code == 200
    settings = get_settings(headers)
    assert settings["shareNoticeSeen"] is True
    assert settings["shareCourseData"] is True


def test_toggle_also_marks_notice_seen():
    clear()
    headers = make_pre_notice_account(setup_user())
    requests.post(f"{BASE}/user/settings/toggleShareCourseData", headers=headers)
    settings = get_settings(headers)
    assert settings["shareNoticeSeen"] is True
    assert settings["shareCourseData"] is False


def test_dismiss_requires_auth():
    assert requests.post(f"{BASE}/user/settings/dismissShareNotice").status_code in (401, 403)
