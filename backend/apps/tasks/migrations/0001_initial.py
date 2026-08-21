from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid

class Migration(migrations.Migration):
    initial = True
    dependencies = [("accounts", "0001_initial")]
    operations = [
        migrations.CreateModel(name="Task", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
            ("title", models.CharField(max_length=200)), ("description", models.TextField(blank=True)),
            ("status", models.CharField(choices=[("todo", "To do"), ("in_progress", "In progress"), ("completed", "Completed"), ("cancelled", "Cancelled")], default="todo", max_length=20)),
            ("priority", models.CharField(choices=[("low", "Low"), ("medium", "Medium"), ("high", "High"), ("urgent", "Urgent")], default="medium", max_length=10)),
            ("due_date", models.DateField(blank=True, null=True)), ("completed_at", models.DateTimeField(blank=True, null=True)),
            ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tasks_task_set", to="accounts.organization")),
            ("creator", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="created_tasks", to=settings.AUTH_USER_MODEL)),
            ("assignee", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="assigned_tasks", to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name="TaskComment", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)), ("body", models.TextField()),
            ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tasks_taskcomment_set", to="accounts.organization")),
            ("task", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comments", to="tasks.task")), ("author", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name="TaskActivity", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)), ("action", models.CharField(max_length=80)), ("metadata", models.JSONField(default=dict)),
            ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tasks_taskactivity_set", to="accounts.organization")),
            ("task", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="activities", to="tasks.task")), ("actor", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
        ]),
    ]
