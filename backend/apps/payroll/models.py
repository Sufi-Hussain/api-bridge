from __future__ import annotations

from django.db import models

from apps.common.models import UUIDTimestampedModel
from apps.ess.models import Employee


class Payslip(UUIDTimestampedModel):
    class Status(models.TextChoices):
        PAID = "paid", "Paid"
        PROCESSING = "processing", "Processing"
        RELEASED = "released", "Released"

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="payslips")
    month = models.CharField(max_length=16)  # e.g. "2026-06"
    period = models.CharField(max_length=32, blank=True)  # human label
    gross = models.DecimalField(max_digits=12, decimal_places=2)
    net = models.DecimalField(max_digits=12, decimal_places=2)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PROCESSING)
    paid_on = models.DateField(blank=True, null=True)

    class Meta:
        unique_together = ("employee", "month")
        ordering = ("-month",)


class PayslipLine(UUIDTimestampedModel):
    class Kind(models.TextChoices):
        EARNING = "earning", "Earning"
        DEDUCTION = "deduction", "Deduction"

    payslip = models.ForeignKey(Payslip, on_delete=models.CASCADE, related_name="lines")
    kind = models.CharField(max_length=16, choices=Kind.choices)
    label = models.CharField(max_length=64)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
