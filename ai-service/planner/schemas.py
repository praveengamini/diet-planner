from typing import Any
from pydantic import BaseModel, Field, field_validator
from constants import SUPPORTED_DIET_TYPES, SUPPORTED_GOALS
from shared.schemas import UserProfile


class DietPlanRequest(BaseModel):
    profile: UserProfile
    goal: str = Field(...)
    diet_type: str = Field(default="omnivore")
    allergies: list[str] = Field(default_factory=list)
    medical_conditions: list[str] = Field(default_factory=list)
    meals_per_day: int = Field(default=3, ge=2, le=6)

    @field_validator("goal")
    @classmethod
    def validate_goal(cls, v: str) -> str:
        if v.lower() not in SUPPORTED_GOALS:
            raise ValueError(f"goal must be one of {SUPPORTED_GOALS}")
        return v.lower()

    @field_validator("diet_type")
    @classmethod
    def validate_diet_type(cls, v: str) -> str:
        if v.lower() not in SUPPORTED_DIET_TYPES:
            raise ValueError(f"diet_type must be one of {SUPPORTED_DIET_TYPES}")
        return v.lower()


class MealDetail(BaseModel):
    name: str
    ingredients: list[str]
    portion_sizes: dict[str, str]
    calories: float
    protein_g: float
    carbs_g: float
    fats_g: float


class SnackDetail(BaseModel):
    name: str
    calories: float


class DayMeals(BaseModel):
    breakfast: MealDetail
    lunch: MealDetail
    dinner: MealDetail
    snacks: list[SnackDetail] = Field(default_factory=list)


class DietPlanResponse(BaseModel):
    daily_calories_target: float
    daily_water_intake_liters: float
    nutritional_rationale: str
    weekly_plan: dict[str, Any]
    classification_summary: dict[str, Any]