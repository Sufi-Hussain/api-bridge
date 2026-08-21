from rest_framework import serializers
from .models import Task, TaskComment, TaskActivity

class TaskCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskComment
        fields = "__all__"
        read_only_fields = ("organization", "author")

class TaskActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskActivity
        fields = "__all__"
        read_only_fields = ("organization", "actor")

class TaskSerializer(serializers.ModelSerializer):
    comments = TaskCommentSerializer(many=True, read_only=True)
    activities = TaskActivitySerializer(many=True, read_only=True)
    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ("organization", "creator", "completed_at", "comments", "activities")

    def validate_assignee(self, value):
        if value is None:
            return value
        organization = self.context["request"].organization
        if getattr(value, "organization_id", None) != organization.id:
            raise serializers.ValidationError("Assignee must belong to the current organization.")
        return value
