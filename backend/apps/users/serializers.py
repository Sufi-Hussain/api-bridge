from __future__ import annotations

from rest_framework import serializers

from .models import ActivityEvent, Invitation, MessageThread, User, UserSession


class UserSerializer(serializers.ModelSerializer):
    organization_id = serializers.UUIDField(source="organization.id", read_only=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "avatar",
            "is_active",
            "date_joined",
            "mfa_enabled",
            "organization_id",
            "organization_name",
        )
        read_only_fields = ("id", "date_joined", "is_active")


ROLE_PERMISSIONS: dict[str, list[str]] = {
    "employee": ["ess.read", "ess.write", "leave.apply", "attendance.punch"],
    "manager": [
        "ess.read",
        "ess.write",
        "leave.apply",
        "leave.approve",
        "attendance.punch",
        "team.read",
        "performance.review",
    ],
    "hr": [
        "ess.read",
        "ess.write",
        "hr.read",
        "hr.write",
        "recruitment.manage",
        "performance.manage",
        "compensation.read",
        "leave.approve",
        "engagement.manage",
        "compliance.read",
    ],
    "admin": ["*"],
}


class MeSerializer(UserSerializer):
    name = serializers.SerializerMethodField()
    employee_id = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + (
            "name",
            "employee_id",
            "job_title",
            "department",
            "roles",
            "permissions",
        )

    def get_name(self, obj: User) -> str:
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email

    def _employment(self, obj: User):
        emp = getattr(obj, "employee", None)
        return getattr(emp, "employment", None) if emp else None

    def get_employee_id(self, obj: User) -> str:
        emp = getattr(obj, "employee", None)
        return emp.employee_id if emp else ""

    def get_job_title(self, obj: User) -> str:
        employment = self._employment(obj)
        return employment.job_title if employment else ""

    def get_department(self, obj: User) -> str:
        employment = self._employment(obj)
        return employment.department if employment else ""

    def get_roles(self, obj: User) -> list[str]:
        return [obj.role]

    def get_permissions(self, obj: User) -> list[str]:
        return ROLE_PERMISSIONS.get(obj.role, [])


class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = ("id", "email", "role", "status", "expires_at", "created_at")
        read_only_fields = ("status", "created_at")


class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ("id", "device", "browser", "os", "location", "ip", "last_active", "current")


class ActivityEventSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField(source="occurred_at", read_only=True)

    class Meta:
        model = ActivityEvent
        fields = ("id", "time", "type", "title", "detail", "ip", "device")


class MessageThreadSerializer(serializers.ModelSerializer):
    with_ = serializers.CharField(source="with_name", read_only=True)
    time = serializers.DateTimeField(source="last_message_at", read_only=True)

    class Meta:
        model = MessageThread
        fields = ("id", "with_", "role", "last_message", "unread", "time", "online")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["with"] = data.pop("with_", None) or data.pop("with", None)
        return data
