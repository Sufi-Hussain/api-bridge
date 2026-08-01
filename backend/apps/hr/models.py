from __future__ import annotations

from django.db import models

from apps.common.models import UUIDTimestampedModel


class Department(UUIDTimestampedModel):
    organization = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        related_name="departments",
        null=True,
        blank=True,
        db_index=True,
    )
    name = models.CharField(max_length=64)
    head_count = models.PositiveIntegerField(default=0)
    budget = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        ordering = ("name",)
        unique_together = [("organization", "name")]

    def __str__(self) -> str:  # pragma: no cover
        return self.name
