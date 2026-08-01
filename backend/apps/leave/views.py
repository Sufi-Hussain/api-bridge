from __future__ import annotations

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.ess.selectors import get_employee_for_user

from .models import Holiday, LeaveRequest, LeaveType
from .selectors import holidays, my_leave_requests
from .serializers import HolidaySerializer, LeaveRequestSerializer, LeaveTypeSerializer


class LeaveTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAuthenticated]


class HolidayViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HolidaySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return holidays()


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ("status", "type")

    def get_queryset(self):
        return my_leave_requests(self.request.user)

    def perform_create(self, serializer):
        emp = get_employee_for_user(self.request.user)
        serializer.save(employee=emp)
