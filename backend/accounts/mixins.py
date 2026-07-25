"""
accounts.mixins
===============

Mixin every tenant-scoped business model should use.
"""
from __future__ import annotations
from django.db import models
from .managers import TenantScopedManager


class TenantScopedModel(models.Model):
    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.CASCADE,
        related_name="+",
    )

    objects = TenantScopedManager()

    class Meta:
        abstract = True
        indexes = [models.Index(fields=["organization"])]
