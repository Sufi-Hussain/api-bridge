"""Benefits, expenses and travel models (src/services/ess.ts)."""
from __future__ import annotations

from django.db import models

from apps.common.models import OrgOwnedModel


class Benefit(OrgOwnedModel):
    class Category(models.TextChoices):
        HEALTH = "health", "Health"
        INSURANCE = "insurance", "Insurance"
        WELLNESS = "wellness", "Wellness"
        RETIREMENT = "retirement", "Retirement"
        PERK = "perk", "Perk"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PENDING = "pending", "Pending"
        EXPIRED = "expired", "Expired"

    name = models.CharField(max_length=128)
    category = models.CharField(max_length=16, choices=Category.choices)
    provider = models.CharField(max_length=128)
    coverage = models.CharField(max_length=128, blank=True)
    premium = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    employer_contribution = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    renewal_date = models.DateField()

    class Meta:
        ordering = ("name",)
        unique_together = ("organization", "name")

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class BenefitEnrollment(OrgOwnedModel):
    employee = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="benefit_enrollments"
    )
    benefit = models.ForeignKey(Benefit, on_delete=models.CASCADE, related_name="enrollments")
    status = models.CharField(
        max_length=12, choices=Benefit.Status.choices, default=Benefit.Status.ACTIVE
    )
    claims = models.PositiveIntegerField(default=0)
    usage = models.PositiveIntegerField(default=0)
    enrolled_on = models.DateField()

    class Meta:
        unique_together = ("employee", "benefit")
        ordering = ("-enrolled_on",)


class ExpenseClaim(OrgOwnedModel):
    class Category(models.TextChoices):
        TRAVEL = "travel", "Travel"
        FOOD = "food", "Food"
        OFFICE = "office", "Office"
        MEDICAL = "medical", "Medical"
        TRAINING = "training", "Training"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        REIMBURSED = "reimbursed", "Reimbursed"
        REJECTED = "rejected", "Rejected"

    employee = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="expense_claims"
    )
    title = models.CharField(max_length=160)
    category = models.CharField(max_length=12, choices=Category.choices, default=Category.OTHER)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default="USD")
    date = models.DateField()
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    approver = models.CharField(max_length=128, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ("-date",)

    @property
    def receipt_count(self) -> int:
        return self.receipts.count()


class ExpenseReceipt(OrgOwnedModel):
    claim = models.ForeignKey(ExpenseClaim, on_delete=models.CASCADE, related_name="receipts")
    file = models.FileField(upload_to="receipts/")
    caption = models.CharField(max_length=160, blank=True)


class TravelRequest(OrgOwnedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        BOOKED = "booked", "Booked"
        REJECTED = "rejected", "Rejected"

    employee = models.ForeignKey(
        "ess.Employee", on_delete=models.CASCADE, related_name="travel_requests"
    )
    destination = models.CharField(max_length=128)
    purpose = models.CharField(max_length=255)
    from_date = models.DateField()
    to_date = models.DateField()
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    approver = models.CharField(max_length=128, blank=True)

    class Meta:
        ordering = ("-from_date",)


class Loan(OrgOwnedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        CLOSED = "closed", "Closed"
        REJECTED = "rejected", "Rejected"

    employee = models.ForeignKey("ess.Employee", on_delete=models.CASCADE, related_name="loans")
    type = models.CharField(max_length=64)
    principal = models.DecimalField(max_digits=12, decimal_places=2)
    outstanding = models.DecimalField(max_digits=12, decimal_places=2)
    emi = models.DecimalField(max_digits=10, decimal_places=2)
    tenure_months = models.PositiveIntegerField()
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    start_date = models.DateField()
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)

    class Meta:
        ordering = ("-start_date",)
