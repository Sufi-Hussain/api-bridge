from __future__ import annotations

from datetime import date, datetime, timedelta
from decimal import Decimal

from django.db import transaction
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.exceptions import APIException

from apps.ess.models import Employee

from .models import AttendancePunch


class AttendanceConflict(APIException):
    status_code = 409
    default_detail = "Invalid attendance transition."


@transaction.atomic
def clock_in(employee: Employee, location: str = "") -> AttendancePunch:
    """Create/complete today's punch. Rejects a second clock-in."""
    today = timezone.localdate()
    punch, _ = AttendancePunch.objects.get_or_create(
        employee=employee,
        date=today,
        defaults={"status": AttendancePunch.Status.PRESENT, "location": location},
    )
    if punch.clock_in:
        raise AttendanceConflict("You have already clocked in today.")
    punch.clock_in = timezone.localtime().time()
    punch.location = location or punch.location
    punch.status = AttendancePunch.Status.PRESENT
    punch.save(update_fields=["clock_in", "location", "status", "updated_at"])
    return punch


@transaction.atomic
def clock_out(employee: Employee) -> AttendancePunch:
    """Close today's punch. Rejects clock-out without clock-in / double clock-out."""
    today = timezone.localdate()
    punch = AttendancePunch.objects.filter(employee=employee, date=today).first()
    if punch is None or not punch.clock_in:
        raise AttendanceConflict("You must clock in before clocking out.")
    if punch.clock_out:
        raise AttendanceConflict("You have already clocked out today.")
    now = timezone.localtime().time()
    if now <= punch.clock_in:
        raise AttendanceConflict("Clock-out time must be after clock-in time.")
    punch.clock_out = now
    start = datetime.combine(date.today(), punch.clock_in)
    end = datetime.combine(date.today(), now)
    hours = max((end - start).total_seconds() / 3600.0 - punch.break_minutes / 60.0, 0)
    punch.worked_hours = Decimal(str(round(hours, 2)))
    punch.save(update_fields=["clock_out", "worked_hours", "updated_at"])
    return punch


def today_punch(employee: Employee) -> AttendancePunch | None:
    return AttendancePunch.objects.filter(employee=employee, date=timezone.localdate()).first()


def summary(employee: Employee, days: int = 30) -> dict:
    """Aggregate attendance for the trailing `days` window (ESS dashboard KPIs)."""
    days = max(1, min(int(days), 366))
    since = timezone.localdate() - timedelta(days=days - 1)
    qs = AttendancePunch.objects.filter(employee=employee, date__gte=since)
    agg = qs.aggregate(
        total_hours=Sum("worked_hours"),
        present=Count("id", filter=Q(status=AttendancePunch.Status.PRESENT)),
        wfh=Count("id", filter=Q(status=AttendancePunch.Status.WFH)),
        absent=Count("id", filter=Q(status=AttendancePunch.Status.ABSENT)),
        leave=Count("id", filter=Q(status=AttendancePunch.Status.LEAVE)),
        half_day=Count("id", filter=Q(status=AttendancePunch.Status.HALF_DAY)),
    )
    total_hours = agg["total_hours"] or Decimal("0")
    expected = Decimal("8") * (agg["present"] + agg["wfh"] or 0)
    late = qs.filter(clock_in__gt="09:30:00").count()
    early = qs.filter(clock_out__lt="17:00:00").exclude(clock_out=None).count()
    counted = (agg["present"] or 0) + (agg["wfh"] or 0) + (agg["half_day"] or 0)
    tracked = counted + (agg["absent"] or 0) + (agg["leave"] or 0)
    return {
        "days": days,
        "present": agg["present"] or 0,
        "wfh": agg["wfh"] or 0,
        "absent": agg["absent"] or 0,
        "leave": agg["leave"] or 0,
        "half_day": agg["half_day"] or 0,
        "late_arrivals": late,
        "early_departures": early,
        "total_hours": str(total_hours.quantize(Decimal("0.01"))),
        "avg_hours": str(
            (total_hours / counted).quantize(Decimal("0.01")) if counted else Decimal("0.00")
        ),
        "overtime_hours": str(
            max(total_hours - expected, Decimal("0")).quantize(Decimal("0.01"))
        ),
        "attendance_rate": round((counted / tracked) * 100, 1) if tracked else 0.0,
    }
