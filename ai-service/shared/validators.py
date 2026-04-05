from exceptions import ValidationException
from constants import SUPPORTED_GOALS, SUPPORTED_ACTIVITY_LEVELS, SUPPORTED_DIET_TYPES


def validate_goal(goal: str) -> str:
    normalized = goal.strip().lower()
    if normalized not in SUPPORTED_GOALS:
        raise ValidationException(f"Invalid goal '{goal}'. Must be one of: {SUPPORTED_GOALS}")
    return normalized


def validate_activity_level(level: str) -> str:
    normalized = level.strip().lower()
    if normalized not in SUPPORTED_ACTIVITY_LEVELS:
        raise ValidationException(f"Invalid activity level '{level}'. Must be one of: {SUPPORTED_ACTIVITY_LEVELS}")
    return normalized


def validate_diet_type(diet_type: str) -> str:
    normalized = diet_type.strip().lower()
    if normalized not in SUPPORTED_DIET_TYPES:
        raise ValidationException(f"Invalid diet type '{diet_type}'. Must be one of: {SUPPORTED_DIET_TYPES}")
    return normalized


def validate_allergies(allergies: list[str]) -> list[str]:
    return [a.strip().lower() for a in allergies if a.strip()]


def validate_positive_float(value: float, field_name: str) -> float:
    if value <= 0:
        raise ValidationException(f"{field_name} must be a positive number")
    return value