from rest_framework import decorators, response, viewsets
from apps.common.permissions import IsHR
from apps.common.viewsets import current_organization
from apps.ess.models import Employee
from .models import LifecycleRecord, LifecycleChecklistItem
from .serializers import LifecycleSerializer, LifecycleActionSerializer, ChecklistSerializer
from .services import create_record, advance

class LifecycleViewSet(viewsets.ModelViewSet):
    serializer_class = LifecycleSerializer
    permission_classes = [IsHR]

    def get_queryset(self):
        return LifecycleRecord.objects.filter(organization=current_organization(self.request)).select_related("employee", "manager").prefetch_related("checklist_items")

    def perform_create(self, serializer):
        organization = current_organization(self.request)
        employee_id = self.request.data.get("employee")
        employee = Employee.objects.get(id=employee_id, organization=organization)
        record = create_record(organization=organization, employee=employee, actor=self.request.user, **serializer.validated_data)
        serializer.instance = record

    @decorators.action(detail=True, methods=["post"])
    def transition(self, request, pk=None):
        record = self.get_object()
        data = LifecycleActionSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        values = {k: v for k, v in data.validated_data.items() if k != "target"}
        return response.Response(LifecycleSerializer(advance(record, data.validated_data["target"], request.user, **values)).data)

    @decorators.action(detail=True, methods=["get", "patch"])
    def checklist(self, request, pk=None):
        record = self.get_object()
        if request.method == "GET": return response.Response(ChecklistSerializer(record.checklist_items.all(), many=True).data)
        item = record.checklist_items.get(id=request.data.get("id"))
        item.completed = bool(request.data.get("completed")); item.completed_at = __import__("django.utils.timezone", fromlist=["now"]).now() if item.completed else None; item.save()
        return response.Response(ChecklistSerializer(item).data)
