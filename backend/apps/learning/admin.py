from django.contrib import admin

from .models import (
    Course,
    Enrollment,
    TrainingProgram,
    Certification,
    SkillMatrixEntry,
)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "provider",
        "category",
        "level",
        "duration_hours",
        "rating",
        "mandatory",
    )
    list_filter = (
        "level",
        "category",
        "provider",
        "mandatory",
    )
    search_fields = (
        "title",
        "provider",
        "category",
    )
    ordering = ("title",)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "course",
        "progress",
        "completed_on",
        "due_date",
    )
    list_filter = (
        "completed_on",
        "due_date",
    )
    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "course__title",
    )
    ordering = ("-created_at",)
    autocomplete_fields = (
        "employee",
        "course",
    )


@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "format",
        "duration_hrs",
        "enrolled",
        "completed",
        "rating",
        "status",
        "mandatory",
    )
    list_filter = (
        "format",
        "status",
        "category",
        "mandatory",
    )
    search_fields = (
        "name",
        "category",
    )
    ordering = ("name",)


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "name",
        "issuer",
        "credential_id",
        "issued_on",
        "expires_on",
        "status",
    )
    list_filter = (
        "status",
        "issuer",
        "issued_on",
        "expires_on",
    )
    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "name",
        "issuer",
        "credential_id",
    )
    ordering = ("-issued_on",)
    autocomplete_fields = ("employee",)


@admin.register(SkillMatrixEntry)
class SkillMatrixEntryAdmin(admin.ModelAdmin):
    list_display = (
        "skill",
        "category",
        "beginner",
        "intermediate",
        "advanced",
        "expert",
        "gap",
    )
    list_filter = (
        "category",
    )
    search_fields = (
        "skill",
        "category",
    )
    ordering = ("skill",)