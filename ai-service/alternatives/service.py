from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from core.prompt_builder import build_alternatives_prompt
from core.parser import parse_alternatives_response
from alternatives.schemas import AlternativeRequest, AlternativesResponse
from alternatives.utils import (
    filter_by_calorie_tolerance,
    filter_by_allergies,
    sort_by_similarity,
    format_alternatives_list,
)
from alternatives.exceptions import (
    AlternativesGenerationException,
    AlternativesParsingException,
    NoAlternativesFoundException,
)
from exceptions import LLMException, ParsingException


def map_reason_to_goal(reason: str) -> str:
    reason = reason.lower()

    if "weight" in reason or "low" in reason or "health" in reason:
        return "weight_loss"
    if "gain" in reason or "muscle" in reason or "bulk" in reason:
        return "weight_gain"

    return "maintenance"


async def generate_alternatives(
    request: AlternativeRequest,
    llm: ChatGoogleGenerativeAI,
) -> AlternativesResponse:
    prompt = build_alternatives_prompt(request)

    raw_output = None
    for attempt in range(2):
        try:
            response = await llm.ainvoke([HumanMessage(content=prompt)])
            raw_output = response.content
            break
        except Exception as e:
            if attempt == 1:
                raise LLMException(f"Gemini API call failed: {str(e)}")

    try:
        parsed = parse_alternatives_response(raw_output)
    except ParsingException as e:
        raise AlternativesParsingException(str(e))

    original_food = parsed.get("original_food", {})
    raw_alternatives = parsed.get("alternatives", [])

    if not raw_alternatives:
        raise NoAlternativesFoundException(request.food_item)

    original_calories = original_food.get("estimated_calories_per_100g", 0)

    goal = map_reason_to_goal(request.reason)

    filtered = filter_by_calorie_tolerance(
        raw_alternatives,
        original_calories,
        request.calorie_tolerance_percent,
        goal,
    )

    filtered = filter_by_allergies(filtered, request.allergies)

    if not filtered:
        filtered = filter_by_allergies(raw_alternatives, request.allergies)

    filtered = sort_by_similarity(filtered)
    formatted = format_alternatives_list(filtered)

    if not formatted:
        raise NoAlternativesFoundException(request.food_item)

    original_macros = original_food.get("macros", {})

    return AlternativesResponse(
        original_food={
            "name": original_food.get("name", request.food_item),
            "estimated_calories_per_100g": original_calories,
            "macros": {
                "protein_g": original_macros.get("protein_g", 0),
                "carbs_g": original_macros.get("carbs_g", 0),
                "fats_g": original_macros.get("fats_g", 0),
            },
        },
        alternatives=formatted,
    )