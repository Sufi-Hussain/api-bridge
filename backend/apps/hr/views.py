from rest_framework import viewsets

from apps.common.permissions import IsHR

from .selectors import all_departments, all_employees
from .serializers import DepartmentSerializer, HRDirectoryEmployeeSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsHR]
    queryset = all_departments()


class HREmployeeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HRDirectoryEmployeeSerializer
    permission_classes = [IsHR]
    search_fields = ("first_name", "last_name", "work_email", "employee_id")
    filterset_fields = ("employment__department", "employment__location", "employment__grade")

    def get_queryset(self):
        return all_employees()
