from fastapi import APIRouter

router = APIRouter(
    prefix='/specialisations',
    tags=['specialisations'],
    responses={404: {"description": "Not found"}}
)

@router.get("/")
def specialisations_index():
    return "Index of specialisations"

# 