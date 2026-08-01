from __future__ import annotations
from .models import AuditEvent
from django.contrib.contenttypes.models import ContentType


def log_event(*, actor=None, action: str, target=None, organization=None,
              ip: str | None = None, user_agent: str = "", metadata: dict | None = None):
    content_type = ContentType.objects.get_for_model(target) if target is not None else None
    object_id = str(target.pk) if target is not None else None

    return AuditEvent.objects.create(
        actor=actor,
        action=action,
        content_type=content_type,
        object_id=object_id,
        organization=organization,
        ip_address=ip,
        user_agent=(user_agent or "")[:500],
        metadata=metadata or {},
    )