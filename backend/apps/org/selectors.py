from __future__ import annotations

from django.db.models import QuerySet

from .models import BusinessUnit, CostCenter, Department, Location, Team


def departments(org) -> QuerySet[Department]:
    return Department.objects.filter(organization=org).select_related("head", "parent")


def teams(org) -> QuerySet[Team]:
    return Team.objects.filter(organization=org).select_related("department", "lead")


def locations(org) -> QuerySet[Location]:
    return Location.objects.filter(organization=org)


def business_units(org) -> QuerySet[BusinessUnit]:
    return BusinessUnit.objects.filter(organization=org)


def cost_centers(org) -> QuerySet[CostCenter]:
    return CostCenter.objects.filter(organization=org)
