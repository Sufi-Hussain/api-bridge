from rest_framework import serializers
from .models import LifecycleRecord, LifecycleChecklistItem, LifecycleApproval, LifecycleAsset

class ChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = LifecycleChecklistItem
        fields = "__all__"
        read_only_fields = ("lifecycle", "completed_at")

class ApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = LifecycleApproval
        fields = "__all__"
        read_only_fields = ("lifecycle", "decided_at")

class LifecycleSerializer(serializers.ModelSerializer):
    checklist = ChecklistSerializer(source="checklist_items", many=True, read_only=True)
    completion = serializers.IntegerField(source="completion_percent", read_only=True)
    employee_name = serializers.SerializerMethodField()

    def get_employee_name(self, obj):
        return str(obj.employee)

    class Meta:
        model = LifecycleRecord
        fields = "__all__"
        read_only_fields = ("organization", "employee", "status", "hr_verified_at", "access_revoked_at", "completed_at", "checklist", "completion", "employee_name")

class LifecycleActionSerializer(serializers.Serializer):
    target = serializers.ChoiceField(choices=LifecycleRecord.Status.choices)
    comment = serializers.CharField(required=False, allow_blank=True)
    last_working_day = serializers.DateField(required=False)
    exit_reason = serializers.CharField(required=False, allow_blank=True)
    exit_type = serializers.ChoiceField(choices=LifecycleRecord.ExitType.choices, required=False)
