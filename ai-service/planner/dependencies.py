from typing import Annotated

from fastapi import Depends
from langchain_google_genai import ChatGoogleGenerativeAI

from core.llm import get_llm
from config import settings, Settings


def get_planner_llm() -> ChatGoogleGenerativeAI:
    return get_llm()


def get_planner_settings() -> Settings:
    return settings


LLMDep = Annotated[ChatGoogleGenerativeAI, Depends(get_planner_llm)]
SettingsDep = Annotated[Settings, Depends(get_planner_settings)]