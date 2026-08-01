from __future__ import annotations

from django.db import models

from apps.common.models import UUIDTimestampedModel


class Department(UUIDTimestampedModel):
    name = models.CharField(max_length=64, unique=True)
    head_count = models.PositiveIntegerField(default=0)
    budget = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    def __str__(self) -> str:  # pragma: no cover
        return self.name
