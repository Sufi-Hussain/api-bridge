from __future__ import annotations

from datetime import date, datetime, time

from django.db import transaction
from django.utils import timezone

from apps.ess.models import Employee

from .models import AttendancePunch


@transaction.atomic
def clock_in(employee: Employee, location: str = "") -> AttendancePunch:
    today = timezone.localdate()
    punch, _ = AttendancePunch.objects.get_or_create(
        employee=employee,
        date=today,
        defaults={"status": AttendancePunch.Status.PRESENT, "location": location},
    )
    if not punch.clock_in:
        punch.clock_in = timezone.localtime().time()
        punch.location = location or punch.location
        punch.save(update_fields=["clock_in", "location", "updated_at"])
    return punch


@transaction.atomic
def clock_out(employee: Employee) -> AttendancePunch | None:
    today = timezone.localdate()
    punch = AttendancePunch.objects.filter(employee=employee, date=today).first()
    if not punch or not punch.clock_in:
        return None
    now = timezone.localtime().time()
    punch.clock_out = now
    start = datetime.combine(date.today(), punch.clock_in)
    end = datetime.combine(date.today(), now)
    hours = max((end - start).total_seconds() / 3600.0 - punch.break_minutes / 60.0, 0)
    punch.worked_hours = round(hours, 2)
    punch.save(update_fields=["clock_out", "worked_hours", "updated_at"])
    return punch
