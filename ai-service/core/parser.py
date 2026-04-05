import json
import re
from typing import Any

from exceptions import ParsingException


def _extract_json_block(raw: str) -> str:
    raw = re.sub(r"```json|```", "", raw)

    start = raw.find("{")
    end = raw.rfind("}")

    if start == -1 or end == -1:
        raise ParsingException("No JSON block found in LLM response")

    return raw[start:end + 1]


def _fix_common_json_issues(text: str) -> str:
    text = re.sub(r'}\s*{', '},{', text)

    text = re.sub(r",\s*}", "}", text)
    text = re.sub(r",\s*]", "]", text)

    text = text.replace("\n", " ")

    return text


def parse_llm_response(raw: str) -> dict[str, Any]:
    json_str = _extract_json_block(raw)

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        fixed = _fix_common_json_issues(json_str)

        try:
            return json.loads(fixed)
        except json.JSONDecodeError as e:
            print("\n❌ RAW LLM OUTPUT:\n", raw[:1000])
            print("\n❌ EXTRACTED JSON:\n", json_str[:1000])
            print("\n❌ FIXED JSON:\n", fixed[:1000])
            raise ParsingException(f"Invalid JSON in LLM response: {str(e)}")


def parse_diet_plan_response(raw: str) -> dict[str, Any]:
    data = parse_llm_response(raw)

    required_keys = {"daily_calories_target", "weekly_plan", "nutritional_rationale"}
    missing = required_keys - set(data.keys())

    if missing:
        raise ParsingException(f"Diet plan response missing required fields: {missing}")

    return data


def parse_alternatives_response(raw: str) -> dict[str, Any]:
    data = parse_llm_response(raw)

    required_keys = {"original_food", "alternatives"}
    missing = required_keys - set(data.keys())

    if missing:
        raise ParsingException(f"Alternatives response missing required fields: {missing}")

    return data


def parse_health_insight_response(raw: str) -> dict[str, Any]:
    data = parse_llm_response(raw)

    required_keys = {"health_summary", "recommendations"}
    missing = required_keys - set(data.keys())

    if missing:
        raise ParsingException(f"Health insight response missing required fields: {missing}")

    return data