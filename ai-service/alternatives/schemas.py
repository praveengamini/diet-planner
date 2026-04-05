from pydantic import BaseModel, Field, field_validator
from constants import SUPPORTED_DIET_TYPES


class AlternativeRequest(BaseModel):
    food_item: str = Field(..., min_length=2, max_length=100)
    reason: str = Field(default="healthier option")
    calorie_tolerance_percent: float = Field(default=20.0, ge=5.0, le=50.0)
    diet_type: str | None = Field(default=None)
    allergies: list[str] = Field(default_factory=list)
    num_alternatives: int = Field(default=5, ge=1, le=10)

    @field_validator("diet_type")
    @classmethod
    def validate_diet_type(cls, v: str | None) -> str | None:
        if v is not None and v.lower() not in SUPPORTED_DIET_TYPES:
            raise ValueError(f"diet_type must be one of {SUPPORTED_DIET_TYPES}")
        return v.lower() if v else None


class FoodMacros(BaseModel):
    protein_g: float
    carbs_g: float
    fats_g: float


class OriginalFood(BaseModel):
    name: str
    estimated_calories_per_100g: float
    macros: FoodMacros


class AlternativeFood(BaseModel):
    name: str
    calories_per_100g: float
    macros: FoodMacros
    benefit: str
    similarity_score: float = Field(..., ge=0.0, le=1.0)


class AlternativesResponse(BaseModel):
    original_food: OriginalFood
    alternatives: list[AlternativeFood]