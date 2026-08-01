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
        read_only_fields = ("employee", "created_at", "updated_at")
