from __future__ import annotations

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsHR
from apps.common.viewsets import OrgScopedViewSet, current_organization

from .models import BusinessUnit, CostCenter, Department, Location, Team
from .serializers import (
    BusinessUnitSerializer,
    CostCenterSerializer,
    DepartmentSerializer,
    LocationSerializer,
    OrganizationSerializer,
    TeamSerializer,
)
from .services import update_organization


class OrganizationProfileView(APIView):
    """GET/PATCH the caller's own organization only."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(OrganizationSerializer(current_organization(request)).data)

    def patch(self, request):
        self.permission_classes = [IsHR]
        self.check_permissions(request)
        org = current_organization(request)
        serializer = OrganizationSerializer(org, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        update_organization(org, serializer.validated_data)
        return Response(OrganizationSerializer(org).data)


class DepartmentViewSet(OrgScopedViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    select_related = ("head", "parent")
    search_fields = ("name", "code", "cost_center")
    ordering_fields = ("name", "budget_usd", "attrition_ytd")


class TeamViewSet(OrgScopedViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    select_related = ("department", "lead")
    filterset_fields = ("department",)
    search_fields = ("name", "location")


class LocationViewSet(OrgScopedViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    filterset_fields = ("type", "country")
    search_fields = ("name", "city", "country")


class BusinessUnitViewSet(OrgScopedViewSet):
    queryset = BusinessUnit.objects.all()
    serializer_class = BusinessUnitSerializer
    search_fields = ("name", "code")


class CostCenterViewSet(OrgScopedViewSet):
    queryset = CostCenter.objects.all()
    serializer_class = CostCenterSerializer
    search_fields = ("name", "code")
