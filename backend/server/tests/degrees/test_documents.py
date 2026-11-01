import os

import requests

URL = "http://127.0.0.1:8000/degrees/documents"
DOCUMENTS_PATH = os.path.join(os.path.dirname(__file__), "../../../data/degree_documents")


def _files_on_disk():
    paths = []
    for root, _, files in os.walk(DOCUMENTS_PATH):
        for name in files:
            if name.endswith((".yaml", ".yml")):
                paths.append(os.path.relpath(os.path.join(root, name), DOCUMENTS_PATH).replace(os.sep, "/"))
    return sorted(paths)


def test_serves_every_document_as_written():
    x = requests.get(URL)
    assert x.status_code == 200
    body = x.json()
    paths = [doc["path"] for doc in body["documents"]]
    assert paths == _files_on_disk()

    for doc in body["documents"]:
        assert doc["origin"] == "repo"
        with open(os.path.join(DOCUMENTS_PATH, doc["path"]), encoding="utf8") as f:
            assert doc["text"] == f.read()


def test_includes_the_documents_the_evaluator_needs():
    paths = {doc["path"] for doc in requests.get(URL).json()["documents"]}
    assert "2026/programs/3778.yaml" in paths
    assert "2026/specialisations/COMPA1.yaml" in paths
    assert "2026/library.yaml" in paths


def test_etag_is_the_version_and_revalidates():
    x = requests.get(URL)
    version = x.json()["version"]
    assert x.headers["ETag"] == f'"{version}"'

    unchanged = requests.get(URL, headers={"If-None-Match": f'"{version}"'})
    assert unchanged.status_code == 304
    assert unchanged.content == b""

    stale = requests.get(URL, headers={"If-None-Match": '"not-the-version"'})
    assert stale.status_code == 200


def test_gzipped_when_asked():
    x = requests.get(URL, headers={"Accept-Encoding": "gzip"})
    assert x.headers.get("Content-Encoding") == "gzip"


def _paths(query):
    x = requests.get(URL, params=query)
    assert x.status_code == 200
    return [doc["path"] for doc in x.json()["documents"]]


def test_filter_by_program_specs_and_start_year():
    assert _paths({"programCode": "3778", "specs": "COMPA1", "start_year": 2026}) == [
        "2026/library.yaml",
        "2026/programs/3778.yaml",
        "2026/specialisations/COMPA1.yaml",
    ]


def test_filter_follows_extends_and_takes_specs_comma_separated():
    # 3778 2027 extends 2026; MATHC2 has no 2027 document, so the nearest earlier year
    assert _paths({"programCode": "3778", "specs": "COMPA1,MATHC2", "start_year": 2027}) == [
        "2026/library.yaml",
        "2026/programs/3778.yaml",
        "2026/specialisations/COMPA1.yaml",
        "2026/specialisations/MATHC2.yaml",
        "2027/programs/3778.yaml",
    ]


def test_filter_includes_spec_defaults_and_falls_back_a_year():
    # no 2025 document: the nearest earlier year (2023), and its default major COMPA1 at 2026
    assert _paths({"programCode": "3778", "start_year": 2025}) == [
        "2023/programs/3778.yaml",
        "2026/library.yaml",
        "2026/specialisations/COMPA1.yaml",
    ]


def test_filter_includes_component_programs():
    paths = _paths([("programCode", "3785"), ("specs", "COMPBH"), ("specs", "COMPA1"), ("start_year", 2027)])
    assert "2027/programs/3785.yaml" in paths
    assert "2027/programs/3707.yaml" in paths
    assert "2027/programs/3778.yaml" in paths
    assert "2027/specialisations/COMPBH.yaml" in paths
    # course conditions only serve course checks
    assert not [p for p in paths if "/conditions/" in p]


def test_filter_unknown_program_is_empty():
    assert not _paths({"programCode": "9999", "start_year": 2026})


def test_filter_needs_a_program():
    assert requests.get(URL, params={"specs": "COMPA1"}).status_code == 400


def test_filtered_etag_revalidates():
    query = {"programCode": "3778", "specs": "COMPA1", "start_year": 2026}
    version = requests.get(URL, params=query).json()["version"]
    assert requests.get(URL, params=query, headers={"If-None-Match": f'"{version}"'}).status_code == 304
