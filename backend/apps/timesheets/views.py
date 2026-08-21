"""Timesheet API. Employee surface + manager/HR approval surface.

Every queryset is filtered by the caller's organization (multi-tenant safety)
and then by object-level rules (own record / direct reports / HR scope).
"""
from __future__ import annotations

from datetime import date, timedelta

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from apps.common.permissions import IsEmployee, IsManager
from apps.common.viewsets import OrgScopedViewSet, current_employee, current_organization

from . import services
from .models import Client, Project, ProjectTask, Timesheet, TimesheetPeriod
from .permissions import CanViewTimesheet, IsTimesheetApprover
from .serializers import (
    ClientSerializer,
    ProjectSerializer,
    ProjectTaskSerializer,
    TimesheetCommentSerializer,
    TimesheetListSerializer,
    TimesheetSerializer,
)

WRITE_ROLES = ("hr", "admin", "super_admin", "manager")


def _parse_date(value, fallback: date | None = None) -> date:
    if not value:
        if fallback is None:
            raise ValidationError({"detail": "A date is required."})
        return fallback
    try:
        return date.fromisoformat(str(value))
    except ValueError as exc:
        raise ValidationError({"detail": f"Invalid date {value!r}."}) from exc


class ProjectViewSet(OrgScopedViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    select_related = ("client", "manager")
    prefetch_related = ("tasks",)
    filterset_fields = ("status", "billable")

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsManager()]
        return [IsAuthenticated(), IsEmployee()]


class ProjectTaskViewSet(OrgScopedViewSet):
    queryset = ProjectTask.objects.all()
    serializer_class = ProjectTaskSerializer
    filterset_fields = ("project", "is_active")


class ClientViewSet(OrgScopedViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsManager()]
        return [IsAuthenticated(), IsEmployee()]


class MyTimesheetViewSet(viewsets.ReadOnlyModelViewSet):
    """`/api/timesheets/mine/` — the employee's own timesheets."""

    serializer_class = TimesheetSerializer
    permission_classes = [IsAuthenticated, IsEmployee, CanViewTimesheet]

    def get_queryset(self):
        return (
            Timesheet.objects.filter(
                organization=current_organization(self.request),
                employee=current_employee(self.request),
            )
            .select_related("period", "employee")
            .prefetch_related("lines__project", "lines__task", "comments__author")
        )

    def get_serializer_class(self):
        return TimesheetListSerializer if self.action == "list" else TimesheetSerializer

    # ---- period navigation -------------------------------------------------
    @action(detail=False, methods=["get"])
    def current(self, request):
        """?date=YYYY-MM-DD&kind=weekly|monthly — materialises the timesheet."""
        day = _parse_date(request.query_params.get("date"), timezone.localdate())
        kind = request.query_params.get("kind", TimesheetPeriod.Kind.WEEKLY)
        sheet = services.ensure_timesheet(
            current_organization(request), current_employee(request), day, kind
        )
        return Response(TimesheetSerializer(sheet).data)

    @action(detail=True, methods=["put", "post"], url_path="lines")
    def save_lines(self, request, pk=None):
        sheet = self._own(pk)
        rows = request.data.get("lines", request.data if isinstance(request.data, list) else [])
        services.save_lines(sheet, rows, actor=request.user)
        sheet.refresh_from_db()
        return Response(TimesheetSerializer(sheet).data)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        sheet = self._own(pk)
        services.submit(sheet, actor=request.user, comment=request.data.get("comment", ""))
        sheet.refresh_from_db()
        return Response(TimesheetSerializer(sheet).data)

    @action(detail=True, methods=["post"], url_path="comments")
    def comment(self, request, pk=None):
        sheet = self._own(pk)
        comment = services.add_comment(sheet, author=request.user, body=request.data.get("body", ""))
        return Response(TimesheetCommentSerializer(comment).data, status=201)

    @action(detail=False, methods=["get"])
    def analytics(self, request):
        org = current_organization(request)
        end = _parse_date(request.query_params.get("end"), timezone.localdate())
        start = _parse_date(request.query_params.get("start"), end - timedelta(days=90))
        return Response(services.analytics(org, start=start, end=end, employee=current_employee(request)))

    def _own(self, pk) -> Timesheet:
        sheet = self.get_queryset().filter(pk=pk).first()
        if sheet is None:
            raise NotFound("Timesheet not found.")
        return sheet


class TimesheetApprovalViewSet(viewsets.ReadOnlyModelViewSet):
    """`/api/timesheets/approvals/` — manager + HR surface.

    Managers see their direct reports; HR/Payroll/Admin see the whole tenant.
    """

    serializer_class = TimesheetSerializer
    permission_classes = [IsAuthenticated, IsManager]
    filterset_fields = ("status",)

    def _scope_employees(self):
        user = self.request.user
        role = getattr(user, "role", "employee")
        if user.is_superuser or role in ("hr", "admin", "super_admin", "payroll", "finance"):
            return None  # whole organization
        return services.team_of(current_employee(self.request))

    def get_queryset(self):
        qs = (
            Timesheet.objects.filter(organization=current_organization(self.request))
            .select_related("period", "employee", "employee__employment")
            .prefetch_related("lines__project", "comments__author")
        )
        employees = self._scope_employees()
        if employees is not None:
            qs = qs.filter(employee__in=employees)
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        return qs.order_by("-period__start_date")

    def get_serializer_class(self):
        return TimesheetListSerializer if self.action == "list" else TimesheetSerializer

    @action(detail=False, methods=["get"])
    def pending(self, request):
        qs = self.get_queryset().filter(status=Timesheet.Status.SUBMITTED)
        return Response(TimesheetSerializer(qs, many=True).data)

    @action(detail=True, methods=["post"])
    def decide(self, request, pk=None):
        sheet = self.get_object()
        approver = services.assert_can_approve(sheet, request.user)
        services.decide(
            sheet,
            decision=request.data.get("decision", ""),
            approver=approver,
            actor=request.user,
            comment=request.data.get("comment", ""),
        )
        sheet.refresh_from_db()
        return Response(TimesheetSerializer(sheet).data)

    @action(detail=True, methods=["post"], url_path="comments",
            permission_classes=[IsAuthenticated, IsManager, CanViewTimesheet])
    def comment(self, request, pk=None):
        sheet = self.get_object()
        comment = services.add_comment(sheet, author=request.user, body=request.data.get("body", ""))
        return Response(TimesheetCommentSerializer(comment).data, status=201)

    @action(detail=False, methods=["get"])
    def analytics(self, request):
        org = current_organization(request)
        end = _parse_date(request.query_params.get("end"), timezone.localdate())
        start = _parse_date(request.query_params.get("start"), end - timedelta(days=90))
        employees = self._scope_employees()
        data = services.analytics(org, start=start, end=end)
        data["utilization_by_employee"] = services.utilization_by_employee(
            org, start=start, end=end, employees=employees
        )
        return Response(data)

    @action(detail=False, methods=["get"])
    def compliance(self, request):
        org = current_organization(request)
        day = _parse_date(request.query_params.get("date"), timezone.localdate())
        return Response(services.compliance(org, day=day, employees=self._scope_employees()))

    @action(detail=False, methods=["post"], url_path="remind")
    def remind(self, request):
        org = current_organization(request)
        day = _parse_date(request.data.get("date"), timezone.localdate())
        return Response({"sent": services.send_reminders(org, day=day)})

    def get_object(self) -> Timesheet:
        sheet = self.get_queryset().filter(pk=self.kwargs["pk"]).first()
        if sheet is None:
            raise NotFound("Timesheet not found.")
        self.check_object_permissions(self.request, sheet)
        return sheet
