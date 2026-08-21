from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.common.viewsets import current_organization
from .models import Task
from .serializers import TaskSerializer, TaskCommentSerializer, TaskActivitySerializer
from .services import TaskService

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ("status", "priority", "assignee")
    search_fields = ("title", "description")

    def get_queryset(self):
        org = current_organization(self.request)
        user = self.request.user
        return Task.objects.filter(organization=org).filter(creator=user) | Task.objects.filter(organization=org, assignee=user)

    def perform_create(self, serializer):
        task = TaskService.create(organization=current_organization(self.request), creator=self.request.user, data=serializer.validated_data)
        serializer.instance = task

    def perform_update(self, serializer):
        serializer.instance = TaskService.update(task=self.get_object(), actor=self.request.user, data=serializer.validated_data)

    @action(detail=True, methods=["post"])
    def comments(self, request, pk=None):
        task = self.get_object()
        serializer = TaskCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = TaskService.comment(task, request.user, serializer.validated_data["body"])
        return Response(TaskCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def activity(self, request, pk=None):
        return Response(TaskActivitySerializer(self.get_object().activities.order_by("-created_at"), many=True).data)
