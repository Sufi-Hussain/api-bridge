from __future__ import annotations

from django.db.models import Sum

from apps.attendance.models import AttendancePunch
from apps.ess.selectors import get_employee_for_user
from apps.leave.models import LeaveRequest
from apps.payroll.models import Payslip


def _employee(context):
    employee = get_employee_for_user(context.user)
    if not employee:
        return None
    organization_id = getattr(employee, "organization_id", None)
    if organization_id is not None and organization_id != context.organization.id:
        return None
    return employee


def current_employee(context, args):
    employee = _employee(context)
    if not employee:
        return {"status": "not_found"}
    return {"status": "ok", "employee": {"id": str(employee.id), "name": employee.user.get_full_name(), "email": employee.user.email}}


def leave_summary(context, args):
    employee = _employee(context)
    if not employee:
        return {"status": "not_found", "requests": []}
    rows = LeaveRequest.objects.filter(employee=employee).select_related("type").order_by("-from_date")[: args.get("limit", 20)]
    return {"status": "ok", "requests": [{"type": row.type.name, "from": row.from_date.isoformat(), "to": row.to_date.isoformat(), "days": str(row.days), "status": row.status} for row in rows]}


def attendance_summary(context, args):
    employee = _employee(context)
    if not employee:
        return {"status": "not_found", "summary": {}}
    rows = AttendancePunch.objects.filter(employee=employee)
    if args.get("from_date"):
        rows = rows.filter(date__gte=args["from_date"])
    if args.get("to_date"):
        rows = rows.filter(date__lte=args["to_date"])
    return {"status": "ok", "summary": {"days": rows.count(), "worked_hours": str(rows.aggregate(total=Sum("worked_hours"))["total"] or 0)}}


def payroll_summary(context, args):
    employee = _employee(context)
    if not employee:
        return {"status": "not_found", "payslips": []}
    rows = Payslip.objects.filter(employee=employee).order_by("-month")[: args.get("limit", 12)]
    return {"status": "ok", "payslips": [{"month": row.month, "gross": str(row.gross), "net": str(row.net), "status": row.status} for row in rows]}
