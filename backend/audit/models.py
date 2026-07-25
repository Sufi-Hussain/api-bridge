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
    target_type = models.CharField(max_length=100, blank=True)  # "accounts.Employee"
    target_id = models.CharField(max_length=64, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "-created_at"]),
            models.Index(fields=["action", "-created_at"]),
        ]
        ordering = ["-created_at"]
