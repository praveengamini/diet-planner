BMI_CATEGORIES: list[tuple[float, float, str]] = [
    (0.0, 18.5, "underweight"),
    (18.5, 25.0, "normal"),
    (25.0, 30.0, "overweight"),
    (30.0, 35.0, "obese_class_1"),
    (35.0, 40.0, "obese_class_2"),
    (40.0, float("inf"), "obese_class_3"),
]

ACTIVITY_MULTIPLIERS: dict[str, float] = {
    "sedentary": 1.2,
    "lightly_active": 1.375,
    "moderately_active": 1.55,
    "very_active": 1.725,
    "extra_active": 1.9,
}

GOAL_CALORIE_ADJUSTMENTS: dict[str, float] = {
    "weight_loss": -500.0,
    "weight_gain": 500.0,
    "muscle_gain": 300.0,
    "maintenance": 0.0,
}

BMR_MIFFLIN_MALE_OFFSET = 5.0
BMR_MIFFLIN_FEMALE_OFFSET = -161.0

HEALTH_STATUS_MESSAGES: dict[str, str] = {
    "underweight": "You are underweight. Focus on nutrient-dense foods to gain healthy weight.",
    "normal": "You have a healthy BMI. Maintain your lifestyle with balanced nutrition.",
    "overweight": "You are overweight. A moderate caloric deficit with exercise is recommended.",
    "obese_class_1": "Class 1 obesity detected. Consult a physician alongside dietary changes.",
    "obese_class_2": "Class 2 obesity detected. Medical supervision is strongly recommended.",
    "obese_class_3": "Class 3 obesity detected. Immediate medical consultation is advised.",
}