from __future__ import annotations

from django.db.models import QuerySet

from apps.ess.selectors import get_employee_for_user

from .models import Payslip


def my_payslips(user) -> QuerySet[Payslip]:
    emp = get_employee_for_user(user)
    if not emp:
        return Payslip.objects.none()
    return Payslip.objects.filter(employee=emp).prefetch_related("lines")
