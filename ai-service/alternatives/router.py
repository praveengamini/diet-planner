from fastapi import APIRouter

from alternatives.schemas import AlternativeRequest, AlternativesResponse
from alternatives.service import generate_alternatives
from alternatives.dependencies import LLMDep

router = APIRouter()


@router.post("/suggest", response_model=AlternativesResponse)
async def suggest_alternatives_endpoint(
    request: AlternativeRequest,
    llm: LLMDep,
) -> AlternativesResponse:
    return await generate_alternatives(request, llm)