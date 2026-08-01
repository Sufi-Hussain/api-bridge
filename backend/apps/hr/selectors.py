"""HR read-side selectors. Every selector is tenant-scoped: callers must pass
the organization resolved from the request (see `apps.common.viewsets`)."""
from __future__ import annotations

from apps.ess.models import Employee

from .models import Department


def all_departments(organization=None):
    qs = Department.objects.all()
    return qs.filter(organization=organization) if organization is not None else qs


def all_employees(organization=None):
    qs = Employee.objects.select_related("employment", "organization")
    return qs.filter(organization=organization) if organization is not None else qs
