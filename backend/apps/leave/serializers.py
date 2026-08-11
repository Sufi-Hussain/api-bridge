from rest_framework import serializers

from .models import Holiday, LeaveRequest, LeaveType


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ("id", "code", "name", "annual_quota")


class LeaveRequestSerializer(serializers.ModelSerializer):
    """Shaped to the frontend `LeaveRequest` contract."""

    # Read side
    type = serializers.CharField(source="type.name", read_only=True)
    from_ = serializers.DateField(source="from_date", read_only=True)
    approver = serializers.SerializerMethodField()
    applied_on = serializers.DateTimeField(read_only=True)

    # Write side (frontend sends { type, from, to, reason })
    type_code = serializers.CharField(write_only=True, required=False)
    from_date = serializers.DateField(write_only=True, required=False)
    to_date = serializers.DateField(write_only=True, required=False)
    half_day = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = LeaveRequest
        fields = (
            "id",
            "type",
            "from_",
            "to",
            "days",
            "reason",
            "status",
            "approver",
            "applied_on",
            "attachment",
            "type_code",
            "from_date",
            "to_date",
            "half_day",
        )
        read_only_fields = ("id", "days", "status", "applied_on")

    to = serializers.DateField(source="to_date", read_only=True)

    def get_approver(self, obj) -> str:
        if obj.approver_id is None:
            return ""
        return f"{obj.approver.first_name} {obj.approver.last_name}".strip()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # The frontend expects `from` / `to`; `from` is a Python keyword so the
        # field is declared as `from_` and renamed here.
        data["from"] = data.pop("from_", None)
        return data


class LeaveBalanceSerializer(serializers.Serializer):
    id = serializers.CharField()
    code = serializers.CharField()
    type = serializers.CharField()
    total = serializers.FloatField()
    used = serializers.FloatField()
    pending = serializers.FloatField()
    available = serializers.FloatField()
    color = serializers.CharField()


class HolidaySerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()

    class Meta:
        model = Holiday
        fields = ("id", "name", "date", "region", "type")

    def get_type(self, obj) -> str:
        return "restricted" if "restricted" in (obj.region or "").lower() else "public"
