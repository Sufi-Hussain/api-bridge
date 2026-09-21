from __future__ import annotations

from typing import Any

from django.db import transaction

from .models import Address, BankAccount, Employee


@transaction.atomic
def update_employee(employee: Employee, data: dict[str, Any]) -> Employee:
    for field, value in data.items():
        setattr(employee, field, value)
    employee.save()
    return employee


@transaction.atomic
def update_address(employee: Employee, data: dict[str, Any]) -> Address:
    """Create-or-update (UPSERT) the employee's home address.

    Uses `update_or_create` instead of naive `setattr + save` because the
    reverse side of a Django OneToOne relationship raises DoesNotExist when
    the row has never been created yet (instead of returning None like a
    nullable FK). This is the canonical Django pattern for OneToOne writes.
    """
    addr, _created = Address.objects.update_or_create(
        employee=employee,
        defaults=data,
    )
    return addr


@transaction.atomic
def update_bank(employee: Employee, data: dict[str, Any]) -> BankAccount:
    """Same UPSERT pattern as update_address, but for BankAccount.

    Kept in ESS services (not Payroll) because an employee edits their own
    bank details in the Self-Service profile even though payroll is the
    consumer of the data. Payroll app can read but not write.
    """
    bank, _created = BankAccount.objects.update_or_create(
        employee=employee,
        defaults=data,
    )
    return bank
