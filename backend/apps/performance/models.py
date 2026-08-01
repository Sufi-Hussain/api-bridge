"""Performance management models (src/services/hr.ts + ess.ts)."""
from __future__ import annotations

from django.db import models

from apps.common.models import OrgOwnedModel


class PerformanceCycle(OrgOwnedModel):
    class Status(models.TextChoices):
        UPCOMING = "upcoming", "Upcoming"
        SELF_REVIEW = "self_review", "Self review"
        MANAGER_REVIEW = "manager_review", "Manager review"
        CALIBRATION = "calibration", "Calibration"
        CLOSED = "closed", "Closed"

    name = models.CharField(max_length=96)
    period_start = models.DateField()
    period_end = models.DateField()
    review_window = models.CharField(max_length=96, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPCOMING)
    eligible = models.PositiveIntegerField(default=0)
    completed = models.PositiveIntegerField(default=0)
    template = models.CharField(max_length=96, blank=True)

    class Meta:
        ordering = ("-period_start",)
        unique_together = ("organization", "name")

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class Goal(OrgOwnedModel):
    class Type(models.TextChoices):
        INDIVIDUAL = "individual", "Individual"
        TEAM = "team", "Team"
        COMPANY = "company", "Company"

    class Status(models.TextChoices):
        ON_TRACK = "on_track", "On track"
        AT_RISK = "at_risk", "At risk"
        OFF_TRACK = "off_track", "Off track"
        COMPLETED = "completed", "Completed"

    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="performance_goals"
    )
    cycle = models.ForeignKey(
        PerformanceCycle, on_delete=models.CASCADE, related_name="goals", null=True, blank=True
    )
    type = models.CharField(max_length=12, choices=Type.choices, default=Type.INDIVIDUAL)
    category = models.CharField(
        max_length=12,
        choices=(
            ("career", "Career"),
            ("team", "Team"),
            ("learning", "Learning"),
            ("personal", "Personal"),
        ),
        default="team",
    )
    weight = models.PositiveIntegerField(default=10)
    progress = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ON_TRACK)
    due = models.DateField()

    class Meta:
        ordering = ("due",)


class KeyResult(OrgOwnedModel):
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name="key_results")
    title = models.CharField(max_length=180)
    progress = models.PositiveIntegerField(default=0)
    target = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ("created_at",)


class Review(OrgOwnedModel):
    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not started"
        IN_PROGRESS = "in_progress", "In progress"
        SUBMITTED = "submitted", "Submitted"
        CALIBRATED = "calibrated", "Calibrated"
        SHARED = "shared", "Shared"
        ACKNOWLEDGED = "acknowledged", "Acknowledged"

    employee = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="reviews"
    )
    role = models.CharField(max_length=128, blank=True)
    cycle = models.ForeignKey(
        PerformanceCycle, on_delete=models.CASCADE, related_name="reviews"
    )
    reviewer = models.CharField(max_length=128)
    reviewer_title = models.CharField(max_length=128, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.NOT_STARTED)
    self_rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    manager_rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    final_rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    strengths = models.JSONField(default=list)
    improvements = models.JSONField(default=list)
    submitted_at = models.DateField(blank=True, null=True)

    class Meta:
        ordering = ("-created_at",)


class Competency(OrgOwnedModel):
    class Category(models.TextChoices):
        LEADERSHIP = "leadership", "Leadership"
        FUNCTIONAL = "functional", "Functional"
        BEHAVIORAL = "behavioral", "Behavioral"
        TECHNICAL = "technical", "Technical"

    name = models.CharField(max_length=96)
    category = models.CharField(max_length=16, choices=Category.choices)
    description = models.TextField(blank=True)
    levels = models.PositiveIntegerField(default=5)
    applies = models.JSONField(default=list)

    class Meta:
        ordering = ("name",)
        unique_together = ("organization", "name")


class SuccessionPlan(OrgOwnedModel):
    role = models.CharField(max_length=128)
    incumbent = models.CharField(max_length=128)
    ready_now = models.JSONField(default=list)
    ready_1yr = models.JSONField(default=list)
    ready_2yr = models.JSONField(default=list)
    risk = models.CharField(
        max_length=8,
        choices=(("low", "Low"), ("medium", "Medium"), ("high", "High")),
        default="medium",
    )

    class Meta:
        ordering = ("role",)
