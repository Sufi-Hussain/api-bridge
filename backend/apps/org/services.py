"""Organization write-side operations."""
from __future__ import annotations

from typing import Any

from .models import Organization


def update_organization(org: Organization, data: dict[str, Any]) -> Organization:
    for field, value in data.items():
        setattr(org, field, value)
    org.save()
    return org
