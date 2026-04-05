from functools import lru_cache
from langchain_google_genai import ChatGoogleGenerativeAI

from config import settings


@lru_cache()
def get_llm() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL_NAME,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=settings.GEMINI_TEMPERATURE,
        max_output_tokens=settings.GEMINI_MAX_OUTPUT_TOKENS,
        convert_system_message_to_human=True,

        response_mime_type="application/json"
    )