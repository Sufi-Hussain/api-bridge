from __future__ import annotations

from django.db import models

from apps.common.models import UUIDTimestampedModel
from apps.ess.models import Employee


class AttendancePunch(UUIDTimestampedModel):
    class Status(models.TextChoices):
        PRESENT = "present", "Present"
        ABSENT = "absent", "Absent"
        LEAVE = "leave", "Leave"
        HOLIDAY = "holiday", "Holiday"
        WEEKEND = "weekend", "Weekend"
        WFH = "wfh", "Work from home"
        HALF_DAY = "half-day", "Half-day"

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="punches")
    date = models.DateField()
    clock_in = models.TimeField(blank=True, null=True)
    clock_out = models.TimeField(blank=True, null=True)
    worked_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    break_minutes = models.PositiveIntegerField(default=0)
    location = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PRESENT)
    shift = models.CharField(max_length=64, blank=True)

    class Meta:
        unique_together = ("employee", "date")
        ordering = ("-date",)


class TimesheetEntry(UUIDTimestampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="timesheets")
    date = models.DateField()
    project = models.CharField(max_length=128)
    task = models.CharField(max_length=128)
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    billable = models.BooleanField(default=False)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
