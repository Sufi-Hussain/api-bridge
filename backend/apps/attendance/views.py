from __future__ import annotations

import csv
from datetime import date, datetime
from io import StringIO

from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from apps.ess.selectors import get_employee_for_user

from .selectors import my_punches, my_timesheets
from .serializers import AttendancePunchSerializer, TimesheetEntrySerializer
from .services import clock_in as _clock_in
from .services import clock_out as _clock_out
from .services import summary as _summary
from .services import today_punch as _today_punch
from .services import calculate_timesheet as _calculate_timesheet
from .services import submit_timesheets as _submit_timesheets
from .services import timesheet_summary as _timesheet_summary


def _build_attendance_csv(qs, filename_suffix: str) -> HttpResponse:
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow([
        "Date",
        "Day",
        "Clock In",
        "Clock Out",
        "Worked Hours",
        "Break (min)",
        "Status",
        "Location",
        "Shift",
    ])
    for punch in qs.order_by("-date"):
        d: date = punch.date
        clock_in = punch.clock_in.strftime("%H:%M") if punch.clock_in else ""
        clock_out = punch.clock_out.strftime("%H:%M") if punch.clock_out else ""
        writer.writerow([
            d.isoformat(),
            d.strftime("%A"),
            clock_in,
            clock_out,
            f"{float(punch.worked_hours):.2f}" if punch.worked_hours is not None else "",
            punch.break_minutes or "",
            punch.get_status_display(),
            punch.location or "",
            punch.shift or "",
        ])
    stamp = datetime.now().strftime("%Y%m%d_%H%M")
    response = HttpResponse(buffer.getvalue(), content_type="text/csv")
    response["Content-Disposition"] = (
        f'attachment; filename="attendance_{filename_suffix}_{stamp}.csv"'
    )
    return response


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

    @action(detail=False, methods=["get"], url_path="export-csv")
    def export_csv(self, request):
        """Download a CSV of the employee's attendance punches.

        Accepts `days` (default 60) and optional `start` / `end` ISO dates
        to narrow the exported window. Uses user's employee number in the
        filename so HR admins and employees can tell files apart.
        """
        emp = get_employee_for_user(request.user)
        qs = my_punches(request.user)

        start = request.query_params.get("start")
        end = request.query_params.get("end")
        if start:
            try:
                qs = qs.filter(date__gte=date.fromisoformat(start))
            except ValueError as exc:
                raise ValidationError({"detail": "start must be an ISO date."}) from exc
        if end:
            try:
                qs = qs.filter(date__lte=date.fromisoformat(end))
            except ValueError as exc:
                raise ValidationError({"detail": "end must be an ISO date."}) from exc

        if not start and not end:
            days = request.query_params.get("days", 60)
            try:
                days = int(days)
            except (TypeError, ValueError):
                days = 60
            if days > 0:
                today = date.today()
                qs = qs.filter(date__gte=today.fromordinal(today.toordinal() - days + 1))

        emp_id = getattr(emp, "employee_number", None) or f"emp_{str(emp.id)[:8]}"
        return _build_attendance_csv(qs, filename_suffix=emp_id)


class TimesheetEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimesheetEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return my_timesheets(self.request.user)

    def perform_create(self, serializer):
        entry = serializer.save(employee=get_employee_for_user(self.request.user))
        _calculate_timesheet(entry)

    def perform_update(self, serializer):
        entry = serializer.save()
        _calculate_timesheet(entry)

    @action(detail=False, methods=["post"])
    def submit(self, request):
        employee = get_employee_for_user(request.user)
        try:
            start = date.fromisoformat(request.data["start"])
            end = date.fromisoformat(request.data["end"])
        except (KeyError, TypeError, ValueError) as exc:
            raise ValidationError({"detail": "start and end must be ISO dates."}) from exc
        return Response({"submitted": _submit_timesheets(employee, start, end)})

    @action(detail=False, methods=["get"])
    def summary(self, request):
        try:
            start = date.fromisoformat(request.query_params["start"])
            end = date.fromisoformat(request.query_params["end"])
        except (KeyError, TypeError, ValueError) as exc:
            raise ValidationError({"detail": "start and end must be ISO dates."}) from exc
        return Response(_timesheet_summary(get_employee_for_user(request.user), start, end))
