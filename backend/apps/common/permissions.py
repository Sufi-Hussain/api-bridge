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


class IsEmployee(RolePermission):
    required_roles = ("employee", "manager", "hr", "admin")


class IsManager(RolePermission):
    required_roles = ("manager", "hr", "admin")


class IsHR(RolePermission):
    required_roles = ("hr", "admin")


class IsAdminRole(RolePermission):
    required_roles = ("admin",)
