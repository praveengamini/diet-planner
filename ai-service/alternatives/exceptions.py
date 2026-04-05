from exceptions import AppBaseException


class AlternativesGenerationException(AppBaseException):
    def __init__(self, message: str = "Failed to generate food alternatives"):
        super().__init__(message=message, status_code=502)


class InvalidFoodItemException(AppBaseException):
    def __init__(self, food_item: str):
        super().__init__(
            message=f"Food item '{food_item}' is invalid or unrecognized",
            status_code=422,
        )


class AlternativesParsingException(AppBaseException):
    def __init__(self, message: str = "Failed to parse alternatives from LLM"):
        super().__init__(message=message, status_code=502)


class NoAlternativesFoundException(AppBaseException):
    def __init__(self, food_item: str):
        super().__init__(
            message=f"No valid alternatives found for '{food_item}'",
            status_code=404,
        )