from exceptions import AppBaseException


class DietPlanGenerationException(AppBaseException):
    def __init__(self, message: str = "Failed to generate diet plan"):
        super().__init__(message=message, status_code=502)


class InvalidDietProfileException(AppBaseException):
    def __init__(self, message: str = "Invalid diet profile provided"):
        super().__init__(message=message, status_code=422)


class IncompatibleGoalDietException(AppBaseException):
    def __init__(self, goal: str, diet_type: str):
        super().__init__(
            message=f"Goal '{goal}' may be incompatible with diet type '{diet_type}'",
            status_code=422,
        )


class MealPlanParsingException(AppBaseException):
    def __init__(self, message: str = "Failed to parse meal plan from LLM"):
        super().__init__(message=message, status_code=502)