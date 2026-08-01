"""Reusable role-based DRF permissions."""
from __future__ import annotations

from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    """Base class — subclasses must set ``required_roles``."""

    required_roles: tuple[str, ...] = ()

    def has_permission(self, request, view) -> bool:  # noqa: D401
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        user_role = getattr(user, "role", None)
        return user_role in self.required_roles


#: Every role is at least an employee.
ALL_ROLES = (
    "employee",
    "manager",
    "recruiter",
    "payroll",
    "finance",
    "hr",
    "admin",
    "super_admin",
)


class IsEmployee(RolePermission):
    required_roles = ALL_ROLES


class IsManager(RolePermission):
    required_roles = ("manager", "hr", "admin", "super_admin")


class IsHR(RolePermission):
    required_roles = ("hr", "recruiter", "admin", "super_admin")


class IsPayroll(RolePermission):
    required_roles = ("payroll", "finance", "hr", "admin", "super_admin")


class IsAdminRole(RolePermission):
    required_roles = ("admin", "super_admin")
