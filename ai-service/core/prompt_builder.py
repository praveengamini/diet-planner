from planner.schemas import DietPlanRequest
from alternatives.schemas import AlternativeRequest
from classifier.schemas import HealthProfileInput

def build_diet_plan_prompt(request: DietPlanRequest, classification: dict) -> str:
    return f"""
You are a clinical nutritionist.

STRICT RULES:
- Output ONLY valid JSON
- No explanation, no text outside JSON
- No markdown, no comments
- No missing commas
- No trailing commas
- Follow schema EXACTLY
- Fill ALL 7 days with SAME structure

USER:
Age: {request.profile.age}
Gender: {request.profile.gender}
Weight: {request.profile.weight_kg}
Height: {request.profile.height_cm}
Activity: {request.profile.activity_level}
Goal: {request.goal}
Diet: {request.diet_type}
Allergies: {', '.join(request.allergies) if request.allergies else 'None'}
Conditions: {', '.join(request.medical_conditions) if request.medical_conditions else 'None'}

CALCULATED:
Calories: {classification.get('recommended_calories')}
BMI: {classification.get('bmi')} ({classification.get('bmi_category')})

JSON FORMAT (STRICT):

{{
  "daily_calories_target": number,
  "daily_water_intake_liters": number,
  "nutritional_rationale": "string",
  "weekly_plan": {{
    "monday": DAY,
    "tuesday": DAY,
    "wednesday": DAY,
    "thursday": DAY,
    "friday": DAY,
    "saturday": DAY,
    "sunday": DAY
  }}
}}

DAY FORMAT:

{{
  "breakfast": {{
    "name": "string",
    "ingredients": ["string"],
    "portion_sizes": {{"item": "quantity"}},
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fats_g": number
  }},
  "lunch": SAME_AS_BREAKFAST,
  "dinner": SAME_AS_BREAKFAST,
  "snacks": [
    {{
      "name": "string",
      "calories": number
    }}
  ]
}}

RETURN ONLY JSON.
"""
def build_alternatives_prompt(request: AlternativeRequest) -> str:
    return f"""
You are a certified nutritionist. Suggest healthy food alternatives.

FOOD ITEM: {request.food_item}
REASON FOR ALTERNATIVE: {request.reason}
CALORIE TOLERANCE: ±{request.calorie_tolerance_percent}%
DIET TYPE: {request.diet_type or 'No restriction'}
ALLERGIES: {', '.join(request.allergies) if request.allergies else 'None'}

Provide exactly {request.num_alternatives} alternatives.

Respond ONLY with a valid JSON object:
{{
  "original_food": {{
    "name": "{request.food_item}",
    "estimated_calories_per_100g": <number>,
    "macros": {{"protein_g": 0, "carbs_g": 0, "fats_g": 0}}
  }},
  "alternatives": [
    {{
      "name": "",
      "calories_per_100g": 0,
      "macros": {{"protein_g": 0, "carbs_g": 0, "fats_g": 0}},
      "benefit": "",
      "similarity_score": 0.0
    }}
  ]
}}
""".strip()


def build_health_insight_prompt(profile: HealthProfileInput, classification: dict) -> str:
    return f"""
You are a health advisor. Provide concise health insights based on the user's profile.

PROFILE:
- Age: {profile.age}, Gender: {profile.gender}
- BMI: {classification.get('bmi')} ({classification.get('bmi_category')})
- TDEE: {classification.get('tdee')} kcal/day
- Goal: {profile.goal}

Respond ONLY with a valid JSON object:
{{
  "health_summary": "",
  "risk_factors": [],
  "recommendations": [],
  "priority_nutrients": []
}}
""".strip()