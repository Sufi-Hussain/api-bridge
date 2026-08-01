from rest_framework import serializers

from apps.ess.models import Employee

from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class HRDirectoryEmployeeSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="employment.job_title", read_only=True, default="")
    department = serializers.CharField(source="employment.department", read_only=True, default="")
    location = serializers.CharField(source="employment.location", read_only=True, default="")
    grade = serializers.CharField(source="employment.grade", read_only=True, default="")

    class Meta:
        model = Employee
        fields = (
            "id",
            "employee_id",
            "first_name",
            "last_name",
            "work_email",
            "mobile",
            "job_title",
            "department",
            "location",
            "grade",
        )
