from django.conf import settings
from django.db import models

from apps.common.models import UUIDTimestampedModel


class Notification(UUIDTimestampedModel):
    class Category(models.TextChoices):
        LEAVE = "leave", "Leave"
        PAYROLL = "payroll", "Payroll"
        SYSTEM = "system", "System"
        TEAM = "team", "Team"
        LEARNING = "learning", "Learning"
        HELPDESK = "helpdesk", "Helpdesk"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=128)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=16, choices=Category.choices, default=Category.SYSTEM)
    href = models.CharField(max_length=255, blank=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ("-created_at",)
