from classifier.constants import (
    BMI_CATEGORIES,
    ACTIVITY_MULTIPLIERS,
    GOAL_CALORIE_ADJUSTMENTS,
    BMR_MIFFLIN_MALE_OFFSET,
    BMR_MIFFLIN_FEMALE_OFFSET,
)
from classifier.exceptions import InvalidActivityLevelException, InvalidGenderException
from shared.utils import round_float


def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100.0
    return round_float(weight_kg / (height_m ** 2))


def classify_bmi(bmi: float) -> str:
    for low, high, category in BMI_CATEGORIES:
        if low <= bmi < high:
            return category
    return "obese_class_3"


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    base = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)
    if gender == "male":
        return round_float(base + BMR_MIFFLIN_MALE_OFFSET)
    elif gender == "female":
        return round_float(base + BMR_MIFFLIN_FEMALE_OFFSET)
    else:
        male_bmr = base + BMR_MIFFLIN_MALE_OFFSET
        female_bmr = base + BMR_MIFFLIN_FEMALE_OFFSET
        return round_float((male_bmr + female_bmr) / 2)


def calculate_tdee(bmr: float, activity_level: str) -> float:
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level)
    if multiplier is None:
        raise InvalidActivityLevelException(activity_level)
    return round_float(bmr * multiplier)


def calculate_recommended_calories(tdee: float, goal: str) -> float:
    adjustment = GOAL_CALORIE_ADJUSTMENTS.get(goal, 0.0)
    return round_float(max(1200.0, tdee + adjustment))


def generate_health_insights(bmi: float, bmi_category: str, goal: str, recommended_calories: float) -> list[str]:
    insights: list[str] = []

    if bmi_category == "underweight":
        insights.append("Prioritize caloric surplus with protein-rich foods.")
    elif bmi_category == "normal":
        insights.append("Maintain current weight with balanced macronutrient distribution.")
    elif bmi_category in ("overweight", "obese_class_1"):
        insights.append("Aim for a moderate caloric deficit of 300–500 kcal/day.")
    else:
        insights.append("Significant caloric deficit required; consult a physician.")

    if goal == "muscle_gain":
        insights.append("Ensure protein intake of at least 1.6g per kg of body weight.")
    elif goal == "weight_loss":
        insights.append("Combine caloric deficit with resistance training to preserve muscle mass.")

    insights.append(f"Your daily caloric target is approximately {recommended_calories} kcal.")
    return insights