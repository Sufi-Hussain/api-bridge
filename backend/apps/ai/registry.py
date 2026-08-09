from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from .schemas import ToolInputError, validate_input
from .tool_handlers import attendance_summary, current_employee, leave_summary, payroll_summary


@dataclass(frozen=True)
class RegisteredTool:
    name: str
    description: str
    permission: str
    allowed: set[str]
    handler: Callable


REGISTRY = {
    "current_employee": RegisteredTool("current_employee", "Get the authenticated employee profile.", "ai.employee.read", set(), current_employee),
    "leave_summary": RegisteredTool("leave_summary", "Get the authenticated employee's leave history.", "ai.leave.read", {"limit"}, leave_summary),
    "attendance_summary": RegisteredTool("attendance_summary", "Summarize the authenticated employee's attendance.", "ai.attendance.read", {"from_date", "to_date"}, attendance_summary),
    "payroll_summary": RegisteredTool("payroll_summary", "Get the authenticated employee's recent payslips.", "ai.payroll.read", {"limit"}, payroll_summary),
}


def allowed_tools(context):
    return [tool for tool in REGISTRY.values() if context.allows(tool.permission)]


def execute(context, name: str, arguments: dict) -> dict:
    tool = REGISTRY.get(name)
    if not tool:
        raise ToolInputError("Unknown AI tool.")
    if not context.allows(tool.permission):
        raise PermissionError("You do not have permission to use this tool.")
    return tool.handler(context, validate_input(arguments, tool.allowed))


def definitions(context):
    return [{"type": "function", "function": {"name": tool.name, "description": tool.description, "parameters": {"type": "object", "additionalProperties": False, "properties": {"limit": {"type": "integer", "minimum": 1, "maximum": 50}, "from_date": {"type": "string", "format": "date"}, "to_date": {"type": "string", "format": "date"}}}}} for tool in allowed_tools(context)]
