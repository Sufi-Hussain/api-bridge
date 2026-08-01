from __future__ import annotations

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Education,
    EmergencyContact,
    EmployeeSkill,
    Experience,
    FamilyMember,
)
from .selectors import get_employee_for_user
from .serializers import (
    EducationSerializer,
    EmergencyContactSerializer,
    EmployeeProfileSerializer,
    EmployeeSkillSerializer,
    ExperienceSerializer,
    FamilyMemberSerializer,
)
from .services import update_employee


def _my_employee(request):
    emp = get_employee_for_user(request.user)
    print("Employee: ", EmployeeProfileSerializer(emp).data)
    if not emp:
        raise NotFound("Employee profile not found for current user.")
    return emp


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    print("Profile vies is called...")
    def get(self, request):
        print("Profile get method is called...")
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
        payload = {k: v for k, v in request.data.items() if k in allowed}
        update_employee(emp, payload)
        return Response(EmployeeProfileSerializer(emp).data)


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
