"""Selectors for user queries."""
from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models import QuerySet

User = get_user_model()


def active_users() -> QuerySet:
    return User.objects.filter(is_active=True)


def get_user_by_email(email: str):
    return User.objects.filter(email__iexact=email).first()
