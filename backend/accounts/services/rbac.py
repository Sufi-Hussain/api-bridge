"""
accounts.services.rbac
======================

Helpers for resolving effective permissions of a user within a given org.
Cached per-request; wire a real cache (Redis) in production.
"""
from __future__ import annotations
from functools import lru_cache
from ..models import UserRole


def user_permission_codenames(user, organization) -> set[str]:
    """Return the flat set of permission codenames for `user` in `organization`."""
    if user.is_superuser:
        return {"*"}  # sentinel; treat as "all"
    if organization is None:
        return set()
    perms = (
        UserRole.objects
        .filter(user=user, organization=organization)
        .values_list("role__permissions__codename", flat=True)
    )
    return {p for p in perms if p}


def user_role_slugs(user, organization) -> set[str]:
    return set(
        UserRole.objects.filter(user=user, organization=organization)
        .values_list("role__slug", flat=True)
    )
