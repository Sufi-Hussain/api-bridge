from __future__ import annotations

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsEmployee
from apps.common.viewsets import current_employee

from . import services
from .serializers import CertificationSerializer, MyCourseSerializer


class MyCourseViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsEmployee]
    serializer_class = MyCourseSerializer

    def get_queryset(self):
        return services.org_courses(current_employee(self.request))

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        emp = current_employee(self.request)
        ctx["enrollments"] = {e.course_id: e for e in services.my_enrollments(emp)}
        return ctx

    @action(detail=True, methods=["post"], url_path="enroll")
    def enroll(self, request, pk=None):
        services.enroll(current_employee(request), pk)
        course = self.get_object()
        return Response(self.get_serializer(course).data, status=201)

    @action(detail=True, methods=["post"], url_path="progress")
    def progress(self, request, pk=None):
        services.set_progress(
            current_employee(request), pk, request.data.get("progress", 0)
        )
        course = self.get_object()
        return Response(self.get_serializer(course).data)


class MyCertificationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsEmployee]
    serializer_class = CertificationSerializer

    def get_queryset(self):
        return services.my_certifications(current_employee(self.request))
