from pydantic import BaseModel, Field, field_validator
from constants import (
    MIN_AGE, MAX_AGE,
    MIN_WEIGHT_KG, MAX_WEIGHT_KG,
    MIN_HEIGHT_CM, MAX_HEIGHT_CM,
    SUPPORTED_GENDERS, SUPPORTED_ACTIVITY_LEVELS, SUPPORTED_GOALS,
)


class HealthProfileInput(BaseModel):
    age: int = Field(..., ge=MIN_AGE, le=MAX_AGE)
    gender: str = Field(...)
    weight_kg: float = Field(..., ge=MIN_WEIGHT_KG, le=MAX_WEIGHT_KG)
    height_cm: float = Field(..., ge=MIN_HEIGHT_CM, le=MAX_HEIGHT_CM)
    activity_level: str = Field(...)
    goal: str = Field(...)

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        if v.lower() not in SUPPORTED_GENDERS:
            raise ValueError(f"gender must be one of {SUPPORTED_GENDERS}")
        return v.lower()

    @field_validator("activity_level")
    @classmethod
    def validate_activity_level(cls, v: str) -> str:
        if v.lower() not in SUPPORTED_ACTIVITY_LEVELS:
            raise ValueError(f"activity_level must be one of {SUPPORTED_ACTIVITY_LEVELS}")
        return v.lower()

    @field_validator("goal")
    @classmethod
    def validate_goal(cls, v: str) -> str:
        if v.lower() not in SUPPORTED_GOALS:
            raise ValueError(f"goal must be one of {SUPPORTED_GOALS}")
        return v.lower()


class HealthClassificationOutput(BaseModel):
    bmi: float
    bmi_category: str
    bmr: float
    tdee: float
    recommended_calories: float
    health_status: str
    goal: str
    insights: list[str]