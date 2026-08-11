from __future__ import annotations

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsEmployee
from apps.common.viewsets import current_employee

from . import services
from .models import LeaveRequest, LeaveType
from .serializers import (
    HolidaySerializer,
    LeaveBalanceSerializer,
    LeaveRequestSerializer,
    LeaveTypeSerializer,
)


class LeaveTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAuthenticated, IsEmployee]


class HolidayViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HolidaySerializer
    permission_classes = [IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return services.holidays()


class LeaveRequestViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated, IsEmployee]
    filterset_fields = ("status",)

    def get_queryset(self):
        return services.my_leave_requests(current_employee(self.request))

    def create(self, request, *args, **kwargs):
        emp = current_employee(request)
        data = request.data
        code_or_name = data.get("type_code") or data.get("type") or ""
        leave_type = (
            LeaveType.objects.filter(code__iexact=code_or_name).first()
            or LeaveType.objects.filter(name__iexact=code_or_name).first()
        )
        if leave_type is None:
            raise ValidationError({"type": "Unknown leave type."})

        ser = self.get_serializer(data=data)
        ser.is_valid(raise_exception=True)
        from_date = ser.validated_data.get("from_date") or data.get("from")
        to_date = ser.validated_data.get("to_date") or data.get("to")
        if not from_date or not to_date:
            raise ValidationError({"from": "Start and end dates are required."})

        obj = services.apply_leave(
            employee=emp,
            leave_type=leave_type,
            from_date=from_date,
            to_date=to_date,
            reason=data.get("reason", ""),
            half_day=bool(ser.validated_data.get("half_day")),
            attachment=request.data.get("attachment") or None,
        )
        return Response(self.get_serializer(obj).data, status=201)

    @action(detail=True, methods=["post", "delete"], url_path="cancel")
    def cancel(self, request, pk=None):
        obj = services.cancel_leave(employee=current_employee(request), request_id=pk)
        return Response(self.get_serializer(obj).data)

    def destroy(self, request, *args, **kwargs):
        obj = services.cancel_leave(
            employee=current_employee(request), request_id=kwargs["pk"]
        )
        return Response(self.get_serializer(obj).data)

    @action(detail=False, methods=["get"], url_path="balances")
    def balances(self, request):
        rows = services.leave_balances(current_employee(request))
        return Response(LeaveBalanceSerializer(rows, many=True).data)
