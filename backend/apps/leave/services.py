from __future__ import annotations

from decimal import Decimal

from django.db import transaction

from apps.ess.models import Employee

from .models import LeaveRequest, LeaveType


@transaction.atomic
def create_leave_request(
    *,
    employee: Employee,
    leave_type: LeaveType,
    from_date,
    to_date,
    reason: str = "",
) -> LeaveRequest:
    days = Decimal((to_date - from_date).days + 1)
    return LeaveRequest.objects.create(
        employee=employee,
        type=leave_type,
        from_date=from_date,
        to_date=to_date,
        days=days,
        reason=reason,
    )


@transaction.atomic
def set_status(request_obj: LeaveRequest, *, status: str, approver: Employee | None = None) -> LeaveRequest:
    request_obj.status = status
    if approver is not None:
        request_obj.approver = approver
    request_obj.save(update_fields=["status", "approver", "updated_at"])
    return request_obj
