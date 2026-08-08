import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [("accounts", "0001_initial")]
    operations = [
        migrations.CreateModel(name="AIConversation", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
            ("title", models.CharField(blank=True, max_length=200)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
            ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ai_conversations", to="accounts.organization")),
            ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ai_conversations", to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name="AIDocument", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ("name", models.CharField(max_length=255)), ("source", models.CharField(blank=True, max_length=500)), ("created_at", models.DateTimeField(auto_now_add=True)), ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ai_documents", to="accounts.organization")),
        ]),
        migrations.CreateModel(name="AIInteraction", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ("request_id", models.CharField(db_index=True, max_length=100)), ("provider", models.CharField(default="deepseek", max_length=40)), ("model", models.CharField(blank=True, max_length=100)), ("latency_ms", models.PositiveIntegerField(default=0)), ("prompt_tokens", models.PositiveIntegerField(default=0)), ("completion_tokens", models.PositiveIntegerField(default=0)), ("success", models.BooleanField(default=False)), ("error_code", models.CharField(blank=True, max_length=60)), ("created_at", models.DateTimeField(auto_now_add=True)), ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="accounts.organization")), ("user", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name="AIMessage", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ("role", models.CharField(choices=[("user", "User"), ("assistant", "Assistant"), ("system", "System"), ("tool", "Tool")], max_length=16)), ("content", models.TextField()), ("citations", models.JSONField(blank=True, default=list)), ("metadata", models.JSONField(blank=True, default=dict)), ("created_at", models.DateTimeField(auto_now_add=True)), ("conversation", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="messages", to="ai.aiconversation")),
        ]),
        migrations.CreateModel(name="AIToolExecution", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ("name", models.CharField(max_length=100)), ("status", models.CharField(default="completed", max_length=20)), ("input", models.JSONField(blank=True, default=dict)), ("output", models.JSONField(blank=True, default=dict)), ("created_at", models.DateTimeField(auto_now_add=True)), ("conversation", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tool_executions", to="ai.aiconversation")),
        ]),
        migrations.CreateModel(name="AIDocumentChunk", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ("content", models.TextField()), ("metadata", models.JSONField(blank=True, default=dict)), ("embedding", models.JSONField(blank=True, null=True)), ("created_at", models.DateTimeField(auto_now_add=True)), ("document", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="chunks", to="ai.aidocument")),
        ]),
    ]
