"""Reusable benefits/expense business services (AI-tool friendly)."""
from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import NotFound, ValidationError

from .models import Benefit, BenefitEnrollment, ExpenseClaim, Loan, TravelRequest


def my_enrollments(employee):
    return (
        BenefitEnrollment.objects.filter(employee=employee, organization=employee.organization)
        .select_related("benefit")
        .order_by("benefit__name")
    )


def available_benefits(organization):
    return Benefit.objects.filter(organization=organization)


@transaction.atomic
def enroll(employee, benefit_id) -> BenefitEnrollment:
    benefit = Benefit.objects.filter(
        id=benefit_id, organization=employee.organization
    ).first()
    if benefit is None:
        raise NotFound("Benefit not found.")
    enrollment, created = BenefitEnrollment.objects.get_or_create(
        employee=employee,
        benefit=benefit,
        defaults={
            "organization": employee.organization,
            "status": Benefit.Status.PENDING,
            "enrolled_on": __import__("datetime").date.today(),
        },
    )
    if not created:
        raise ValidationError({"detail": "Already enrolled in this benefit."})
    return enrollment


def my_expenses(employee):
    return ExpenseClaim.objects.filter(
        employee=employee, organization=employee.organization
    ).prefetch_related("receipts")


@transaction.atomic
def submit_expense(employee, **data) -> ExpenseClaim:
    amount = Decimal(str(data.get("amount", "0")))
    if amount <= 0:
        raise ValidationError({"amount": "Amount must be greater than zero."})
    data["amount"] = amount
    return ExpenseClaim.objects.create(
        employee=employee,
        organization=employee.organization,
        status=ExpenseClaim.Status.SUBMITTED,
        **data,
    )


def my_travel_requests(employee):
    return TravelRequest.objects.filter(employee=employee, organization=employee.organization)


@transaction.atomic
def submit_travel(employee, **data) -> TravelRequest:
    if data["to_date"] < data["from_date"]:
        raise ValidationError({"to_date": "Return date cannot be before departure date."})
    return TravelRequest.objects.create(
        employee=employee,
        organization=employee.organization,
        status=TravelRequest.Status.SUBMITTED,
        **data,
    )


def my_loans(employee):
    return Loan.objects.filter(employee=employee, organization=employee.organization)
