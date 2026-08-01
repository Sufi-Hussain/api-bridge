"""
accounts.models
===============

Core identity + RBAC + multi-tenancy models. Drop this app into your Django
project (INSTALLED_APPS += ['accounts']) and set AUTH_USER_MODEL='accounts.User'
BEFORE the first migration.

Design principles
-----------------
- User is the identity. Membership + role assignment happen through
  OrganizationMember + UserRole so a single user can belong to multiple orgs.
- Permissions are strings (e.g. "employee.read", "payroll.write"). Roles bundle
  permissions. Never hardcode role names in app code — check permissions.
- Every tenant-scoped model in the rest of the project should FK to
  Organization and mix in TenantScopedModel (see mixins.py).
"""
from __future__ import annotations

import uuid
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
# from openai import organization


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra):
        extra.setdefault("is_staff", False)
        extra.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra)

    def create_superuser(self, email, password, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        extra.setdefault("is_active", True)
        extra.setdefault("email_verified", True)
        return self._create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)          # Django admin gate
    email_verified = models.BooleanField(default=False)

    # Brute-force lockout state (see services/lockout.py)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        indexes = [models.Index(fields=["email"])]

    def __str__(self) -> str:
        return self.email

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip() or self.email

    def is_locked(self) -> bool:
        return bool(self.locked_until and self.locked_until > timezone.now())
    
    def has_role(self, slug: str, organization=None) -> bool:
        qs = self.role_assignments.filter(role__slug=slug)
        if organization is not None:
            qs = qs.filter(organization=organization)
        return qs.exists()


class Organization(models.Model):
    """A tenant. Every business record ultimately hangs off one of these."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class OrganizationSettings(models.Model):
    organization = models.OneToOneField(
        Organization, on_delete=models.CASCADE, related_name="settings"
    )
    default_currency = models.CharField(max_length=3, default="USD")
    timezone = models.CharField(max_length=64, default="UTC")
    features = models.JSONField(default=dict, blank=True)


class OrganizationMember(models.Model):
    """Join table: which users belong to which org, and their state within it."""
    class Status(models.TextChoices):
        ACTIVE = "active"
        INVITED = "invited"
        SUSPENDED = "suspended"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="members"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memberships"
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    is_primary = models.BooleanField(default=False)   # user's "current" org
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("organization", "user")]
        indexes = [models.Index(fields=["user", "is_primary"])]


# ---------------------------------------------------------------------------
# RBAC
# ---------------------------------------------------------------------------

class Permission(models.Model):
    """
    Application permission. Codename convention: "<resource>.<action>",
    e.g. "employee.read", "payroll.write", "org.admin".
    """
    codename = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    group = models.CharField(max_length=60, blank=True, db_index=True)  # e.g. "HR", "Payroll"

    def __str__(self) -> str:
        return self.codename


class Role(models.Model):
    """
    Bundles permissions. Roles can be system-defined (immutable) or
    per-organization (custom). Global roles have organization=NULL.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=60)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, null=True, blank=True, related_name="roles"
    )
    is_system = models.BooleanField(default=False)
    permissions = models.ManyToManyField(Permission, related_name="roles", blank=True)

    class Meta:
        unique_together = [("organization", "slug")]

    def __str__(self) -> str:
        return f"{self.slug}@{self.organization_id or 'global'}"


class UserRole(models.Model):
    """A user has a role within a specific organization."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="role_assignments"
    )
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="assignments")
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="role_assignments"
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="+",
    )

    class Meta:
        unique_together = [("user", "role", "organization")]


# ---------------------------------------------------------------------------
# Password reset / email verification tokens
# ---------------------------------------------------------------------------

class OneTimeToken(models.Model):
    class Kind(models.TextChoices):
        EMAIL_VERIFY = "email_verify"
        PASSWORD_RESET = "password_reset"
        INVITE = "invite"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tokens")
    kind = models.CharField(max_length=32, choices=Kind.choices)
    token_hash = models.CharField(max_length=128, db_index=True)  # store hash, never raw
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["kind", "token_hash"])]


class PasswordHistory(models.Model):
    """Prevents password reuse (last N)."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="password_history")
    password_hash = models.CharField(max_length=256)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class LoginHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="login_history", null=True, blank=True)
    email_attempted = models.EmailField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    success = models.BooleanField()
    reason = models.CharField(max_length=100, blank=True)  # "invalid_password", "locked", "ok"
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "-created_at"])]
