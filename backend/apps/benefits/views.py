"""ESS benefits / expenses / travel / loans endpoints.

Every queryset is derived from ``request.user`` — the employee and the
organization are never taken from the request payload.
"""
from __future__ import annotations

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsEmployee
from apps.common.viewsets import current_employee, current_organization

from . import services
from .serializers import (
    BenefitSerializer,
    EnrollSerializer,
    ExpenseClaimSerializer,
    LoanSerializer,
    MyBenefitSerializer,
    TravelRequestSerializer,
)


class EssViewSetMixin:
    permission_classes = [IsAuthenticated, IsEmployee]

    @property
    def employee(self):
        return current_employee(self.request)


class MyBenefitViewSet(EssViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = MyBenefitSerializer

    def get_queryset(self):
        return services.my_enrollments(self.employee)

    @action(detail=False, methods=["get"], url_path="catalog")
    def catalog(self, request):
        qs = services.available_benefits(current_organization(request))
        return Response(BenefitSerializer(qs, many=True).data)

    @action(detail=False, methods=["post"], url_path="enroll")
    def enroll(self, request):
        payload = EnrollSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        enrollment = services.enroll(self.employee, payload.validated_data["benefit_id"])
        return Response(MyBenefitSerializer(enrollment).data, status=201)


class MyExpenseViewSet(
    EssViewSetMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ExpenseClaimSerializer
    filterset_fields = ("status", "category")

    def get_queryset(self):
        return services.my_expenses(self.employee)

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        claim = services.submit_expense(self.employee, **ser.validated_data)
        return Response(self.get_serializer(claim).data, status=201)


class MyTravelViewSet(
    EssViewSetMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = TravelRequestSerializer

    def get_queryset(self):
        return services.my_travel_requests(self.employee)

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        obj = services.submit_travel(self.employee, **ser.validated_data)
        return Response(self.get_serializer(obj).data, status=201)


class MyLoanViewSet(EssViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = LoanSerializer

    def get_queryset(self):
        return services.my_loans(self.employee)
