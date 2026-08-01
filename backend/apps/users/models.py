from __future__ import annotations

import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.common.models import UUIDTimestampedModel


class Role(models.TextChoices):
    EMPLOYEE = "employee", "Employee"
    MANAGER = "manager", "Manager"
    HR = "hr", "HR"
    ADMIN = "admin", "Admin"


class User(AbstractUser):
    """Custom user with UUID PK, email login, tenant and role."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.EMPLOYEE)
    organization = models.ForeignKey(
        "org.Organization",
        on_delete=models.CASCADE,
        related_name="users",
        null=True,
        blank=True,
    )
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    mfa_enabled = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.email


class Invitation(UUIDTimestampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        EXPIRED = "expired", "Expired"
        REVOKED = "revoked", "Revoked"

    organization = models.ForeignKey(
        "org.Organization", on_delete=models.CASCADE, related_name="invitations"
    )
    email = models.EmailField()
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.EMPLOYEE)
    invited_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="invitations_sent"
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    expires_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ("organization", "email")
        ordering = ("-created_at",)


class UserSession(UUIDTimestampedModel):
    """Matches `Session` in src/services/ess.ts."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    device = models.CharField(max_length=96)
    browser = models.CharField(max_length=64, blank=True)
    os = models.CharField(max_length=64, blank=True)
    location = models.CharField(max_length=96, blank=True)
    ip = models.GenericIPAddressField(blank=True, null=True)
    last_active = models.DateTimeField(auto_now=True)
    current = models.BooleanField(default=False)

    class Meta:
        ordering = ("-last_active",)


class ActivityEvent(UUIDTimestampedModel):
    """Matches `ActivityEvent` in src/services/ess.ts."""

    class Kind(models.TextChoices):
        LOGIN = "login", "Login"
        PROFILE = "profile", "Profile"
        LEAVE = "leave", "Leave"
        PAYROLL = "payroll", "Payroll"
        ASSET = "asset", "Asset"
        LEARNING = "learning", "Learning"
        SECURITY = "security", "Security"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activity_events")
    type = models.CharField(max_length=16, choices=Kind.choices, default=Kind.LOGIN)
    title = models.CharField(max_length=160)
    detail = models.CharField(max_length=255, blank=True)
    ip = models.GenericIPAddressField(blank=True, null=True)
    device = models.CharField(max_length=96, blank=True)
    occurred_at = models.DateTimeField()

    class Meta:
        ordering = ("-occurred_at",)


class MessageThread(UUIDTimestampedModel):
    """Matches `MessageThread` in src/services/ess.ts."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="message_threads")
    with_name = models.CharField(max_length=96)
    role = models.CharField(max_length=64, blank=True)
    last_message = models.CharField(max_length=255, blank=True)
    unread = models.PositiveIntegerField(default=0)
    online = models.BooleanField(default=False)
    last_message_at = models.DateTimeField()

    class Meta:
        ordering = ("-last_message_at",)
