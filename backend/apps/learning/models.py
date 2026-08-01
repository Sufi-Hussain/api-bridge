"""Learning & development models (src/services/ess.ts + hr.ts)."""
from __future__ import annotations

from django.db import models

from apps.common.models import OrgOwnedModel


class Course(OrgOwnedModel):
    class Level(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    title = models.CharField(max_length=160)
    provider = models.CharField(max_length=128)
    category = models.CharField(max_length=64)
    level = models.CharField(max_length=16, choices=Level.choices, default=Level.BEGINNER)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=1, default=1)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    cover = models.CharField(max_length=255, blank=True)
    mandatory = models.BooleanField(default=False)

    class Meta:
        ordering = ("title",)

    def __str__(self) -> str:  # pragma: no cover
        return self.title


class Enrollment(OrgOwnedModel):
    employee = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="enrollments"
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    progress = models.PositiveIntegerField(default=0)
    completed_on = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)

    class Meta:
        unique_together = ("employee", "course")
        ordering = ("-created_at",)


class TrainingProgram(OrgOwnedModel):
    class Format(models.TextChoices):
        INSTRUCTOR = "instructor", "Instructor led"
        SELF_PACED = "self_paced", "Self paced"
        BLENDED = "blended", "Blended"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        DRAFT = "draft", "Draft"
        ARCHIVED = "archived", "Archived"

    name = models.CharField(max_length=160)
    category = models.CharField(max_length=64)
    format = models.CharField(max_length=16, choices=Format.choices, default=Format.BLENDED)
    duration_hrs = models.DecimalField(max_digits=5, decimal_places=1, default=1)
    enrolled = models.PositiveIntegerField(default=0)
    completed = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ACTIVE)
    mandatory = models.BooleanField(default=False)

    class Meta:
        ordering = ("name",)


class Certification(OrgOwnedModel):
    class Status(models.TextChoices):
        VALID = "valid", "Valid"
        EXPIRING = "expiring", "Expiring"
        EXPIRED = "expired", "Expired"

    employee = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="certifications"
    )
    name = models.CharField(max_length=160)
    issuer = models.CharField(max_length=128)
    credential_id = models.CharField(max_length=96, blank=True)
    issued_on = models.DateField()
    expires_on = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.VALID)

    class Meta:
        ordering = ("-issued_on",)


class SkillMatrixEntry(OrgOwnedModel):
    """Aggregated skill coverage row (src/services/hr.ts → SkillMatrixRow)."""

    skill = models.CharField(max_length=96)
    category = models.CharField(max_length=64)
    beginner = models.PositiveIntegerField(default=0)
    intermediate = models.PositiveIntegerField(default=0)
    advanced = models.PositiveIntegerField(default=0)
    expert = models.PositiveIntegerField(default=0)
    gap = models.IntegerField(default=0)

    class Meta:
        ordering = ("skill",)
        unique_together = ("organization", "skill")
