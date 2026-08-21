"""
TimesheetService — the single source of truth for timesheet business logic.

Views, management commands and (later) AI tools must call these functions
instead of re-implementing rules. Everything here is organization-scoped: the
caller passes the resolved tenant, never a raw request.
"""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal
from typing import Any, Iterable

from django.db import transaction
from django.db.models import Count, DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.ess.models import Employee
from audit.services import log_event

from .models import (
    Project,
    ProjectTask,
    Timesheet,
    TimesheetComment,
    TimesheetLine,
    TimesheetPeriod,
)

ZERO = Decimal("0")
STANDARD_DAY = Decimal("8")


# --------------------------------------------------------------------------- #
# Periods
# --------------------------------------------------------------------------- #
def get_or_create_period(org, day: date, kind: str = TimesheetPeriod.Kind.WEEKLY) -> TimesheetPeriod:
    if kind == TimesheetPeriod.Kind.MONTHLY:
        start, end = TimesheetPeriod.month_bounds(day)
    else:
        start, end = TimesheetPeriod.week_bounds(day)
    period, _ = TimesheetPeriod.objects.get_or_create(
        organization=org,
        kind=kind,
        start_date=start,
        defaults={"end_date": end, "due_date": end + timedelta(days=2)},
    )
    return period


def working_days(start: date, end: date, holidays: set[date]) -> list[date]:
    days, cursor = [], start
    while cursor <= end:
        if cursor.weekday() < 5 and cursor not in holidays:
            days.append(cursor)
        cursor += timedelta(days=1)
    return days


def _holiday_dates(org, start: date, end: date) -> set[date]:
    from apps.leave.models import Holiday

    qs = Holiday.objects.filter(date__range=(start, end))
    if hasattr(Holiday, "organization"):
        qs = qs.filter(Q(organization=org) | Q(organization__isnull=True))
    return set(qs.values_list("date", flat=True))


def _leave_dates(employee: Employee, start: date, end: date) -> set[date]:
    from apps.leave.models import LeaveRequest

    approved = LeaveRequest.objects.filter(
        employee=employee, status="approved", from_date__lte=end, to_date__gte=start
    ).values_list("from_date", "to_date")
    out: set[date] = set()
    for f, t in approved:
        cursor = max(f, start)
        while cursor <= min(t, end):
            out.add(cursor)
            cursor += timedelta(days=1)
    return out


# --------------------------------------------------------------------------- #
# Timesheet lifecycle
# --------------------------------------------------------------------------- #
@transaction.atomic
def ensure_timesheet(org, employee: Employee, day: date, kind: str = TimesheetPeriod.Kind.WEEKLY) -> Timesheet:
    """Idempotently materialise the employee's timesheet for the period of `day`.

    Leave and holiday rows are auto-seeded and locked so the employee cannot
    double-book time that HR already accounted for.
    """
    period = get_or_create_period(org, day, kind)
    sheet, created = Timesheet.objects.get_or_create(
        organization=org, period=period, employee=employee
    )
    holidays = _holiday_dates(org, period.start_date, period.end_date)
    leaves = _leave_dates(employee, period.start_date, period.end_date)

    existing = {
        (line.date, line.work_type)
        for line in sheet.lines.filter(work_type__in=["leave", "holiday"])
    }
    system_lines = []
    for day_ in holidays:
        if (day_, "holiday") not in existing:
            system_lines.append(TimesheetLine(
                timesheet=sheet, date=day_, work_type=TimesheetLine.WorkType.HOLIDAY,
                hours=ZERO, billable=False, locked=True, notes="Public holiday",
            ))
    for day_ in leaves:
        if day_.weekday() < 5 and day_ not in holidays and (day_, "leave") not in existing:
            system_lines.append(TimesheetLine(
                timesheet=sheet, date=day_, work_type=TimesheetLine.WorkType.LEAVE,
                hours=STANDARD_DAY, billable=False, locked=True, notes="Approved leave",
            ))
    if system_lines:
        TimesheetLine.objects.bulk_create(system_lines)

    sheet.expected_hours = STANDARD_DAY * len(
        working_days(period.start_date, period.end_date, holidays)
    )
    recalculate(sheet)
    return sheet


@transaction.atomic
def recalculate(sheet: Timesheet) -> Timesheet:
    lines = list(sheet.lines.all())
    total = sum((line.hours for line in lines), ZERO)
    billable = sum((line.hours for line in lines if line.billable and line.work_type == "project"), ZERO)
    internal = sum((line.hours for line in lines if line.work_type == "internal"), ZERO)
    leave = sum((line.hours for line in lines if line.work_type == "leave"), ZERO)
    holiday = sum((line.hours for line in lines if line.work_type == "holiday"), ZERO)
    non_billable = total - billable - leave - holiday

    per_day: dict[date, Decimal] = {}
    for line in lines:
        if line.work_type in ("project", "internal"):
            per_day[line.date] = per_day.get(line.date, ZERO) + line.hours
    overtime = sum((max(v - STANDARD_DAY, ZERO) for v in per_day.values()), ZERO)

    sheet.total_hours = total
    sheet.billable_hours = billable
    sheet.non_billable_hours = max(non_billable, ZERO)
    sheet.internal_hours = internal
    sheet.leave_hours = leave
    sheet.holiday_hours = holiday
    sheet.overtime_hours = overtime
    sheet.save(update_fields=[
        "total_hours", "billable_hours", "non_billable_hours", "internal_hours",
        "leave_hours", "holiday_hours", "overtime_hours", "expected_hours", "updated_at",
    ])
    return sheet


def assert_editable(sheet: Timesheet) -> None:
    if sheet.status not in Timesheet.OPEN_STATES:
        raise ValidationError({"detail": f"Timesheet is {sheet.get_status_display().lower()} and cannot be edited."})
    if not sheet.period.is_editable:
        raise ValidationError({"detail": "This timesheet period is closed."})


@transaction.atomic
def save_lines(sheet: Timesheet, rows: Iterable[dict[str, Any]], *, actor=None) -> Timesheet:
    """Replace the editable (non system-generated) lines of a timesheet.

    Each row: {id?, date, projectId?, taskId?, workType, hours, billable, notes}
    A row with hours <= 0 is dropped, which is how the UI deletes a cell.
    """
    assert_editable(sheet)
    org = sheet.organization
    projects = {str(p.id): p for p in Project.objects.filter(organization=org)}
    tasks = {str(t.id): t for t in ProjectTask.objects.filter(organization=org)}

    keep_ids: list[str] = []
    for row in rows:
        raw_date = row.get("date")
        try:
            day = raw_date if isinstance(raw_date, date) else date.fromisoformat(str(raw_date))
        except ValueError as exc:
            raise ValidationError({"date": f"Invalid date {raw_date!r}."}) from exc
        if not (sheet.period.start_date <= day <= sheet.period.end_date):
            raise ValidationError({"date": f"{day} falls outside this timesheet period."})

        hours = Decimal(str(row.get("hours") or 0))
        if hours < 0 or hours > 24:
            raise ValidationError({"hours": "Hours must be between 0 and 24."})

        work_type = row.get("workType") or row.get("work_type") or TimesheetLine.WorkType.PROJECT
        if work_type in ("leave", "holiday"):
            continue  # system-managed

        project = projects.get(str(row.get("projectId") or row.get("project") or ""))
        task = tasks.get(str(row.get("taskId") or row.get("task") or ""))
        if work_type == TimesheetLine.WorkType.PROJECT and project is None:
            raise ValidationError({"project": "A project is required for project work."})
        if task is not None and project is not None and task.project_id != project.id:
            raise ValidationError({"task": "Task does not belong to the selected project."})

        billable = bool(row.get("billable", project.billable if project else False))
        if project is not None and not project.billable:
            billable = False

        line_id = row.get("id")
        line = sheet.lines.filter(id=line_id, locked=False).first() if line_id else None
        if hours <= 0:
            if line:
                line.delete()
            continue
        if line is None:
            line = TimesheetLine(timesheet=sheet)
        line.date = day
        line.project = project
        line.task = task
        line.work_type = work_type
        line.hours = hours
        line.billable = billable
        line.notes = (row.get("notes") or "")[:255]
        line.save()
        keep_ids.append(str(line.id))

    # Any editable line not present in the payload was removed by the user.
    sheet.lines.filter(locked=False).exclude(id__in=keep_ids).delete()

    # Daily total guard.
    for day, total in _daily_totals(sheet).items():
        if total > Decimal("24"):
            raise ValidationError({"hours": f"{day} exceeds 24 hours."})

    recalculate(sheet)
    log_event(actor=actor, action="timesheet.save", target=sheet, organization=org,
              metadata={"lines": len(keep_ids), "hours": str(sheet.total_hours)})
    return sheet


def _daily_totals(sheet: Timesheet) -> dict[date, Decimal]:
    out: dict[date, Decimal] = {}
    for line in sheet.lines.all():
        out[line.date] = out.get(line.date, ZERO) + line.hours
    return out


@transaction.atomic
def submit(sheet: Timesheet, *, actor=None, comment: str = "") -> Timesheet:
    assert_editable(sheet)
    if sheet.total_hours <= 0:
        raise ValidationError({"detail": "Add at least one time entry before submitting."})
    missing = [
        str(day) for day in working_days(
            sheet.period.start_date, sheet.period.end_date,
            _holiday_dates(sheet.organization, sheet.period.start_date, sheet.period.end_date),
        )
        if _daily_totals(sheet).get(day, ZERO) <= 0
    ]
    sheet.status = Timesheet.Status.SUBMITTED
    sheet.submitted_at = timezone.now()
    sheet.decided_at = None
    sheet.save(update_fields=["status", "submitted_at", "decided_at", "updated_at"])
    _event(sheet, actor, comment or "Submitted for approval.")
    log_event(actor=actor, action="timesheet.submit", target=sheet,
              organization=sheet.organization, metadata={"missing_days": missing})
    _notify_manager(sheet)
    return sheet


@transaction.atomic
def decide(sheet: Timesheet, *, decision: str, approver: Employee, actor=None, comment: str = "") -> Timesheet:
    """Manager action: approve | reject | return."""
    mapping = {
        "approve": Timesheet.Status.APPROVED,
        "reject": Timesheet.Status.REJECTED,
        "return": Timesheet.Status.RETURNED,
    }
    if decision not in mapping:
        raise ValidationError({"decision": "Must be approve, reject or return."})
    if sheet.status != Timesheet.Status.SUBMITTED:
        raise ValidationError({"detail": "Only submitted timesheets can be actioned."})
    if decision in ("reject", "return") and not comment.strip():
        raise ValidationError({"comment": "A comment is required when rejecting or returning."})

    sheet.status = mapping[decision]
    sheet.approver = approver
    sheet.decided_at = timezone.now()
    sheet.save(update_fields=["status", "approver", "decided_at", "updated_at"])
    _event(sheet, actor, comment or f"Timesheet {sheet.get_status_display().lower()}.")
    log_event(actor=actor, action=f"timesheet.{decision}", target=sheet,
              organization=sheet.organization, metadata={"comment": comment})
    _notify_owner(sheet, decision)
    return sheet


def add_comment(sheet: Timesheet, *, author, body: str) -> TimesheetComment:
    if not body.strip():
        raise ValidationError({"body": "Comment cannot be empty."})
    return TimesheetComment.objects.create(
        timesheet=sheet, author=author, body=body.strip(), kind=TimesheetComment.Kind.COMMENT
    )


def _event(sheet: Timesheet, actor, body: str) -> None:
    TimesheetComment.objects.create(
        timesheet=sheet, author=getattr(actor, "pk", None) and actor or None,
        kind=TimesheetComment.Kind.EVENT, body=body,
    )


def _notify_manager(sheet: Timesheet) -> None:
    manager = getattr(getattr(sheet.employee, "employment", None), "manager", None)
    user = getattr(manager, "user", None)
    if user is None:
        return
    from apps.notifications.models import Notification

    Notification.objects.create(
        user=user, category="team", title="Timesheet awaiting approval",
        description=f"{sheet.employee.first_name} {sheet.employee.last_name} submitted "
                    f"{sheet.total_hours}h for {sheet.period.start_date}–{sheet.period.end_date}.",
        href="/pay/timesheets/approvals",
    )


def _notify_owner(sheet: Timesheet, decision: str) -> None:
    user = getattr(sheet.employee, "user", None)
    if user is None:
        return
    from apps.notifications.models import Notification

    Notification.objects.create(
        user=user, category="team", title=f"Timesheet {decision}d",
        description=f"Your timesheet for {sheet.period.start_date}–{sheet.period.end_date} "
                    f"was {sheet.get_status_display().lower()}.",
        href="/attendance/timesheets",
    )


# --------------------------------------------------------------------------- #
# Reporting: analytics, utilization, compliance, reminders
# --------------------------------------------------------------------------- #
def _dec(field: str):
    return Coalesce(Sum(field), Value(ZERO), output_field=DecimalField(max_digits=12, decimal_places=2))


def analytics(org, *, start: date, end: date, employee: Employee | None = None) -> dict:
    qs = Timesheet.objects.filter(
        organization=org, period__start_date__gte=start, period__end_date__lte=end
    )
    if employee is not None:
        qs = qs.filter(employee=employee)
    agg = qs.aggregate(
        total=_dec("total_hours"), billable=_dec("billable_hours"),
        nonBillable=_dec("non_billable_hours"), internal=_dec("internal_hours"),
        leave=_dec("leave_hours"), overtime=_dec("overtime_hours"),
        expected=_dec("expected_hours"),
    )
    total = agg["total"] or ZERO
    by_status = {row["status"]: row["n"] for row in qs.values("status").annotate(n=Count("id"))}
    by_project = [
        {
            "projectId": str(row["project__id"]) if row["project__id"] else None,
            "project": row["project__name"] or "Internal",
            "hours": str(row["hours"] or ZERO),
            "billableHours": str(row["billable"] or ZERO),
        }
        for row in TimesheetLine.objects.filter(timesheet__in=qs)
        .values("project__id", "project__name")
        .annotate(hours=Sum("hours"), billable=Sum("hours", filter=Q(billable=True)))
        .order_by("-hours")[:12]
    ]
    return {
        "start": str(start), "end": str(end),
        "totalHours": str(total), "billableHours": str(agg["billable"]),
        "nonBillableHours": str(agg["nonBillable"]), "internalHours": str(agg["internal"]),
        "leaveHours": str(agg["leave"]), "overtimeHours": str(agg["overtime"]),
        "expectedHours": str(agg["expected"]),
        "utilization": float(round((agg["billable"] / total * 100), 1)) if total else 0.0,
        "compliance": float(round((total / agg["expected"] * 100), 1)) if agg["expected"] else 0.0,
        "byStatus": by_status,
        "byProject": by_project,
        "timesheets": qs.count(),
    }


def utilization_by_employee(org, *, start: date, end: date, employees=None) -> list[dict]:
    qs = Timesheet.objects.filter(
        organization=org, period__start_date__gte=start, period__end_date__lte=end
    ).select_related("employee")
    if employees is not None:
        qs = qs.filter(employee__in=employees)
    buckets: dict[str, dict] = {}
    for sheet in qs:
        key = str(sheet.employee_id)
        row = buckets.setdefault(key, {
            "employeeId": key,
            "employee": f"{sheet.employee.first_name} {sheet.employee.last_name}",
            "totalHours": ZERO, "billableHours": ZERO, "expectedHours": ZERO,
            "submitted": 0, "approved": 0, "pending": 0,
        })
        row["totalHours"] += sheet.total_hours
        row["billableHours"] += sheet.billable_hours
        row["expectedHours"] += sheet.expected_hours
        if sheet.status == Timesheet.Status.APPROVED:
            row["approved"] += 1
        elif sheet.status == Timesheet.Status.SUBMITTED:
            row["pending"] += 1
        if sheet.status != Timesheet.Status.DRAFT:
            row["submitted"] += 1
    out = []
    for row in buckets.values():
        total, expected = row["totalHours"], row["expectedHours"]
        out.append({
            **row,
            "totalHours": str(total), "billableHours": str(row["billableHours"]),
            "expectedHours": str(expected),
            "utilization": float(round(row["billableHours"] / total * 100, 1)) if total else 0.0,
            "compliance": float(round(total / expected * 100, 1)) if expected else 0.0,
        })
    return sorted(out, key=lambda r: r["employee"])


def compliance(org, *, day: date | None = None, employees=None) -> dict:
    """Who has not submitted the current (or given) weekly period."""
    day = day or timezone.localdate()
    period = get_or_create_period(org, day)
    pool = Employee.objects.filter(organization=org)
    if employees is not None:
        pool = pool.filter(id__in=[e.id for e in employees])
    sheets = {
        str(s.employee_id): s for s in Timesheet.objects.filter(period=period, employee__in=pool)
    }
    missing, pending, approved = [], [], 0
    for emp in pool.select_related("employment"):
        sheet = sheets.get(str(emp.id))
        entry = {
            "employeeId": str(emp.id),
            "employee": f"{emp.first_name} {emp.last_name}",
            "status": sheet.status if sheet else "missing",
            "hours": str(sheet.total_hours) if sheet else "0",
        }
        if sheet is None or sheet.status in Timesheet.OPEN_STATES:
            missing.append(entry)
        elif sheet.status == Timesheet.Status.SUBMITTED:
            pending.append(entry)
        else:
            approved += 1
    headcount = pool.count()
    return {
        "periodStart": str(period.start_date), "periodEnd": str(period.end_date),
        "dueDate": str(period.due_date) if period.due_date else None,
        "headcount": headcount, "approved": approved,
        "pendingApproval": pending, "notSubmitted": missing,
        "complianceRate": float(round((headcount - len(missing)) / headcount * 100, 1)) if headcount else 0.0,
    }


def send_reminders(org, *, day: date | None = None) -> int:
    """Notify everyone who has not submitted the period. Safe to run daily."""
    from apps.notifications.models import Notification

    data = compliance(org, day=day)
    sent = 0
    for row in data["notSubmitted"]:
        emp = Employee.objects.filter(id=row["employeeId"]).select_related("user").first()
        if emp is None or emp.user_id is None:
            continue
        Notification.objects.create(
            user=emp.user, category="system", title="Timesheet reminder",
            description=f"Your timesheet for {data['periodStart']}–{data['periodEnd']} is not submitted.",
            href="/attendance/timesheets",
        )
        sent += 1
    return sent


# --------------------------------------------------------------------------- #
# Access control helpers (used by permissions + views)
# --------------------------------------------------------------------------- #
def team_of(manager: Employee):
    return Employee.objects.filter(employment__manager=manager)


def can_view(sheet: Timesheet, user) -> bool:
    role = getattr(user, "role", "employee")
    if user.is_superuser or role in ("hr", "admin", "super_admin", "payroll", "finance"):
        return True
    emp = getattr(user, "employee", None)
    if emp is None:
        return False
    if sheet.employee_id == emp.id:
        return True
    return team_of(emp).filter(id=sheet.employee_id).exists()


def assert_can_approve(sheet: Timesheet, user) -> Employee:
    emp = getattr(user, "employee", None)
    role = getattr(user, "role", "employee")
    if emp is None and not user.is_superuser:
        raise PermissionDenied("No employee profile.")
    if sheet.employee_id == getattr(emp, "id", None) and role not in ("admin", "super_admin"):
        raise PermissionDenied("You cannot approve your own timesheet.")
    if user.is_superuser or role in ("hr", "admin", "super_admin"):
        return emp
    if emp and team_of(emp).filter(id=sheet.employee_id).exists():
        return emp
    raise PermissionDenied("You are not the approver for this timesheet.")
