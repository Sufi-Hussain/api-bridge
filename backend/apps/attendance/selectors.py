from __future__ import annotations

from django.db.models import QuerySet

from apps.ess.selectors import get_employee_for_user

from .models import AttendancePunch, TimesheetEntry


def my_punches(user) -> QuerySet[AttendancePunch]:
    emp = get_employee_for_user(user)
    if not emp:
        return AttendancePunch.objects.none()
    return AttendancePunch.objects.filter(employee=emp)


def my_timesheets(user) -> QuerySet[TimesheetEntry]:
    emp = get_employee_for_user(user)
    if not emp:
        return TimesheetEntry.objects.none()
    return TimesheetEntry.objects.filter(employee=emp)
