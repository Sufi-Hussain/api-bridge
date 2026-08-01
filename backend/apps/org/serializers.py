from __future__ import annotations

from rest_framework import serializers

from .models import BusinessUnit, CostCenter, Department, Location, Organization, Team


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = (
            "id",
            "name",
            "code",
            "legal_name",
            "domain",
            "country",
            "timezone",
            "currency",
            "logo",
            "is_active",
        )


class BusinessUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessUnit
        fields = ("id", "name", "code", "head_name")


class CostCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostCenter
        fields = ("id", "name", "code", "business_unit", "budget_usd")


class LocationSerializer(serializers.ModelSerializer):
    """Matches `Location` in src/services/hr.ts."""

    headcount = serializers.IntegerField(read_only=True)

    class Meta:
        model = Location
        fields = ("id", "name", "city", "country", "address", "timezone", "headcount", "type")


class DepartmentSerializer(serializers.ModelSerializer):
    """Matches `Department` in src/services/hr.ts."""

    head_id = serializers.PrimaryKeyRelatedField(
        source="head", queryset=Department._meta.get_field("head").related_model.objects.all(),
        required=False, allow_null=True,
    )
    head_name = serializers.CharField(read_only=True)
    parent_id = serializers.PrimaryKeyRelatedField(
        source="parent", queryset=Department.objects.all(), required=False, allow_null=True
    )
    headcount = serializers.IntegerField(read_only=True)

    class Meta:
        model = Department
        fields = (
            "id",
            "name",
            "code",
            "head_id",
            "head_name",
            "parent_id",
            "headcount",
            "open_positions",
            "budget_usd",
            "attrition_ytd",
            "cost_center",
        )


class TeamSerializer(serializers.ModelSerializer):
    """Matches `Team` in src/services/hr.ts."""

    department_id = serializers.PrimaryKeyRelatedField(
        source="department", queryset=Department.objects.all()
    )
    lead_id = serializers.PrimaryKeyRelatedField(
        source="lead", queryset=Team._meta.get_field("lead").related_model.objects.all(),
        required=False, allow_null=True,
    )
    members = serializers.IntegerField(read_only=True)

    class Meta:
        model = Team
        fields = ("id", "name", "department_id", "lead_id", "members", "location")
