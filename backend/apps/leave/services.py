"""Leave business services — reused by the API and by future AI tools.

All functions take an ``Employee`` derived from ``request.user``; none of them
trust an employee/organization id supplied by a client.
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal

from django.db import transaction
from django.db.models import Q, Sum
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.ess.models import Employee

from .models import Holiday, LeaveRequest, LeaveType


def leave_types() -> list[LeaveType]:
    return list(LeaveType.objects.all())


def my_leave_requests(employee: Employee):
    return LeaveRequest.objects.filter(employee=employee).select_related("type", "approver")


def leave_balances(employee: Employee) -> list[dict]:
    """Per-type balance: quota, consumed (approved) and pending days."""
    palette = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]
    rows: list[dict] = []
    agg = {
        (r["type_id"], r["status"]): r["total"]
        for r in LeaveRequest.objects.filter(employee=employee)
        .values("type_id", "status")
        .annotate(total=Sum("days"))
    }
    for index, lt in enumerate(LeaveType.objects.all().order_by("name")):
        used = agg.get((lt.id, LeaveRequest.Status.APPROVED), Decimal("0")) or Decimal("0")
        pending = agg.get((lt.id, LeaveRequest.Status.PENDING), Decimal("0")) or Decimal("0")
        rows.append(
            {
                "id": str(lt.id),
                "code": lt.code,
                "type": lt.name,
                "total": float(lt.annual_quota),
                "used": float(used),
                "pending": float(pending),
                "available": float(lt.annual_quota - used - pending),
                "color": palette[index % len(palette)],
            }
        )
    return rows


def holidays():
    return Holiday.objects.all()


def _working_days(from_date: date, to_date: date) -> Decimal:
    """Calendar span minus weekends and public holidays."""
    holiday_dates = set(
        Holiday.objects.filter(date__range=(from_date, to_date)).values_list("date", flat=True)
    )
    days = 0
    cursor = from_date
    while cursor <= to_date:
        if cursor.weekday() < 5 and cursor not in holiday_dates:
            days += 1
        cursor += __import__("datetime").timedelta(days=1)
    return Decimal(days)


@transaction.atomic
def apply_leave(
    *,
    employee: Employee,
    leave_type: LeaveType,
    from_date: date,
    to_date: date,
    reason: str = "",
    half_day: bool = False,
    attachment=None,
) -> LeaveRequest:
    if to_date < from_date:
        raise ValidationError({"to_date": "End date cannot be before start date."})

    days = _working_days(from_date, to_date)
    if half_day and days:
        days = Decimal("0.5")
    if days <= 0:
        raise ValidationError(
            {"from_date": "The selected range contains no working days."}
        )

    overlap = (
        LeaveRequest.objects.select_for_update()
        .filter(employee=employee, from_date__lte=to_date, to_date__gte=from_date)
        .exclude(status__in=[LeaveRequest.Status.REJECTED, LeaveRequest.Status.CANCELLED])
        .exists()
    )
    if overlap:
        raise ValidationError({"detail": "You already have leave applied for these dates."})

    balances = {b["code"]: b for b in leave_balances(employee)}
    available = Decimal(str(balances.get(leave_type.code, {}).get("available", 0)))
    if available < days:
        raise ValidationError(
            {"detail": f"Insufficient {leave_type.name} balance ({available} day(s) left)."}
        )

    manager = getattr(getattr(employee, "employment", None), "manager", None)
    return LeaveRequest.objects.create(
        employee=employee,
        type=leave_type,
        from_date=from_date,
        to_date=to_date,
        days=days,
        reason=reason,
        status=LeaveRequest.Status.PENDING,
        approver=manager,
        attachment=attachment,
    )


@transaction.atomic
def cancel_leave(*, employee: Employee, request_id) -> LeaveRequest:
    obj = (
        LeaveRequest.objects.select_for_update()
        .filter(id=request_id, employee=employee)
        .first()
    )
    if obj is None:
        raise ValidationError({"detail": "Leave request not found."})
    if obj.status in (LeaveRequest.Status.CANCELLED, LeaveRequest.Status.REJECTED):
        raise ValidationError({"detail": "This request can no longer be cancelled."})
    if obj.status == LeaveRequest.Status.APPROVED and obj.from_date <= date.today():
        raise ValidationError({"detail": "Approved leave already started cannot be cancelled."})
    obj.status = LeaveRequest.Status.CANCELLED
    obj.save(update_fields=["status", "updated_at"])
    return obj


@transaction.atomic
def decide_leave(*, approver: Employee, request_id, approve: bool) -> LeaveRequest:
    """Manager/HR decision. An employee can never decide their own request."""
    obj = LeaveRequest.objects.select_for_update().filter(id=request_id).first()
    if obj is None:
        raise ValidationError({"detail": "Leave request not found."})
    if obj.employee_id == approver.id:
        raise PermissionDenied("You cannot approve your own leave request.")
    if obj.employee.organization_id != approver.organization_id:
        raise PermissionDenied("Cross-organization access denied.")
    obj.status = LeaveRequest.Status.APPROVED if approve else LeaveRequest.Status.REJECTED
    obj.approver = approver
    obj.save(update_fields=["status", "approver", "updated_at"])
    return obj


# Backwards-compatible aliases used elsewhere in the codebase.
def create_leave_request(*, employee, leave_type, from_date, to_date, reason: str = ""):
    return apply_leave(
        employee=employee,
        leave_type=leave_type,
        from_date=from_date,
        to_date=to_date,
        reason=reason,
    )


@transaction.atomic
def set_status(request_obj: LeaveRequest, *, status: str, approver: Employee | None = None):
    request_obj.status = status
    if approver is not None:
        request_obj.approver = approver
    request_obj.save(update_fields=["status", "approver", "updated_at"])
    return request_obj
