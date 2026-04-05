MEAL_TIMINGS: dict[str, str] = {
    "breakfast": "7:00 AM - 9:00 AM",
    "lunch": "12:00 PM - 2:00 PM",
    "dinner": "6:00 PM - 8:00 PM",
    "snack_1": "10:30 AM",
    "snack_2": "4:00 PM",
}

MACRO_DISTRIBUTION: dict[str, dict[str, float]] = {
    "weight_loss": {"protein": 0.35, "carbs": 0.35, "fats": 0.30},
    "weight_gain": {"protein": 0.30, "carbs": 0.45, "fats": 0.25},
    "muscle_gain": {"protein": 0.40, "carbs": 0.40, "fats": 0.20},
    "maintenance": {"protein": 0.30, "carbs": 0.40, "fats": 0.30},
}

CALORIES_PER_GRAM: dict[str, float] = {
    "protein": 4.0,
    "carbs": 4.0,
    "fats": 9.0,
}

MIN_DAILY_CALORIES = 1200.0
MAX_DAILY_CALORIES = 5000.0

WATER_INTAKE_PER_KG_LITERS = 0.033
MIN_WATER_LITERS = 1.5
MAX_WATER_LITERS = 4.0

DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]