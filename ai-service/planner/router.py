from fastapi import APIRouter, Depends

from planner.schemas import DietPlanRequest, DietPlanResponse
from planner.service import generate_diet_plan
from planner.dependencies import LLMDep

router = APIRouter()


@router.post("/generate", response_model=DietPlanResponse)
async def generate_diet_plan_endpoint(
    request: DietPlanRequest,
    llm: LLMDep,
) -> DietPlanResponse:
    return await generate_diet_plan(request, llm)