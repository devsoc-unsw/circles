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
