from typing import Any


def round_float(value: float, decimals: int = 2) -> float:
    return round(value, decimals)


def safe_get(data: dict, *keys: str, default: Any = None) -> Any:
    current = data
    for key in keys:
        if not isinstance(current, dict):
            return default
        current = current.get(key, default)
    return current


def normalize_string(value: str) -> str:
    return value.strip().lower()


def filter_none_values(data: dict) -> dict:
    return {k: v for k, v in data.items() if v is not None}


def clamp(value: float, min_val: float, max_val: float) -> float:
    return max(min_val, min(value, max_val))