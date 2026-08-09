from dataclasses import dataclass


@dataclass(frozen=True)
class AITool:
    name: str
    permission: str
    write: bool = False


TOOLS = {
    "current_employee": AITool("current_employee", "ai.employee.read"),
    "leave_summary": AITool("leave_summary", "ai.leave.read"),
    "attendance_summary": AITool("attendance_summary", "ai.attendance.read"),
    "payroll_summary": AITool("payroll_summary", "ai.payroll.read"),
}


def authorize_tool(context, name: str) -> AITool:
    tool = TOOLS.get(name)
    if not tool:
        raise ValueError("Unknown AI tool")
    if tool.write:
        raise PermissionError("Write tools require explicit confirmation and are disabled")
    if not context.allows(tool.permission):
        raise PermissionError("You do not have permission to use this tool")
    return tool
