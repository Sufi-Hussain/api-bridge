from __future__ import annotations
from .models import AuditEvent


def log_event(*, actor=None, action: str, target=None, organization=None,
              ip: str | None = None, user_agent: str = "", metadata: dict | None = None):
    return AuditEvent.objects.create(
        actor=actor,
        action=action,
        target_type=f"{target._meta.label}" if target is not None else "",
        target_id=str(getattr(target, "pk", "")) if target is not None else "",
        organization=organization,
        ip_address=ip,
        user_agent=(user_agent or "")[:500],
        metadata=metadata or {},
    )
