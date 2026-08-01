"""Organization / tenancy master data (Objectives 4 & 6)."""
from __future__ import annotations

from django.db import models

from apps.common.models import OrgOwnedModel, UUIDTimestampedModel


class Organization(UUIDTimestampedModel):
    name = models.CharField(max_length=128, unique=True)
    code = models.CharField(max_length=16, unique=True)
    legal_name = models.CharField(max_length=160, blank=True)
    domain = models.CharField(max_length=128, blank=True)
    country = models.CharField(max_length=64, blank=True)
    timezone = models.CharField(max_length=64, default="UTC")
    currency = models.CharField(max_length=8, default="USD")
    logo = models.ImageField(upload_to="org/", blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class BusinessUnit(OrgOwnedModel):
    name = models.CharField(max_length=96)
    code = models.CharField(max_length=16)
    head_name = models.CharField(max_length=128, blank=True)

    class Meta:
        ordering = ("name",)
        unique_together = ("organization", "code")

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class CostCenter(OrgOwnedModel):
    name = models.CharField(max_length=96)
    code = models.CharField(max_length=24)
    business_unit = models.ForeignKey(
        BusinessUnit, on_delete=models.SET_NULL, null=True, blank=True, related_name="cost_centers"
    )
    budget_usd = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        ordering = ("code",)
        unique_together = ("organization", "code")

    def __str__(self) -> str:  # pragma: no cover
        return self.code


class Location(OrgOwnedModel):
    class Kind(models.TextChoices):
        HQ = "hq", "HQ"
        OFFICE = "office", "Office"
        REMOTE_HUB = "remote_hub", "Remote hub"

    name = models.CharField(max_length=96)
    city = models.CharField(max_length=64)
    country = models.CharField(max_length=64)
    address = models.CharField(max_length=255, blank=True)
    timezone = models.CharField(max_length=64, default="UTC")
    type = models.CharField(max_length=16, choices=Kind.choices, default=Kind.OFFICE)

    class Meta:
        ordering = ("name",)
        unique_together = ("organization", "name")

    def __str__(self) -> str:  # pragma: no cover
        return self.name

    @property
    def headcount(self) -> int:
        from apps.ess.models import Employment

        return Employment.objects.filter(location=self.name).count()


class Department(OrgOwnedModel):
    name = models.CharField(max_length=64)
    code = models.CharField(max_length=16)
    head = models.ForeignKey(
        "ess.Employee", on_delete=models.SET_NULL, null=True, blank=True, related_name="departments_led"
    )
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )
    open_positions = models.PositiveIntegerField(default=0)
    budget_usd = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    attrition_ytd = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    cost_center = models.CharField(max_length=24, blank=True)

    class Meta:
        ordering = ("name",)
        unique_together = ("organization", "name")

    def __str__(self) -> str:  # pragma: no cover
        return self.name

    @property
    def headcount(self) -> int:
        from apps.ess.models import Employment

        return Employment.objects.filter(department=self.name).count()

    @property
    def head_name(self) -> str:
        return f"{self.head.first_name} {self.head.last_name}" if self.head else ""


class Team(OrgOwnedModel):
    name = models.CharField(max_length=96)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="teams")
    lead = models.ForeignKey(
        "ess.Employee", on_delete=models.SET_NULL, null=True, blank=True, related_name="teams_led"
    )
    location = models.CharField(max_length=96, blank=True)

    class Meta:
        ordering = ("name",)
        unique_together = ("organization", "name")

    def __str__(self) -> str:  # pragma: no cover
        return self.name

    @property
    def members(self) -> int:
        from apps.ess.models import Employment

        return Employment.objects.filter(team=self.name).count()
