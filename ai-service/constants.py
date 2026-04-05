GEMINI_DEFAULT_MODEL = "gemini-1.5-pro"
GEMINI_FLASH_MODEL = "gemini-1.5-flash"

MAX_TOKENS = 2048
DEFAULT_TEMPERATURE = 0.7

MIN_AGE = 10
MAX_AGE = 100
MIN_WEIGHT_KG = 20.0
MAX_WEIGHT_KG = 300.0
MIN_HEIGHT_CM = 100.0
MAX_HEIGHT_CM = 250.0

SUPPORTED_GOALS = ["weight_loss", "weight_gain", "maintenance", "muscle_gain"]
SUPPORTED_ACTIVITY_LEVELS = ["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"]
SUPPORTED_DIET_TYPES = ["omnivore", "vegetarian", "vegan", "keto", "paleo", "mediterranean"]
SUPPORTED_GENDERS = ["male", "female", "other"]

API_TIMEOUT_SECONDS = 30
LLM_RETRY_ATTEMPTS = 3