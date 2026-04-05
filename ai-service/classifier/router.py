from fastapi import APIRouter

from classifier.schemas import HealthProfileInput, HealthClassificationOutput
from classifier.service import classify_health

router = APIRouter()


@router.post("/classify", response_model=HealthClassificationOutput)
async def classify_health_endpoint(profile: HealthProfileInput) -> HealthClassificationOutput:
    return await classify_health(profile)