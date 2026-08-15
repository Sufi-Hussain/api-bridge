from rest_framework import serializers

from .models import AttendancePunch, TimesheetEntry


class AttendancePunchSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendancePunch
        fields = "__all__"
        read_only_fields = ("employee", "created_at", "updated_at")


class TimesheetEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimesheetEntry
        fields = "__all__"
        read_only_fields = ("employee", "regular_hours", "overtime_hours", "status", "created_at", "updated_at")

    def validate_hours(self, value):
        if value <= 0 or value > 24:
            raise serializers.ValidationError("Hours must be greater than 0 and no more than 24.")
        return value

    def validate(self, attrs):
        if attrs.get("date") and attrs["date"].weekday() >= 5:
            raise serializers.ValidationError({"date": "Timesheets cannot be logged on weekends."})
        return attrs
