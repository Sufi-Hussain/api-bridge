from __future__ import annotations

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.ess.selectors import get_employee_for_user

from .selectors import my_punches, my_timesheets
from .serializers import AttendancePunchSerializer, TimesheetEntrySerializer
from .services import clock_in as _clock_in
from .services import clock_out as _clock_out
from .services import summary as _summary
from .services import today_punch as _today_punch


class AttendancePunchViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AttendancePunchSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ("status", "date")

    def get_queryset(self):
        return my_punches(self.request.user)

    @action(detail=False, methods=["post"], url_path="clock-in")
    def clock_in(self, request):
        emp = get_employee_for_user(request.user)
        punch = _clock_in(emp, location=request.data.get("location", ""))
        return Response(AttendancePunchSerializer(punch).data)

    @action(detail=False, methods=["post"], url_path="clock-out")
    def clock_out(self, request):
        emp = get_employee_for_user(request.user)
        punch = _clock_out(emp)
        return Response(AttendancePunchSerializer(punch).data)

    @action(detail=False, methods=["get"], url_path="today")
    def today(self, request):
        punch = _today_punch(get_employee_for_user(request.user))
        return Response(AttendancePunchSerializer(punch).data if punch else {})

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        days = request.query_params.get("days", 30)
        try:
            days = int(days)
        except (TypeError, ValueError):
            days = 30
        return Response(_summary(get_employee_for_user(request.user), days))


class TimesheetEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimesheetEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return my_timesheets(self.request.user)

    def perform_create(self, serializer):
        serializer.save(employee=get_employee_for_user(self.request.user))
