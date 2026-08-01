from __future__ import annotations

from django.db.models import QuerySet

from .models import Employee


def get_employee_for_user(user) -> Employee | None:
    return (
        Employee.objects.select_related("address", "employment", "bank")
        .prefetch_related(
            "emergency_contacts", "family", "education", "experience", "skills__skill"
        )
        .filter(user=user)
        .first()
    )


def all_employees() -> QuerySet[Employee]:
    return Employee.objects.select_related("employment").all()
