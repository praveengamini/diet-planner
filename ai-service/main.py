from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from exceptions import register_exception_handlers
from planner.router import router as planner_router
from classifier.router import router as classifier_router
from alternatives.router import router as alternatives_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="AI Diet Planner",
        version="1.0.0",
        description="AI-powered diet planning microservice using Gemini",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    app.include_router(planner_router, prefix="/api/v1/planner", tags=["Diet Planner"])
    app.include_router(classifier_router, prefix="/api/v1/classifier", tags=["Health Classifier"])
    app.include_router(alternatives_router, prefix="/api/v1/alternatives", tags=["Food Alternatives"])

    return app


app = create_app()