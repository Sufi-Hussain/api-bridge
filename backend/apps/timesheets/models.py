"""
Enterprise timesheet domain.

Shape follows the standard used by Workday / Darwinbox / Keka / Zoho People:

    Client -> Project -> ProjectTask
    TimesheetPeriod (weekly|monthly, per organization)
      └─ Timesheet (one per employee per period, carries workflow state)
           └─ TimesheetLine (one per day per project/task)
           └─ TimesheetComment (approval trail / returned-for-rework notes)

The legacy ``attendance.TimesheetEntry`` model is left untouched so existing
data and endpoints keep working; new work should use these models.
"""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from django.conf import settings
from django.db import models

from apps.common.models import OrgOwnedModel, UUIDTimestampedModel


class Client(OrgOwnedModel):
    name = models.CharField(max_length=160)
    code = models.CharField(max_length=32, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)
        unique_together = [("organization", "name")]

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class Project(OrgOwnedModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ON_HOLD = "on_hold", "On hold"
        CLOSED = "closed", "Closed"

    name = models.CharField(max_length=160)
    code = models.CharField(max_length=32, blank=True)
    client = models.ForeignKey(
        Client, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects"
    )
    manager = models.ForeignKey(
        "ess.Employee", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="managed_projects",
    )
    department = models.CharField(max_length=64, blank=True)
    billable = models.BooleanField(default=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    budget_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        ordering = ("name",)
        unique_together = [("organization", "name")]

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class ProjectTask(OrgOwnedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    name = models.CharField(max_length=160)
    billable = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)
        unique_together = [("project", "name")]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.project_id}:{self.name}"


class ProjectAllocation(OrgOwnedModel):
    """Who may book time to which project, and at what planned capacity."""

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="allocations")
    employee = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="project_allocations"
    )
    percent = models.PositiveIntegerField(default=100)
    from_date = models.DateField(null=True, blank=True)
    to_date = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = [("project", "employee")]


class TimesheetPeriod(OrgOwnedModel):
    class Kind(models.TextChoices):
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"
        LOCKED = "locked", "Locked"

    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.WEEKLY)
    start_date = models.DateField()
    end_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)

    class Meta:
        ordering = ("-start_date",)
        unique_together = [("organization", "kind", "start_date")]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.kind} {self.start_date}..{self.end_date}"

    @property
    def is_editable(self) -> bool:
        return self.status == self.Status.OPEN

    @staticmethod
    def week_bounds(day: date) -> tuple[date, date]:
        start = day - timedelta(days=day.weekday())  # Monday
        return start, start + timedelta(days=6)

    @staticmethod
    def month_bounds(day: date) -> tuple[date, date]:
        start = day.replace(day=1)
        nxt = (start + timedelta(days=31)).replace(day=1)
        return start, nxt - timedelta(days=1)


class Timesheet(OrgOwnedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        RETURNED = "returned", "Returned for rework"

    OPEN_STATES = (Status.DRAFT, Status.RETURNED, Status.REJECTED)

    period = models.ForeignKey(
        TimesheetPeriod, on_delete=models.CASCADE, related_name="timesheets"
    )
    employee = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="timesheet_set"
    )
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)

    total_hours = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    billable_hours = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    non_billable_hours = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    internal_hours = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    leave_hours = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    holiday_hours = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    expected_hours = models.DecimalField(max_digits=7, decimal_places=2, default=0)

    submitted_at = models.DateTimeField(null=True, blank=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    approver = models.ForeignKey(
        "ess.Employee", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="timesheets_reviewed",
    )

    class Meta:
        ordering = ("-period__start_date",)
        unique_together = [("period", "employee")]

    @property
    def utilization(self) -> Decimal:
        if not self.total_hours:
            return Decimal("0")
        return (self.billable_hours / self.total_hours * 100).quantize(Decimal("0.1"))


class TimesheetLine(UUIDTimestampedModel):
    class WorkType(models.TextChoices):
        PROJECT = "project", "Project work"
        INTERNAL = "internal", "Internal / overhead"
        LEAVE = "leave", "Leave"
        HOLIDAY = "holiday", "Holiday"

    timesheet = models.ForeignKey(Timesheet, on_delete=models.CASCADE, related_name="lines")
    date = models.DateField()
    project = models.ForeignKey(
        Project, on_delete=models.PROTECT, null=True, blank=True, related_name="timesheet_lines"
    )
    task = models.ForeignKey(
        ProjectTask, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="timesheet_lines",
    )
    work_type = models.CharField(max_length=12, choices=WorkType.choices, default=WorkType.PROJECT)
    hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    billable = models.BooleanField(default=True)
    notes = models.CharField(max_length=255, blank=True)
    locked = models.BooleanField(default=False)  # leave/holiday rows are system-generated

    class Meta:
        ordering = ("date",)
        indexes = [models.Index(fields=["timesheet", "date"])]


class TimesheetComment(UUIDTimestampedModel):
    class Kind(models.TextChoices):
        COMMENT = "comment", "Comment"
        EVENT = "event", "Workflow event"

    timesheet = models.ForeignKey(Timesheet, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="timesheet_comments",
    )
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.COMMENT)
    body = models.TextField(blank=True)

    class Meta:
        ordering = ("created_at",)
