from __future__ import annotations

from datetime import date

from django.db import transaction
from django.db.models import QuerySet

from .models import Address, BankAccount, Employee, Employment


def _ensure_related_rows(emp: Employee) -> bool:
    """Create empty OneToOne rows if missing. Returns True if any were created.

    Why do this here instead of via Django signals? Because:
    (1) signals fire on INSERT only — existing employees from last migration
        will still have missing rows;
    (2) running it in the selector means "first profile GET creates blanks",
        which is exactly when a consumer actually needs them (not on Employee
        creation, when we may not know enough defaults yet).

    Callers of get_employee_for_user() will *never* see `emp.address is None`.
    """
    created_any = False

    if emp.address is None:
        Address.objects.get_or_create(
            employee=emp,
            defaults={
                "line1": "",
                "line2": "",
                "city": "",
                "state": "",
                "country": "",
                "postal": "",
            },
        )
        created_any = True

    if emp.bank is None:
        BankAccount.objects.get_or_create(
            employee=emp,
            defaults={
                "account_name": f"{emp.first_name} {emp.last_name}".strip(),
                "account_number": "",
                "ifsc": "",
                "bank": "",
                "branch": "",
                "type": BankAccount.AccountType.SAVINGS,
            },
        )
        created_any = True

    if emp.employment is None:      
        Employment.objects.get_or_create(
            employee=emp,
            defaults={
                "job_title": "",
                "department": "",
                "grade": "",
                "employment_type": Employment._meta.get_field("employment_type").get_default(),
                "location": "",
                "work_mode": Employment._meta.get_field("work_mode").get_default(),
                "join_date": date.today(),
                "status": Employment._meta.get_field("status").get_default(),
                "currency": "USD",
            },
        )
        created_any = True

    return created_any


@transaction.atomic
def get_employee_for_user(user) -> Employee | None:
    emp = (
        Employee.objects.select_related("address", "employment", "bank")
        .prefetch_related(
            "emergency_contacts", "family", "education", "experience", "skills__skill"
        )
        .filter(user=user)
        .first()
    )
    if emp is None:
        return None

    created_rows = _ensure_related_rows(emp)
    if created_rows:
        # The Django ORM caches select_related rows on the in-memory instance
        # we just got. Since we created rows in the DB above, we have to re-run
        # the query so `emp.address` actually resolves to the just-inserted row.
        return (
            Employee.objects.select_related("address", "employment", "bank")
            .prefetch_related(
                "emergency_contacts", "family", "education", "experience", "skills__skill"
            )
            .get(pk=emp.pk)
        )
    return emp


def all_employees() -> QuerySet[Employee]:
    return Employee.objects.select_related("employment").all()
