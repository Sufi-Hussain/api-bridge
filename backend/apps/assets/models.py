"""Asset & IT inventory models (src/services/ess.ts + admin-mock.ts)."""
from __future__ import annotations

from django.db import models

from apps.common.models import OrgOwnedModel


class Asset(OrgOwnedModel):
    class Category(models.TextChoices):
        LAPTOP = "laptop", "Laptop"
        PHONE = "phone", "Phone"
        MONITOR = "monitor", "Monitor"
        ACCESSORY = "accessory", "Accessory"
        SOFTWARE = "software", "Software"
        OTHER = "other", "Other"

    class Condition(models.TextChoices):
        EXCELLENT = "excellent", "Excellent"
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"

    class Status(models.TextChoices):
        IN_STOCK = "in_stock", "In stock"
        ASSIGNED = "assigned", "Assigned"
        REPAIR = "repair", "In repair"
        RETIRED = "retired", "Retired"

    name = models.CharField(max_length=128)
    category = models.CharField(max_length=16, choices=Category.choices, default=Category.OTHER)
    serial = models.CharField(max_length=64)
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    condition = models.CharField(
        max_length=12, choices=Condition.choices, default=Condition.GOOD
    )
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.IN_STOCK)
    warranty_end = models.DateField(blank=True, null=True)
    assigned_to = models.ForeignKey(
        "ess.Employee",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="assets",
    )
    assigned_on = models.DateField(blank=True, null=True)

    class Meta:
        ordering = ("name",)
        unique_together = ("organization", "serial")

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.name} ({self.serial})"


class AssetRequest(OrgOwnedModel):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        FULFILLED = "fulfilled", "Fulfilled"
        REJECTED = "rejected", "Rejected"

    employee = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="asset_requests"
    )
    category = models.CharField(max_length=16, choices=Asset.Category.choices)
    justification = models.TextField(blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.SUBMITTED)
    requested_on = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ("-requested_on",)


class SoftwareLicense(OrgOwnedModel):
    name = models.CharField(max_length=128)
    vendor = models.CharField(max_length=128, blank=True)
    seats_total = models.PositiveIntegerField(default=0)
    seats_used = models.PositiveIntegerField(default=0)
    cost_per_seat = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    renewal_date = models.DateField(blank=True, null=True)

    class Meta:
        ordering = ("name",)
        unique_together = ("organization", "name")
