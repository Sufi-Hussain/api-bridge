from __future__ import annotations

from rest_framework import serializers

from .models import (
    Client,
    Project,
    ProjectTask,
    Timesheet,
    TimesheetComment,
    TimesheetLine,
    TimesheetPeriod,
)


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ("id", "name", "code", "is_active")


class ProjectTaskSerializer(serializers.ModelSerializer):
    projectId = serializers.UUIDField(source="project_id", read_only=True)

    class Meta:
        model = ProjectTask
        fields = ("id", "projectId", "name", "billable", "is_active")


class ProjectSerializer(serializers.ModelSerializer):
    clientName = serializers.CharField(source="client.name", read_only=True, default="")
    tasks = ProjectTaskSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = (
            "id", "name", "code", "client", "clientName", "department", "billable",
            "status", "start_date", "end_date", "budget_hours", "tasks",
        )


class TimesheetPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimesheetPeriod
        fields = ("id", "kind", "start_date", "end_date", "due_date", "status")


class TimesheetLineSerializer(serializers.ModelSerializer):
    projectId = serializers.PrimaryKeyRelatedField(source="project", read_only=True)
    taskId = serializers.PrimaryKeyRelatedField(source="task", read_only=True)
    projectName = serializers.CharField(source="project.name", read_only=True, default="")
    taskName = serializers.CharField(source="task.name", read_only=True, default="")

    class Meta:
        model = TimesheetLine
        fields = (
            "id", "date", "projectId", "taskId", "projectName", "taskName",
            "work_type", "hours", "billable", "notes", "locked",
        )


class TimesheetCommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = TimesheetComment
        fields = ("id", "author", "kind", "body", "created_at")

    def get_author(self, obj) -> str:
        return getattr(obj.author, "full_name", "") or getattr(obj.author, "email", "System")


class TimesheetSerializer(serializers.ModelSerializer):
    period = TimesheetPeriodSerializer(read_only=True)
    lines = TimesheetLineSerializer(many=True, read_only=True)
    comments = TimesheetCommentSerializer(many=True, read_only=True)
    employeeName = serializers.SerializerMethodField()
    employeeCode = serializers.CharField(source="employee.employee_id", read_only=True)
    utilization = serializers.SerializerMethodField()
    isEditable = serializers.SerializerMethodField()

    class Meta:
        model = Timesheet
        fields = (
            "id", "period", "status", "employee", "employeeName", "employeeCode",
            "total_hours", "billable_hours", "non_billable_hours", "internal_hours",
            "leave_hours", "holiday_hours", "overtime_hours", "expected_hours",
            "submitted_at", "decided_at", "utilization", "isEditable", "lines", "comments",
        )

    def get_employeeName(self, obj) -> str:
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    def get_utilization(self, obj) -> float:
        return float(obj.utilization)

    def get_isEditable(self, obj) -> bool:
        return obj.status in Timesheet.OPEN_STATES and obj.period.is_editable


class TimesheetListSerializer(TimesheetSerializer):
    class Meta(TimesheetSerializer.Meta):
        fields = tuple(f for f in TimesheetSerializer.Meta.fields if f not in ("lines", "comments"))
