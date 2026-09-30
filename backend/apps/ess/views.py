from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.payroll.selectors import get_next_payday
from apps.attendance.models import AttendancePunch, TimesheetEntry
from apps.leave.models import Holiday, LeaveRequest
from apps.payroll.models import Payslip
from apps.performance.models import Goal

from .models import (
    Education,
    Employee,
    EmergencyContact,
    EmployeeSkill,
    Experience,
    FamilyMember,
    Skill,
)
from .selectors import get_employee_for_user
from .serializers import (
    DirectoryPersonSerializer,
    EducationSerializer,    
    SkillSerializer,
    EmergencyContactSerializer,
    EmployeeProfileSerializer,
    EmployeeSkillSerializer,
    ExperienceSerializer,
    FamilyMemberSerializer,
)
from .services import update_address as _update_address
from .services import update_bank as _update_bank
from .services import update_employee


def _my_employee(request):
    emp = get_employee_for_user(request.user)
    if not emp:
        raise NotFound("Employee profile not found for current user.")
    return emp


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employee = _my_employee(request)
        today = timezone.localdate()
        start = today - timedelta(days=29)
        week_start = today - timedelta(days=today.weekday())
        previous_start = week_start - timedelta(days=7)
        punches = AttendancePunch.objects.filter(employee=employee, date__gte=start, date__lte=today)
        attendance = list(punches.values("date", "status", "worked_hours"))
        payroll = list(Payslip.objects.filter(employee=employee).order_by("month").values("id", "month", "gross", "net", "status"))
        next_payday = get_next_payday(employee)
        goals = Goal.objects.filter(owner=employee)
        employment = getattr(employee, "employment", None)
        manager = employment.manager if employment else None
        team = []
        if manager:
            team.append({"id": str(manager.id), "name": str(manager), "role": getattr(manager.employment, "job_title", "")})
        team.extend({"id": str(e.id), "name": str(e), "role": getattr(e.employment, "job_title", "")} for e in Employee.objects.filter(employment__manager=manager).exclude(id=employee.id).select_related("employment"))
        required = [employee.first_name, employee.last_name, employee.work_email, employee.mobile, employment and employment.job_title, employment and employment.department]
        complete = sum(bool(value) for value in required)
        missing = [label for label, value in zip(("first name", "last name", "work email", "mobile", "job title", "department"), required) if not value]
        week_hours = punches.filter(date__gte=week_start).aggregate(total=Sum("worked_hours"))["total"] or Decimal("0")
        previous_hours = punches.filter(date__gte=previous_start, date__lt=week_start).aggregate(total=Sum("worked_hours"))["total"] or Decimal("0")
        pending_leave = LeaveRequest.objects.filter(employee=employee, status=LeaveRequest.Status.PENDING).count()
        missing_timesheets = TimesheetEntry.objects.filter(employee=employee, date__gte=week_start, status=TimesheetEntry.Status.DRAFT).count()
        return Response({
            "attendanceTrend": [{"date": row["date"], "status": row["status"], "hours": row["worked_hours"]} for row in attendance],
            "payrollTrend": payroll,
            "nextPayday": next_payday,
            "weeklyHours": {"worked": week_hours, "target": Decimal("40"), "previous": previous_hours},
            "goals": {"onTrack": goals.filter(status__in=[Goal.Status.ON_TRACK, Goal.Status.COMPLETED]).count(), "total": goals.count()},
            "insights": ([{"type": "action", "message": f"You have {pending_leave} pending leave request(s)."}] if pending_leave else []) + ([{"type": "action", "message": f"You have {missing_timesheets} draft timesheet entries."}] if missing_timesheets else []) + ([{"type": "profile", "message": f"Complete your profile: {', '.join(missing)}."}] if missing else []),
            "team": team,
            "profileStatus": {"completed": complete, "total": len(required), "percentage": round(complete / len(required) * 100), "missing": missing},
            "holidays": list(Holiday.objects.filter(date__gte=today).values("id", "name", "date", "region")),
        })


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(EmployeeProfileSerializer(_my_employee(request)).data)

    def patch(self, request):
        emp = _my_employee(request)
        allowed = {
            "first_name",
            "last_name",
            "preferred_name",
            "gender",
            "dob",
            "marital_status",
            "nationality",
            "blood_group",
            "personal_email",
            "mobile",
            "work_phone",
        }
        payload = dict(request.data)

        # ----- OneToOne sub-records: extract before filtering the top-level keys.
        # We accept an optional nested dict for each sub-record and write it
        # through the service layer (which does create-or-update safely).
        address_data = payload.pop("address", None)
        bank_data = payload.pop("bank", None)
        # -------------------------------------------------------------------

        employee_payload = {k: v for k, v in payload.items() if k in allowed}
        if employee_payload:
            update_employee(emp, employee_payload)

        if address_data is not None and isinstance(address_data, dict):
            # Only keep fields the model actually exposes — drop unknown keys.
            clean = {
                k: v
                for k, v in address_data.items()
                if k in {"line1", "line2", "city", "state", "country", "postal"}
            }
            _update_address(emp, clean)

        if bank_data is not None and isinstance(bank_data, dict):
            clean = {
                k: v
                for k, v in bank_data.items()
                if k in {"account_name", "account_number", "ifsc", "bank", "branch", "type"}
            }
            _update_bank(emp, clean)

        # Re-select the employee so select_related returns the fresh rows.
        refreshed = get_employee_for_user(request.user) or emp
        return Response(EmployeeProfileSerializer(refreshed).data)


class DirectoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Colleague directory, always scoped to the caller's organization."""

    serializer_class = DirectoryPersonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        emp = get_employee_for_user(self.request.user)
        if not emp or emp.organization_id is None:
            return Employee.objects.none()
        return (
            Employee.objects.filter(organization_id=emp.organization_id)
            .select_related("employment")
            .order_by("first_name", "last_name")
        )


class OwnedViewSet(viewsets.ModelViewSet):
    """Base viewset scoping objects to the current user's employee record."""

    permission_classes = [IsAuthenticated]
    related_name: str = ""

    def get_queryset(self):
        emp = get_employee_for_user(self.request.user)
        if not emp:
            return self.serializer_class.Meta.model.objects.none()
        return getattr(emp, self.related_name).all()

    def perform_create(self, serializer):
        emp = _my_employee(self.request)
        serializer.save(employee=emp)


class EmergencyContactViewSet(OwnedViewSet):
    serializer_class = EmergencyContactSerializer
    related_name = "emergency_contacts"


class FamilyViewSet(OwnedViewSet):
    serializer_class = FamilyMemberSerializer
    related_name = "family"


class EducationViewSet(OwnedViewSet):
    serializer_class = EducationSerializer
    related_name = "education"


class ExperienceViewSet(OwnedViewSet):
    serializer_class = ExperienceSerializer
    related_name = "experience"


class SkillViewSet(OwnedViewSet):
    serializer_class = EmployeeSkillSerializer
    related_name = "skills"

class SkillCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = Skill.objects.all().order_by("name")
        return Response(SkillSerializer(skills, many=True).data)