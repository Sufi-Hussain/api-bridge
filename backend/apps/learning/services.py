"""Learning services — reusable by API views and future AI tools."""
from __future__ import annotations

from datetime import date

from django.db import transaction
from rest_framework.exceptions import NotFound, ValidationError

from .models import Certification, Course, Enrollment


def org_courses(employee):
    return Course.objects.filter(organization=employee.organization)


def my_enrollments(employee):
    return Enrollment.objects.filter(employee=employee, organization=employee.organization)


def my_certifications(employee):
    return Certification.objects.filter(employee=employee, organization=employee.organization)


@transaction.atomic
def enroll(employee, course_id) -> Enrollment:
    course = Course.objects.filter(id=course_id, organization=employee.organization).first()
    if course is None:
        raise NotFound("Course not found.")
    enrollment, created = Enrollment.objects.get_or_create(
        employee=employee,
        course=course,
        defaults={"organization": employee.organization, "progress": 0},
    )
    if not created:
        raise ValidationError({"detail": "Already enrolled in this course."})
    return enrollment


@transaction.atomic
def set_progress(employee, course_id, progress: int) -> Enrollment:
    progress = max(0, min(100, int(progress)))
    enrollment = Enrollment.objects.filter(
        employee=employee, course_id=course_id, organization=employee.organization
    ).first()
    if enrollment is None:
        raise NotFound("Enrollment not found.")
    enrollment.progress = progress
    enrollment.completed_on = date.today() if progress >= 100 else None
    enrollment.save(update_fields=["progress", "completed_on", "updated_at"])
    return enrollment
