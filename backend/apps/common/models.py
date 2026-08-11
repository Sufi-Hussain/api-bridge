"""Abstract base models shared by every app."""
from __future__ import annotations

import uuid

from django.db import models


class UUIDModel(models.Model):
    """Primary key as UUID."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UUIDTimestampedModel(UUIDModel, TimestampedModel):
    class Meta:
        abstract = True

class OrgOwnedModel(UUIDTimestampedModel):
    """Base for every tenant-scoped record.

    ``organization`` is mandatory so no query can ever leak across tenants.
    """

    organization = models.ForeignKey(
        "accounts.Organization",

        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_set",
    )

    class Meta:
        abstract = True