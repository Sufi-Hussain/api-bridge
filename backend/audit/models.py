"""
Audit logging. Import `log_event` from anywhere:

    from audit.services import log_event
    log_event(actor=request.user, action="employee.update",
              target=obj, organization=request.organization,
              metadata={"changed_fields": [...]})

Also ships a signal handler that records login/logout/failed-login via
django.contrib.auth signals (wire in apps.py's ready()).
"""
from __future__ import annotations

import uuid

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class AuditEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="+",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="audit_actions",
    )
    action = models.CharField(max_length=100, db_index=True)   # "employee.update"

    # Generic relation to the affected record. object_id is a CharField
    # (not IntegerField) because target PKs in this project are UUIDs.
    content_type = models.ForeignKey(
        ContentType, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="+",
    )
    object_id = models.CharField(max_length=64, null=True, blank=True)
    target = GenericForeignKey("content_type", "object_id")

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "-created_at"]),
            models.Index(fields=["action", "-created_at"]),
            models.Index(fields=["content_type", "object_id"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.action} @ {self.created_at:%Y-%m-%d %H:%M}"