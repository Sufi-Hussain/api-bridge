from django.utils import timezone
from django.db import transaction
from .models import Task, TaskComment, TaskActivity

class TaskService:
    @staticmethod
    @transaction.atomic
    def create(*, organization, creator, data):
        task = Task.objects.create(organization=organization, creator=creator, **data)
        TaskService.activity(task, creator, "created")
        return task

    @staticmethod
    @transaction.atomic
    def update(*, task, actor, data):
        for key, value in data.items(): setattr(task, key, value)
        if task.status == Task.Status.COMPLETED and not task.completed_at: task.completed_at = timezone.now()
        task.save()
        TaskService.activity(task, actor, "updated", {"fields": list(data)})
        return task

    @staticmethod
    def comment(task, author, body):
        comment = TaskComment.objects.create(organization=task.organization, task=task, author=author, body=body)
        TaskService.activity(task, author, "commented")
        return comment

    @staticmethod
    def activity(task, actor, action, metadata=None):
        return TaskActivity.objects.create(organization=task.organization, task=task, actor=actor, action=action, metadata=metadata or {})
