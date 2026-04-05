from exceptions import AppBaseException


class ClassificationException(AppBaseException):
    def __init__(self, message: str = "Health classification failed"):
        super().__init__(message=message, status_code=422)


class InvalidActivityLevelException(ClassificationException):
    def __init__(self, level: str):
        super().__init__(message=f"Invalid activity level: '{level}'")


class InvalidGenderException(ClassificationException):
    def __init__(self, gender: str):
        super().__init__(message=f"Unsupported gender for BMR calculation: '{gender}'")


class BMICalculationException(ClassificationException):
    def __init__(self, message: str = "BMI calculation error"):
        super().__init__(message=message)