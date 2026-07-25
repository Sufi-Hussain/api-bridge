"""
accounts.services.tokens
========================

One-time tokens for email verification, password reset, invites.
We store only a SHA-256 hash of the token; the raw value goes in the URL.
"""
from __future__ import annotations
import hashlib
import secrets
from datetime import timedelta
from django.utils import timezone
from ..models import OneTimeToken


def _hash(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def issue(user, kind: str, ttl_minutes: int = 60) -> str:
    raw = secrets.token_urlsafe(48)
    OneTimeToken.objects.create(
        user=user,
        kind=kind,
        token_hash=_hash(raw),
        expires_at=timezone.now() + timedelta(minutes=ttl_minutes),
    )
    return raw


def consume(raw: str, kind: str):
    """Returns the User if the token is valid and unused; else None."""
    if not raw:
        return None
    row = (
        OneTimeToken.objects
        .select_related("user")
        .filter(kind=kind, token_hash=_hash(raw), used_at__isnull=True)
        .first()
    )
    if not row or row.expires_at < timezone.now():
        return None
    row.used_at = timezone.now()
    row.save(update_fields=["used_at"])
    return row.user
