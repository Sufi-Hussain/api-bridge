from __future__ import annotations

from datetime import date


class ToolInputError(ValueError):
    pass


def validate_input(arguments: dict, allowed: set[str], limit: int = 50) -> dict:
    if not isinstance(arguments, dict):
        raise ToolInputError("Tool arguments must be an object.")
    unexpected = set(arguments) - allowed
    if unexpected:
        raise ToolInputError("Unexpected tool arguments.")
    result = dict(arguments)
    for key in ("limit",):
        if key in result:
            if not isinstance(result[key], int) or isinstance(result[key], bool) or not 1 <= result[key] <= limit:
                raise ToolInputError("Limit must be between 1 and 50.")
    for key in ("from_date", "to_date"):
        if key in result:
            try:
                result[key] = date.fromisoformat(result[key])
            except (TypeError, ValueError) as exc:
                raise ToolInputError("Dates must use YYYY-MM-DD format.") from exc
    if result.get("from_date") and result.get("to_date") and result["from_date"] > result["to_date"]:
        raise ToolInputError("The date range is invalid.")
    return result
