"""Employee Self-Service models — normalized from src/services/ess.ts."""
from __future__ import annotations

from django.conf import settings
from django.db import models

from apps.common.models import UUIDTimestampedModel


class Gender(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"
    NON_BINARY = "non-binary", "Non-binary"
    PREFER_NOT = "prefer-not-to-say", "Prefer not to say"


class MaritalStatus(models.TextChoices):
    SINGLE = "single", "Single"
    MARRIED = "married", "Married"
    DIVORCED = "divorced", "Divorced"
    WIDOWED = "widowed", "Widowed"


class EmploymentType(models.TextChoices):
    FULL_TIME = "full-time", "Full-time"
    PART_TIME = "part-time", "Part-time"
    CONTRACT = "contract", "Contract"
    INTERN = "intern", "Intern"


class WorkMode(models.TextChoices):
    ONSITE = "on-site", "On-site"
    HYBRID = "hybrid", "Hybrid"
    REMOTE = "remote", "Remote"


class Employee(UUIDTimestampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employee",
    )
    employee_id = models.CharField(max_length=32, unique=True)
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    preferred_name = models.CharField(max_length=64, blank=True)
    gender = models.CharField(max_length=32, choices=Gender.choices)
    dob = models.DateField()
    marital_status = models.CharField(max_length=16, choices=MaritalStatus.choices)
    nationality = models.CharField(max_length=64)
    blood_group = models.CharField(max_length=8, blank=True)
    personal_email = models.EmailField(blank=True)
    work_email = models.EmailField()
    mobile = models.CharField(max_length=32)
    work_phone = models.CharField(max_length=32, blank=True)

    class Meta:
        ordering = ("first_name", "last_name")

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.first_name} {self.last_name}"


class Address(UUIDTimestampedModel):
    employee = models.OneToOneField(
        Employee, on_delete=models.CASCADE, related_name="address"
    )
    line1 = models.CharField(max_length=128)
    line2 = models.CharField(max_length=128, blank=True)
    city = models.CharField(max_length=64)
    state = models.CharField(max_length=64)
    country = models.CharField(max_length=64)
    postal = models.CharField(max_length=16)


class Employment(UUIDTimestampedModel):
    employee = models.OneToOneField(
        Employee, on_delete=models.CASCADE, related_name="employment"
    )
    job_title = models.CharField(max_length=128)
    department = models.CharField(max_length=64)
    grade = models.CharField(max_length=16)
    employment_type = models.CharField(
        max_length=16, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME
    )
    manager = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="direct_reports",
    )
    location = models.CharField(max_length=64)
    work_mode = models.CharField(max_length=16, choices=WorkMode.choices, default=WorkMode.HYBRID)
    join_date = models.DateField()
    probation_end = models.DateField(blank=True, null=True)
    cost_center = models.CharField(max_length=32, blank=True)
    business_unit = models.CharField(max_length=64, blank=True)


class EmergencyContact(UUIDTimestampedModel):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="emergency_contacts"
    )
    name = models.CharField(max_length=128)
    relation = models.CharField(max_length=32)
    phone = models.CharField(max_length=32)
    email = models.EmailField(blank=True)
    primary = models.BooleanField(default=False)


class FamilyMember(UUIDTimestampedModel):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="family"
    )
    name = models.CharField(max_length=128)
    relation = models.CharField(max_length=32)
    dob = models.DateField()
    dependent = models.BooleanField(default=False)
    covered = models.BooleanField(default=False)


class Education(UUIDTimestampedModel):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="education"
    )
    degree = models.CharField(max_length=64)
    institution = models.CharField(max_length=128)
    field = models.CharField(max_length=128)
    from_year = models.CharField(max_length=8)
    to_year = models.CharField(max_length=8)
    grade = models.CharField(max_length=32, blank=True)


class Experience(UUIDTimestampedModel):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="experience"
    )
    company = models.CharField(max_length=128)
    role = models.CharField(max_length=128)
    from_date = models.CharField(max_length=16)
    to_date = models.CharField(max_length=16)
    location = models.CharField(max_length=64, blank=True)
    summary = models.TextField(blank=True)


class BankAccount(UUIDTimestampedModel):
    class AccountType(models.TextChoices):
        SAVINGS = "savings", "Savings"
        CURRENT = "current", "Current"

    employee = models.OneToOneField(
        Employee, on_delete=models.CASCADE, related_name="bank"
    )
    account_name = models.CharField(max_length=128)
    account_number = models.CharField(max_length=64)
    ifsc = models.CharField(max_length=32)
    bank = models.CharField(max_length=64)
    branch = models.CharField(max_length=64, blank=True)
    type = models.CharField(max_length=16, choices=AccountType.choices, default=AccountType.SAVINGS)


class Skill(UUIDTimestampedModel):
    name = models.CharField(max_length=64, unique=True)

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class EmployeeSkill(UUIDTimestampedModel):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="skills"
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="employees")
    level = models.PositiveSmallIntegerField(default=1)  # 1-5
    endorsed = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("employee", "skill")
