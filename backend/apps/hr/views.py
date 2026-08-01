from __future__ import annotations

from rest_framework import viewsets

from apps.common.permissions import IsHR
from apps.common.viewsets import current_organization

from .selectors import all_departments, all_employees
from .serializers import DepartmentSerializer, HRDirectoryEmployeeSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """Departments of the caller's organization only."""

    serializer_class = DepartmentSerializer
    permission_classes = [IsHR]
    queryset = all_departments()
    search_fields = ("name",)

    def get_queryset(self):
        return all_departments(current_organization(self.request))

    def perform_create(self, serializer):
        serializer.save(organization=current_organization(self.request))

    def perform_update(self, serializer):
        serializer.save(organization=current_organization(self.request))


class HREmployeeViewSet(viewsets.ReadOnlyModelViewSet):
    """HR directory, scoped to the caller's organization."""

    serializer_class = HRDirectoryEmployeeSerializer
    permission_classes = [IsHR]
    search_fields = ("first_name", "last_name", "work_email", "employee_id")
    filterset_fields = ("employment__department", "employment__location", "employment__grade")

    def get_queryset(self):
        return all_employees(current_organization(self.request))
