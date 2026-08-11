from __future__ import annotations

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsEmployee
from apps.common.viewsets import current_employee

from . import services
from .serializers import MyGoalSerializer, MyReviewSerializer


class MyGoalViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsEmployee]
    serializer_class = MyGoalSerializer

    def get_queryset(self):
        return services.my_goals(current_employee(self.request))


class MyReviewViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsEmployee]
    serializer_class = MyReviewSerializer

    def get_queryset(self):
        return services.my_reviews(current_employee(self.request))
