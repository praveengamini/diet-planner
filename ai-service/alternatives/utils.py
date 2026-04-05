from alternatives.schemas import AlternativeFood
from alternatives.constants import MIN_SIMILARITY_SCORE, MAX_SIMILARITY_SCORE
from shared.utils import round_float, clamp


def filter_by_calorie_tolerance(
    alternatives: list[dict],
    original_calories: float,
    tolerance_percent: float,
    goal: str = "maintenance",
) -> list[dict]:
    tolerance = original_calories * (tolerance_percent / 100.0)
    upper = original_calories + tolerance
    lower = original_calories - tolerance

    if goal == "weight_loss":
        return [
            alt for alt in alternatives
            if alt.get("calories_per_100g", 0) <= original_calories
        ]

    elif goal == "weight_gain":
        return [
            alt for alt in alternatives
            if alt.get("calories_per_100g", 0) >= lower
        ]

    return [
        alt for alt in alternatives
        if lower <= alt.get("calories_per_100g", 0) <= upper
    ]


def filter_by_allergies(alternatives: list[dict], allergies: list[str]) -> list[dict]:
    if not allergies:
        return alternatives
    normalized = {a.lower() for a in allergies}
    return [
        alt for alt in alternatives
        if not any(
            allergen in alt.get("name", "").lower()
            for allergen in normalized
        )
    ]


def sort_by_similarity(alternatives: list[dict]) -> list[dict]:
    return sorted(alternatives, key=lambda x: x.get("similarity_score", 0), reverse=True)


def clamp_similarity_score(score: float) -> float:
    return round_float(clamp(score, MIN_SIMILARITY_SCORE, MAX_SIMILARITY_SCORE))


def format_alternatives_list(raw_alternatives: list[dict]) -> list[dict]:
    formatted = []
    for alt in raw_alternatives:
        macros = alt.get("macros", {})
        formatted.append({
            "name": alt.get("name", ""),
            "calories_per_100g": round_float(alt.get("calories_per_100g", 0)),
            "macros": {
                "protein_g": round_float(macros.get("protein_g", 0)),
                "carbs_g": round_float(macros.get("carbs_g", 0)),
                "fats_g": round_float(macros.get("fats_g", 0)),
            },
            "benefit": alt.get("benefit", ""),
            "similarity_score": clamp_similarity_score(alt.get("similarity_score", 0.5)),
        })
    return formatted