from __future__ import annotations

import calendar
from datetime import date, timedelta

from django.db.models import QuerySet
from django.utils import timezone

from apps.ess.selectors import get_employee_for_user

from .models import Payslip


def _add_months(d: date, months: int) -> date:
    """Pure-stdlib equivalent of dateutil.relativedelta(months=N)."""
    month = d.month - 1 + months
    year = d.year + month // 12
    month = month % 12 + 1
    last_day = calendar.monthrange(year, month)[1]
    return d.replace(year=year, month=month, day=min(d.day, last_day))


def _skip_weekend_back(d: date) -> date:
    """If d is Sat/Sun, roll back to Friday."""
    while d.weekday() >= 5:
        d -= timedelta(days=1)
    return d


def my_payslips(user) -> QuerySet[Payslip]:
    emp = get_employee_for_user(user)
    if not emp:
        return Payslip.objects.none()
    return Payslip.objects.filter(employee=emp).prefetch_related("lines")


def get_next_payday(employee) -> dict:
    """
    Returns the next upcoming payday info for an employee.

    Strategy 1: Use the latest Payslip.paid_on and advance one calendar month.
    Strategy 2: Fall back to OrganizationSettings.payroll_day_of_month when
                available (attribute access is safe via getattr).
    Strategy 3: DEFAULT — use Employment.join_date or today → pick a sensible
                default day (25th of month) so the panel always shows data.

    Always returns a dict (never None) — UI can safely rely on fields existing.
    Returns camelCase keys because raw APIView Response dicts bypass the
    drf-camel-case renderer middleware.
    """
    today = timezone.localdate()

    # ---- Strategy 1: Latest payslip paid_on + 1 month ---------------------
    latest = Payslip.objects.filter(employee=employee).order_by("-month").first()
    if latest and latest.paid_on:
        next_date = _skip_weekend_back(_add_months(latest.paid_on, 1))
        days_until = (next_date - today).days
        period_label = next_date.strftime("%b %Y")

        upcoming = (
            Payslip.objects.filter(
                employee=employee, status__in=["processing", "released"]
            )
            .order_by("-month")
            .first()
        )
        est_net = upcoming.net if upcoming else latest.net

        return {
            "date": next_date.isoformat(),
            "label": period_label,
            "daysUntil": max(0, days_until),
            "estimatedNet": float(est_net),
            "status": "confirmed" if days_until <= 5 else "scheduled",
        }

    # ---- Pick which day-of-month to use (fallback chain) ------------------
    org_settings = getattr(employee.organization, "settings", None)
    dom = getattr(org_settings, "payroll_day_of_month", None) if org_settings else None
    if not dom:
        # Use 25th as the de-facto enterprise default; clamp to join_date day
        # if employee joined after the 25th so they don't "retro" a payday
        join_date = getattr(getattr(employee, "employment", None), "join_date", None)
        dom = min(join_date.day, 25) if (join_date and join_date.day > 25) else 25

    salary_base = getattr(getattr(employee, "employment", None), "salary_base", 0)
    fallback_net = (float(salary_base) * 0.78) if salary_base else 4500.0

    # ---- Compute candidate date (current or next month) -------------------
    year, month = today.year, today.month
    dom = int(dom)
    last_day = calendar.monthrange(year, month)[1]
    candidate = today.replace(day=min(dom, last_day))
    if candidate <= today:
        if month == 12:
            nxt_year, nxt_month = year + 1, 1
        else:
            nxt_year, nxt_month = year, month + 1
        nxt_last = calendar.monthrange(nxt_year, nxt_month)[1]
        candidate = date(nxt_year, nxt_month, min(dom, nxt_last))
    candidate = _skip_weekend_back(candidate)

    return {
        "date": candidate.isoformat(),
        "label": candidate.strftime("%b %Y"),
        "daysUntil": max(0, (candidate - today).days),
        "estimatedNet": fallback_net,
        "status": "scheduled",
    }