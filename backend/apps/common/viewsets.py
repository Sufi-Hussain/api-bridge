"""Shared viewset base classes implementing tenant scoping."""
from __future__ import annotations

from typing import Any

from rest_framework import viewsets
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsEmployee


def current_organization(request):
    """Resolve the caller's tenant.

    Order: the org resolved by `OrganizationMiddleware` (honours the
    `X-Organization-Id` tenant switch), then the user's primary membership,
    then the org on the user's employee record.
    """
    org = getattr(request, "organization", None)
    if org is None:
        org = getattr(request.user, "organization", None)
    if org is None:
        emp = getattr(request.user, "employee", None)
        org = getattr(emp, "organization", None)
    if org is None:
        raise PermissionDenied("User is not attached to an organization.")
    return org


def current_employee(request):
    emp = getattr(request.user, "employee", None)
    if emp is None:
        raise NotFound("Employee profile not found for current user.")
    return emp


class OrgScopedViewSet(viewsets.ModelViewSet):
    """Full CRUD viewset automatically scoped to the caller's organization."""

    permission_classes = [IsAuthenticated, IsEmployee]
    queryset: Any = None
    select_related: tuple[str, ...] = ()
    prefetch_related: tuple[str, ...] = ()

    def get_queryset(self):
        qs = self.queryset.model.objects.filter(
            organization=current_organization(self.request)
        )
        if self.select_related:
            qs = qs.select_related(*self.select_related)
        if self.prefetch_related:
            qs = qs.prefetch_related(*self.prefetch_related)
        return qs

    def perform_create(self, serializer):
        serializer.save(organization=current_organization(self.request))

    def perform_update(self, serializer):
        serializer.save(organization=current_organization(self.request))


class OrgReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsEmployee]
    queryset: Any = None

    def get_queryset(self):
        return self.queryset.model.objects.filter(
            organization=current_organization(self.request)
        )


class EmployeeScopedViewSet(viewsets.ModelViewSet):
    """CRUD viewset restricted to rows owned by the caller's employee record."""

    permission_classes = [IsAuthenticated, IsEmployee]
    queryset: Any = None
    employee_field: str = "employee"

    def get_queryset(self):
        emp = getattr(self.request.user, "employee", None)
        if emp is None:
            return self.queryset.model.objects.none()
        return self.queryset.model.objects.filter(**{self.employee_field: emp})

    def perform_create(self, serializer):
        serializer.save(**{self.employee_field: current_employee(self.request)})
