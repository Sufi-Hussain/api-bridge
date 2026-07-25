"""
accounts.permissions
====================

Reusable DRF permission classes. Compose in views:

    class EmployeeViewSet(...):
        permission_classes = [IsAuthenticated, IsOrganizationMember,
                              HasPermission("employee.read")]

Object-level rules live in `has_object_permission`. Views that expose objects
MUST call `self.check_object_permissions(request, obj)` — DRF's generic
`get_object()` already does.
"""
from __future__ import annotations
from rest_framework.permissions import BasePermission, IsAuthenticated as _IsAuthenticated
from .services.rbac import user_permission_codenames

IsAuthenticated = _IsAuthenticated


def _current_org(request):
    return getattr(request, "organization", None)


class IsOrganizationMember(BasePermission):
    """User must be an active member of the tenant selected for this request."""
    message = "You are not a member of this organization."

    def has_permission(self, request, view):
        user = request.user
        org = _current_org(request)
        if not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        if org is None:
            return False
        return user.memberships.filter(organization=org, status="active").exists()


class HasPermission(BasePermission):
    """Factory-style: `HasPermission('employee.write')`.

    Aggregates permissions from all roles the user holds in the current org.
    """
    required: str = ""

    def __new__(cls, codename: str | None = None):
        if codename is None:
            return super().__new__(cls)
        # Return a subclass so DRF can instantiate it with no args.
        return type(
            f"HasPermission_{codename.replace('.', '_')}",
            (cls,),
            {"required": codename},
        )

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        org = _current_org(request)
        if org is None:
            return False
        return self.required in user_permission_codenames(request.user, org)


class HasRole(BasePermission):
    required: str = ""

    def __new__(cls, slug: str | None = None):
        if slug is None:
            return super().__new__(cls)
        return type(
            f"HasRole_{slug}",
            (cls,),
            {"required": slug},
        )

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        org = _current_org(request)
        if org is None:
            return False
        return request.user.role_assignments.filter(
            organization=org, role__slug=self.required
        ).exists()


class IsSelf(BasePermission):
    """Object-level: the object IS the user (e.g. profile edits)."""
    def has_object_permission(self, request, view, obj):
        return getattr(obj, "user_id", getattr(obj, "id", None)) == request.user.id


class IsOwner(BasePermission):
    """Object has an `owner` or `user` FK equal to request.user."""
    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, "owner_id", None) or getattr(obj, "user_id", None)
        return owner == request.user.id


class OrganizationObjectPermission(BasePermission):
    """
    Object-level: the object's organization must match the request's
    organization. Combine with HasPermission for action-level checks.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        org = _current_org(request)
        return org is not None and getattr(obj, "organization_id", None) == org.id


class IsManagerOfEmployee(BasePermission):
    """Object-level: obj is an Employee that reports to request.user."""
    def has_object_permission(self, request, view, obj):
        mgr_id = getattr(obj, "manager_id", None)
        return mgr_id is not None and mgr_id == request.user.id


class IsOrganizationAdmin(BasePermission):
    """User has the built-in 'org_admin' role in the current org."""
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        org = _current_org(request)
        if org is None:
            return False
        return request.user.role_assignments.filter(
            organization=org, role__slug="org_admin"
        ).exists()
