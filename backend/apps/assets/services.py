"""Asset self-service services."""
from __future__ import annotations

from django.db import transaction

from .models import Asset, AssetRequest, SoftwareLicense


def my_assets(employee):
    return Asset.objects.filter(assigned_to=employee, organization=employee.organization)


def my_asset_requests(employee):
    return AssetRequest.objects.filter(employee=employee, organization=employee.organization)


@transaction.atomic
def request_asset(employee, *, category: str, justification: str = "") -> AssetRequest:
    return AssetRequest.objects.create(
        employee=employee,
        organization=employee.organization,
        category=category,
        justification=justification,
        status=AssetRequest.Status.SUBMITTED,
    )


def my_licenses(employee):
    """Software assets assigned to the employee, plus org licence metadata."""
    return SoftwareLicense.objects.filter(organization=employee.organization)
