"""
accounts.services.lockout
=========================

Account lockout on repeated failed logins. Tunables live in settings:

    AUTH_LOCKOUT_MAX_ATTEMPTS = 5
    AUTH_LOCKOUT_WINDOW_MINUTES = 15
    AUTH_LOCKOUT_DURATION_MINUTES = 30
"""
from __future__ import annotations
from datetime import timedelta
from django.conf import settings
from django.utils import timezone


MAX_ATTEMPTS = getattr(settings, "AUTH_LOCKOUT_MAX_ATTEMPTS", 5)
LOCK_DURATION = timedelta(minutes=getattr(settings, "AUTH_LOCKOUT_DURATION_MINUTES", 30))


def register_failure(user) -> None:
    user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
    if user.failed_login_attempts >= MAX_ATTEMPTS:
        user.locked_until = timezone.now() + LOCK_DURATION
    user.save(update_fields=["failed_login_attempts", "locked_until"])


def register_success(user, ip: str | None = None) -> None:
    user.failed_login_attempts = 0
    user.locked_until = None
    if ip:
        user.last_login_ip = ip
    user.save(update_fields=["failed_login_attempts", "locked_until", "last_login_ip"])
