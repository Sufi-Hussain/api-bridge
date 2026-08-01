from __future__ import annotations

from typing import Any

from django.db import transaction

from .models import Employee


@transaction.atomic
def update_employee(employee: Employee, data: dict[str, Any]) -> Employee:
    for field, value in data.items():
        setattr(employee, field, value)
    employee.save()
    return employee
