from planner.constants import (
    MACRO_DISTRIBUTION,
    CALORIES_PER_GRAM,
    WATER_INTAKE_PER_KG_LITERS,
    MIN_WATER_LITERS,
    MAX_WATER_LITERS,
    MIN_DAILY_CALORIES,
    MAX_DAILY_CALORIES,
)
from shared.utils import round_float, clamp


def calculate_macro_grams(daily_calories: float, goal: str) -> dict[str, float]:
    distribution = MACRO_DISTRIBUTION.get(goal, MACRO_DISTRIBUTION["maintenance"])
    return {
        "protein_g": round_float((daily_calories * distribution["protein"]) / CALORIES_PER_GRAM["protein"]),
        "carbs_g": round_float((daily_calories * distribution["carbs"]) / CALORIES_PER_GRAM["carbs"]),
        "fats_g": round_float((daily_calories * distribution["fats"]) / CALORIES_PER_GRAM["fats"]),
    }


def calculate_water_intake(weight_kg: float) -> float:
    raw = weight_kg * WATER_INTAKE_PER_KG_LITERS
    return round_float(clamp(raw, MIN_WATER_LITERS, MAX_WATER_LITERS))


def clamp_daily_calories(calories: float) -> float:
    return round_float(clamp(calories, MIN_DAILY_CALORIES, MAX_DAILY_CALORIES))


def format_classification_summary(classification: dict) -> dict:
    return {
        "bmi": classification.get("bmi"),
        "bmi_category": classification.get("bmi_category"),
        "bmr": classification.get("bmr"),
        "tdee": classification.get("tdee"),
        "recommended_calories": classification.get("recommended_calories"),
        "health_status": classification.get("health_status"),
    }


def summarize_weekly_macros(weekly_plan: dict) -> dict[str, float]:
    totals = {"calories": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fats_g": 0.0}
    day_count = 0
    for day_data in weekly_plan.values():
        if not isinstance(day_data, dict):
            continue
        day_count += 1
        for meal_key in ("breakfast", "lunch", "dinner"):
            meal = day_data.get(meal_key, {})
            totals["calories"] += meal.get("calories", 0)
            totals["protein_g"] += meal.get("protein_g", 0)
            totals["carbs_g"] += meal.get("carbs_g", 0)
            totals["fats_g"] += meal.get("fats_g", 0)
        for snack in day_data.get("snacks", []):
            totals["calories"] += snack.get("calories", 0)

    if day_count == 0:
        return totals

    return {k: round_float(v / day_count) for k, v in totals.items()}