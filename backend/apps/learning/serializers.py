from __future__ import annotations

from rest_framework import serializers

from .models import Certification, Course, Enrollment


class MyCourseSerializer(serializers.ModelSerializer):
    """Course + the caller's enrollment (matches the frontend `Course`)."""

    enrolled = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    completed_on = serializers.SerializerMethodField()
    due_date = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "provider",
            "category",
            "level",
            "duration_hours",
            "rating",
            "cover",
            "mandatory",
            "enrolled",
            "progress",
            "completed_on",
            "due_date",
        )

    def _enrollment(self, obj):
        return (self.context.get("enrollments") or {}).get(obj.id)

    def get_enrolled(self, obj) -> bool:
        return self._enrollment(obj) is not None

    def get_progress(self, obj) -> int:
        e = self._enrollment(obj)
        return e.progress if e else 0

    def get_completed_on(self, obj):
        e = self._enrollment(obj)
        return e.completed_on if e else None

    def get_due_date(self, obj):
        e = self._enrollment(obj)
        return e.due_date if e else None


class EnrollmentSerializer(serializers.ModelSerializer):
    course_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Enrollment
        fields = ("id", "course_id", "progress", "completed_on", "due_date")
        read_only_fields = ("id", "completed_on")


class CertificationSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = (
            "id",
            "name",
            "issuer",
            "credential_id",
            "issued_on",
            "expires_on",
            "status",
        )

    def get_status(self, obj) -> str:
        # Frontend expects active | expiring | expired.
        return {"valid": "active"}.get(obj.status, obj.status)
