"""
API serving the YAML degree documents. The browser evaluates them (@circles/degree-eval), so the
backend only stores and serves the text; see data/degree_documents/AUTHORING.md for the format.
"""
import hashlib
from typing import Annotated, Optional

from fastapi import APIRouter, Header, Response
from server.db.mongo.conn import degreeDocumentsCOL
from server.routers.model import DegreeDocument, DegreeDocuments

router = APIRouter(
    prefix="/degrees",
    tags=["degrees"],
)


def _version() -> str:
    """A hash of every document's path and content: changes whenever any document does"""
    digest = hashlib.sha256()
    for doc in degreeDocumentsCOL.find({}, {"_id": 0, "path": 1, "sha256": 1}).sort("path", 1):
        digest.update(f"{doc['path']}\0{doc['sha256']}\n".encode("utf8"))
    return digest.hexdigest()[:16]


@router.get(
    "/documents",
    response_model=DegreeDocuments,
    responses={304: {"description": "Not modified: the If-None-Match version is current"}},
)
def get_degree_documents(
    response: Response,
    if_none_match: Annotated[Optional[str], Header()] = None,
) -> DegreeDocuments | Response:
    """
    Every degree document (programs, specialisations, libraries, course conditions, patches) as
    YAML text. The response carries an ETag of the documents' version; send it back as
    If-None-Match to get a 304 when nothing changed.
    """
    version = _version()
    etag = f'"{version}"'
    if if_none_match == etag:
        return Response(status_code=304, headers={"ETag": etag})

    response.headers["ETag"] = etag
    return DegreeDocuments(
        version=version,
        documents=[
            DegreeDocument(path=doc["path"], text=doc["text"], origin="repo")
            for doc in degreeDocumentsCOL.find({}, {"_id": 0, "path": 1, "text": 1}).sort("path", 1)
        ],
    )
