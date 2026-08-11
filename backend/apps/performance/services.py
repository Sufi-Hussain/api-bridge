"""Performance services (goals & reviews) scoped to the caller."""
from __future__ import annotations

from .models import Goal, Review


def my_goals(employee):
    return (
        Goal.objects.filter(owner=employee, organization=employee.organization)
        .prefetch_related("key_results")
    )


def my_reviews(employee):
    """Only reviews the employee is allowed to see (shared with them)."""
    return (
        Review.objects.filter(employee=employee, organization=employee.organization)
        .select_related("cycle")
    )
