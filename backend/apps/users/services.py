"""Write-side user operations."""
from __future__ import annotations

from typing import Any

from django.contrib.auth import get_user_model

User = get_user_model()


def create_user(*, email: str, password: str, role: str = "employee", **extra: Any):
    user = User(email=email, username=extra.pop("username", email), role=role, **extra)
    user.set_password(password)
    user.save()
    return user
