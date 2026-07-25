"""
accounts.managers
=================

Reusable queryset mixins that scope data to the requesting user's
organization. Use `.visible_to(user)` on any tenant-scoped model:

    class EmployeeManager(TenantScopedManager): ...
    class Employee(TenantScopedModel):
        objects = EmployeeManager()

    Employee.objects.visible_to(request.user)
"""
from __future__ import annotations
from django.db import models


class TenantScopedQuerySet(models.QuerySet):
    def for_organization(self, org):
        if org is None:
            return self.none()
        return self.filter(organization=org)

    def visible_to(self, user):
        """Default: return rows in orgs the user is an active member of.

        Super-admins see everything. Override on a per-model basis for
        object-level rules (manager sees direct reports, etc.).
        """
        if user is None or not user.is_authenticated:
            return self.none()
        if user.is_superuser:
            return self.all()
        return self.filter(
            organization__members__user=user,
            organization__members__status="active",
        ).distinct()


class TenantScopedManager(models.Manager.from_queryset(TenantScopedQuerySet)):
    pass
