from __future__ import annotations

from django.db.models import QuerySet

from apps.ess.selectors import get_employee_for_user

from .models import Holiday, LeaveRequest


def my_leave_requests(user) -> QuerySet[LeaveRequest]:
    emp = get_employee_for_user(user)
    if not emp:
        return LeaveRequest.objects.none()
    return LeaveRequest.objects.filter(employee=emp).select_related("type", "approver")


def holidays() -> QuerySet[Holiday]:
    return Holiday.objects.all()
