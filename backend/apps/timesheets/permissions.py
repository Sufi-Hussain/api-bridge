from __future__ import annotations

from rest_framework.permissions import BasePermission

from . import services


class CanViewTimesheet(BasePermission):
    """Owner, the owner's manager, or HR/Payroll/Admin."""

    def has_object_permission(self, request, view, obj) -> bool:
        return services.can_view(obj, request.user)


class IsTimesheetApprover(BasePermission):
    """Manager of the timesheet owner, or HR/Admin. Never the owner."""

    def has_object_permission(self, request, view, obj) -> bool:
        try:
            services.assert_can_approve(obj, request.user)
        except Exception:
            return False
        return True
