"""
API serving the YAML degree documents. The browser evaluates them (@circles/degree-eval), so the
backend only stores and serves the text; see data/degree_documents/AUTHORING.md for the format.
"""
import hashlib
from typing import Annotated, Any, Optional

from fastapi import APIRouter, Header, HTTPException, Query, Response
from server.db.mongo.conn import degreeDocumentsCOL
from server.routers.model import DegreeDocument, DegreeDocuments

router = APIRouter(
    prefix="/degrees",
    tags=["degrees"],
)

Meta = dict[str, Any]  # a stored document without its text: path, kind, code, year, sha256, refs


def _nearest(years: dict[int, Meta], year: int) -> int:
    """The year a document resolves to (SCHEMA.md §2.2): the nearest earlier year, else the nearest later"""
    earlier = [y for y in years if y <= year]
    return max(earlier) if earlier else min(years)


def _add_libraries_and_patches(metas: list[Meta], libraries: dict[int, Meta], selected: dict[str, Meta]):
    """Add the library for each selected document's year (the nearest year at or before it), and the
    patches that target a selected program or specialisation"""
    for year in {meta["year"] for meta in selected.values()}:
        earlier = [y for y in libraries if y <= year]
        if earlier:
            selected[libraries[max(earlier)]["path"]] = libraries[max(earlier)]

    codes = {meta["code"] for meta in selected.values()}
    for meta in metas:
        refs = meta.get("refs", {})
        if meta["kind"] == "patch" and refs.get("target_kind") in ("program", "specialisation") \
                and refs.get("target_code") in codes | {None}:
            selected[meta["path"]] = meta


def _select(metas: list[Meta], program: str, specs: list[str], start_year: Optional[int]) -> list[Meta]:
    """
    The documents evaluating `program` with `specs` needs: the program at the start year and the years
    it extends, its component programs, the specs (selected and slot defaults) at those programs'
    years, the library for every year used, and the patches that target any of them. Course
    conditions are left out (only course checks use them). Without a start year, every year of each
    document is included.
    """
    by_identity: dict[tuple[str, Optional[str]], dict[int, Meta]] = {}
    for meta in metas:
        if meta["year"] is not None:
            by_identity.setdefault((meta["kind"], meta["code"]), {})[meta["year"]] = meta

    selected: dict[str, Meta] = {}

    def resolve(kind: str, code: str, year: Optional[int]) -> list[Meta]:
        years = by_identity.get((kind, code), {})
        if not years:
            return []
        if year is None:
            chain = list(years.values())
        else:
            chain = []
            at: Optional[int] = _nearest(years, year)
            while at in years and years[at] not in chain:  # follow `extends` to the base years
                chain.append(years[at])
                at = years[at].get("refs", {}).get("extends_year")
        for meta in chain:
            selected[meta["path"]] = meta
        return chain

    programs = resolve("program", program, start_year)
    if not programs:
        return []
    program_years = {programs[0]["year"] if start_year is not None else None}
    for meta in list(programs):
        for component in meta.get("refs", {}).get("components", []):
            year = component["year"] or (programs[0]["year"] if start_year is not None else None)
            resolved = resolve("program", component["program"], year)
            programs += resolved
            if resolved and year is not None:
                program_years.add(resolved[0]["year"])

    spec_codes = set(specs) | {code for meta in programs for code in meta.get("refs", {}).get("spec_defaults", [])}
    for code in sorted(spec_codes):
        for year in program_years:
            resolve("specialisation", code, year)

    _add_libraries_and_patches(metas, by_identity.get(("library", "library"), {}), selected)
    return sorted(selected.values(), key=lambda meta: meta["path"])


def _version(metas: list[Meta]) -> str:
    """A hash of the documents' paths and contents: changes whenever any of them does"""
    digest = hashlib.sha256()
    for meta in metas:
        digest.update(f"{meta['path']}\0{meta['sha256']}\n".encode("utf8"))
    return digest.hexdigest()[:16]


@router.get(
    "/documents",
    response_model=DegreeDocuments,
    responses={304: {"description": "Not modified: the If-None-Match version is current"}},
)
def get_degree_documents(
    response: Response,
    programCode: Optional[str] = None,
    specs: Annotated[Optional[list[str]], Query()] = None,
    start_year: Optional[int] = None,
    if_none_match: Annotated[Optional[str], Header()] = None,
) -> DegreeDocuments | Response:
    """
    The degree documents (programs, specialisations, libraries, course conditions, patches) as YAML
    text. With no query, every document.

    With `programCode`, only what evaluating that program needs (see `_select`). `specs` are the
    student's specialisations, repeated or comma-separated (`specs=COMPA1,MATHC2`); `start_year`
    picks the year of each document, as the evaluator would. An unknown program gives an empty list.

    The response carries an ETag of the returned documents' version; send it back as If-None-Match
    to get a 304 when nothing changed.
    """
    if programCode is None and (specs or start_year is not None):
        raise HTTPException(status_code=400, detail="specs and start_year filter by a programCode")

    metas: list[Meta] = list(degreeDocumentsCOL.find({}, {"_id": 0, "text": 0}).sort("path", 1))
    if programCode is not None:
        codes = [code.strip() for value in specs or [] for code in value.split(",") if code.strip()]
        metas = _select(metas, programCode, codes, start_year)

    version = _version(metas)
    etag = f'"{version}"'
    if if_none_match == etag:
        return Response(status_code=304, headers={"ETag": etag})

    texts = {
        doc["path"]: doc["text"]
        for doc in degreeDocumentsCOL.find({"path": {"$in": [meta["path"] for meta in metas]}}, {"_id": 0, "path": 1, "text": 1})
    }
    response.headers["ETag"] = etag
    return DegreeDocuments(
        version=version,
        documents=[DegreeDocument(path=meta["path"], text=texts[meta["path"]], origin="repo") for meta in metas],
    )
