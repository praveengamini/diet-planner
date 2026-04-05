from classifier.service import classify_health
from classifier.schemas import HealthProfileInput, HealthClassificationOutput


async def get_classification(profile: HealthProfileInput) -> HealthClassificationOutput:
    return await classify_health(profile)