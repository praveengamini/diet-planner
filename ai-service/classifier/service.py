from classifier.schemas import HealthProfileInput, HealthClassificationOutput
from classifier.constants import HEALTH_STATUS_MESSAGES
from classifier.utils import (
    calculate_bmi,
    classify_bmi,
    calculate_bmr,
    calculate_tdee,
    calculate_recommended_calories,
    generate_health_insights,
)


async def classify_health(profile: HealthProfileInput) -> HealthClassificationOutput:
    bmi = calculate_bmi(profile.weight_kg, profile.height_cm)
    bmi_category = classify_bmi(bmi)
    bmr = calculate_bmr(profile.weight_kg, profile.height_cm, profile.age, profile.gender)
    tdee = calculate_tdee(bmr, profile.activity_level)
    recommended_calories = calculate_recommended_calories(tdee, profile.goal)
    insights = generate_health_insights(bmi, bmi_category, profile.goal, recommended_calories)
    health_status = HEALTH_STATUS_MESSAGES.get(bmi_category, "Health status undetermined.")

    return HealthClassificationOutput(
        bmi=bmi,
        bmi_category=bmi_category,
        bmr=bmr,
        tdee=tdee,
        recommended_calories=recommended_calories,
        health_status=health_status,
        goal=profile.goal,
        insights=insights,
    )