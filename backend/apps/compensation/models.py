"""Compensation models (src/services/hr.ts)."""
from __future__ import annotations

from django.db import models

from apps.common.models import OrgOwnedModel


class SalaryBand(OrgOwnedModel):
    grade = models.CharField(max_length=16)
    role = models.CharField(max_length=128)
    department = models.CharField(max_length=64)
    min_usd = models.DecimalField(max_digits=12, decimal_places=2)
    mid_usd = models.DecimalField(max_digits=12, decimal_places=2)
    max_usd = models.DecimalField(max_digits=12, decimal_places=2)
    current_avg_usd = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    headcount = models.PositiveIntegerField(default=0)
    currency = models.CharField(max_length=8, default="USD")

    class Meta:
        ordering = ("grade",)
        unique_together = ("organization", "grade", "role")


class Promotion(OrgOwnedModel):
    class Status(models.TextChoices):
        RECOMMENDED = "recommended", "Recommended"
        APPROVED = "approved", "Approved"
        ON_HOLD = "on_hold", "On hold"
        REJECTED = "rejected", "Rejected"

    employee = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="promotions"
    )
    from_grade = models.CharField(max_length=16)
    to_grade = models.CharField(max_length=16)
    department = models.CharField(max_length=64)
    effective = models.DateField()
    current_salary = models.DecimalField(max_digits=12, decimal_places=2)
    proposed_salary = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.RECOMMENDED)
    recommender = models.CharField(max_length=128, blank=True)
    justification = models.TextField(blank=True)

    class Meta:
        ordering = ("-effective",)

    @property
    def hike_pct(self) -> float:
        if not self.current_salary:
            return 0.0
        return round(
            float(self.proposed_salary - self.current_salary) / float(self.current_salary) * 100, 1
        )


class SalaryRevision(OrgOwnedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    employee = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="salary_revisions"
    )
    effective = models.DateField()
    previous_salary = models.DecimalField(max_digits=12, decimal_places=2)
    new_salary = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=128, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    approver = models.CharField(max_length=128, blank=True)

    class Meta:
        ordering = ("-effective",)

    @property
    def hike_pct(self) -> float:
        if not self.previous_salary:
            return 0.0
        return round(
            float(self.new_salary - self.previous_salary) / float(self.previous_salary) * 100, 1
        )
