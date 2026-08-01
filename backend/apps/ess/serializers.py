from __future__ import annotations

from rest_framework import serializers

from .models import (
    Address,
    BankAccount,
    Education,
    EmergencyContact,
    Employee,
    Employment,
    EmployeeSkill,
    Experience,
    FamilyMember,
    Skill,
)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        exclude = ("employee", "created_at", "updated_at")


class ManagerRefSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ("id", "name", "title")

    def get_name(self, obj: Employee) -> str:
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_title(self, obj: Employee) -> str:
        return getattr(getattr(obj, "employment", None), "job_title", "") or ""


class EmploymentSerializer(serializers.ModelSerializer):
    manager = ManagerRefSerializer(read_only=True)
    manager_id = serializers.PrimaryKeyRelatedField(
        source="manager",
        queryset=Employee.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )
    tenure = serializers.SerializerMethodField()

    class Meta:
        model = Employment
        exclude = ("employee", "created_at", "updated_at")

    def get_tenure(self, obj: Employment) -> str:
        from datetime import date

        if not obj.join_date:
            return ""
        today = date.today()
        months = (today.year - obj.join_date.year) * 12 + (today.month - obj.join_date.month)
        return f"{months // 12}y {months % 12}m"


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")


class FamilyMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMember
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")


class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        exclude = ("employee", "created_at", "updated_at")


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ("id", "name")


class EmployeeSkillSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="skill.name", read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        source="skill", queryset=Skill.objects.all(), write_only=True
    )

    class Meta:
        model = EmployeeSkill
        fields = ("id", "name", "level", "endorsed", "skill_id", "employee")
        read_only_fields = ("employee",)


class EmployeeProfileSerializer(serializers.ModelSerializer):
    """Nested profile matching frontend `EmployeeProfile` interface."""

    address = AddressSerializer(read_only=True)
    employment = EmploymentSerializer(read_only=True)
    emergency = EmergencyContactSerializer(source="emergency_contacts", many=True, read_only=True)
    family = FamilyMemberSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    bank = BankAccountSerializer(read_only=True)
    skills = EmployeeSkillSerializer(many=True, read_only=True)

    class Meta:
        model = Employee
        fields = (
            "id",
            "employee_id",
            "first_name",
            "last_name",
            "preferred_name",
            "gender",
            "dob",
            "marital_status",
            "nationality",
            "blood_group",
            "personal_email",
            "work_email",
            "mobile",
            "work_phone",
            "address",
            "employment",
            "emergency",
            "family",
            "education",
            "experience",
            "bank",
            "skills",
        )
