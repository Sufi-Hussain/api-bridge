from __future__ import annotations

from django.db import models
from apps.common.models import OrgOwnedModel, UUIDTimestampedModel


class LifecycleRecord(OrgOwnedModel):
    class Status(models.TextChoices):
        PREBOARDING = "preboarding", "Preboarding"
        ONBOARDING = "onboarding", "Onboarding"
        ACTIVE = "active", "Active"
        OFFBOARDING = "offboarding", "Offboarding"
        SEPARATED = "separated", "Separated"

    class ExitType(models.TextChoices):
        RESIGNATION = "resignation", "Resignation"
        TERMINATION = "termination", "Termination"

    employee = models.OneToOneField("ess.Employee", on_delete=models.PROTECT, related_name="lifecycle")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PREBOARDING)
    joining_date = models.DateField(null=True, blank=True)
    job_title = models.CharField(max_length=128, blank=True)
    department = models.CharField(max_length=64, blank=True)
    manager = models.ForeignKey("ess.Employee", null=True, blank=True, on_delete=models.PROTECT, related_name="managed_lifecycles")
    hr_verified_at = models.DateTimeField(null=True, blank=True)
    exit_type = models.CharField(max_length=16, choices=ExitType.choices, blank=True)
    exit_reason = models.TextField(blank=True)
    notice_date = models.DateField(null=True, blank=True)
    last_working_day = models.DateField(null=True, blank=True)
    access_revoked_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)

    @property
    def completion_percent(self):
        items = self.checklist_items.all()
        total = items.count()
        return 0 if not total else round(items.filter(completed=True).count() * 100 / total)


class LifecycleChecklistItem(UUIDTimestampedModel):
    class Phase(models.TextChoices):
        ONBOARDING = "onboarding", "Onboarding"
        OFFBOARDING = "offboarding", "Offboarding"

    lifecycle = models.ForeignKey(LifecycleRecord, on_delete=models.CASCADE, related_name="checklist_items")
    phase = models.CharField(max_length=16, choices=Phase.choices)
    title = models.CharField(max_length=180)
    owner = models.CharField(max_length=64, default="HR")
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    required = models.BooleanField(default=True)

    class Meta:
        ordering = ("phase", "created_at")


class LifecycleApproval(UUIDTimestampedModel):
    lifecycle = models.ForeignKey(LifecycleRecord, on_delete=models.CASCADE, related_name="approvals")
    role = models.CharField(max_length=32)
    approved = models.BooleanField(null=True)
    comment = models.TextField(blank=True)
    decided_at = models.DateTimeField(null=True, blank=True)


class LifecycleAsset(UUIDTimestampedModel):
    lifecycle = models.ForeignKey(LifecycleRecord, on_delete=models.CASCADE, related_name="asset_actions")
    asset = models.ForeignKey("assets.Asset", on_delete=models.PROTECT)
    action = models.CharField(max_length=16, choices=(("allocate", "Allocate"), ("return", "Return")))
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
