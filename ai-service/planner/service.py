from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from classifier.service import classify_health
from core.prompt_builder import build_diet_plan_prompt
from core.parser import parse_diet_plan_response
from planner.schemas import DietPlanRequest, DietPlanResponse
from planner.utils import (
    calculate_water_intake,
    clamp_daily_calories,
    format_classification_summary,
)
from planner.exceptions import DietPlanGenerationException, MealPlanParsingException
from exceptions import LLMException, ParsingException


async def generate_diet_plan(
    request: DietPlanRequest,
    llm: ChatGoogleGenerativeAI,
) -> DietPlanResponse:
    classification = await classify_health(request.profile)
    classification_dict = classification.model_dump()

    prompt = build_diet_plan_prompt(request, classification_dict)

    try:
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        raw_output: str = response.content
    except Exception as e:
        raise LLMException(f"Gemini API call failed: {str(e)}")

    try:
        parsed = parse_diet_plan_response(raw_output)
    except ParsingException as e:
        raise MealPlanParsingException(str(e))

    daily_calories = clamp_daily_calories(
        parsed.get("daily_calories_target", classification_dict["recommended_calories"])
    )
    water_intake = calculate_water_intake(request.profile.weight_kg)
    classification_summary = format_classification_summary(classification_dict)

    return DietPlanResponse(
        daily_calories_target=daily_calories,
        daily_water_intake_liters=parsed.get("daily_water_intake_liters", water_intake),
        nutritional_rationale=parsed.get("nutritional_rationale", ""),
        weekly_plan=parsed.get("weekly_plan", {}),
        classification_summary=classification_summary,
    )