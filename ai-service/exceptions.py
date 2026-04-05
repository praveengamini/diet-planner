from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppBaseException(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class LLMException(AppBaseException):
    def __init__(self, message: str = "LLM processing failed"):
        super().__init__(message=message, status_code=502)


class ConfigurationException(AppBaseException):
    def __init__(self, message: str = "Service misconfigured"):
        super().__init__(message=message, status_code=500)


class ValidationException(AppBaseException):
    def __init__(self, message: str = "Validation failed"):
        super().__init__(message=message, status_code=422)


class ParsingException(AppBaseException):
    def __init__(self, message: str = "Failed to parse LLM response"):
        super().__init__(message=message, status_code=502)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppBaseException)
    async def app_exception_handler(request: Request, exc: AppBaseException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.__class__.__name__, "message": exc.message},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={"error": "InternalServerError", "message": "An unexpected error occurred"},
        )