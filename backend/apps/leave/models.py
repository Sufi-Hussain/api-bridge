from __future__ import annotations

from django.db import models

from apps.common.models import UUIDTimestampedModel
from apps.ess.models import Employee


class LeaveType(UUIDTimestampedModel):
    code = models.CharField(max_length=16, unique=True)
    name = models.CharField(max_length=64)
    annual_quota = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class LeaveRequest(UUIDTimestampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="leave_requests")
    type = models.ForeignKey(LeaveType, on_delete=models.PROTECT, related_name="requests")
    from_date = models.DateField()
    to_date = models.DateField()
    days = models.DecimalField(max_digits=5, decimal_places=2)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    approver = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="leaves_approved"
    )
    applied_on = models.DateTimeField(auto_now_add=True)
    attachment = models.FileField(upload_to="leave/", blank=True, null=True)


class Holiday(UUIDTimestampedModel):
    name = models.CharField(max_length=128)
    date = models.DateField()
    region = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ("date",)
