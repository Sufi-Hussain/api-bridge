"""
accounts.serializers
====================

Auth-flow serializers plus the `/api/auth/me` shape consumed by the
frontend (see src/lib/api/auth.ts for the camelCase mapping).
"""
from __future__ import annotations
from django.contrib.auth import authenticate, password_validation
from rest_framework import serializers
from .models import User, Organization
from .services.rbac import user_permission_codenames, user_role_slugs


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=12)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    organization_name = serializers.CharField(required=False, allow_blank=True)
    invitation_token = serializers.CharField(required=False, allow_blank=True)

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            # Do not leak existence in production; keep for dev.
            raise serializers.ValidationError("Email already registered.")
        return value.lower()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=12)

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=12)

    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value


class OrganizationBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "slug"]


class MeSerializer(serializers.ModelSerializer):
    """Response shape for GET /api/auth/me. Matches the frontend User contract."""
    name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    employee_id = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    organization_id = serializers.SerializerMethodField()
    is_super_admin = serializers.BooleanField(source="is_superuser")

    class Meta:
        model = User
        fields = [
            "id", "email", "name", "first_name", "last_name",
            "job_title", "department", "employee_id",
            "roles", "permissions", "organization_id",
            "email_verified", "is_super_admin",
        ]
        read_only_fields = fields

    def get_name(self, u): return u.full_name
    def get_job_title(self, u): return getattr(getattr(u, "employee_profile", None), "job_title", "")
    def get_department(self, u):
        emp = getattr(u, "employee_profile", None)
        return getattr(getattr(emp, "department", None), "name", "")
    def get_employee_id(self, u):
        return str(getattr(getattr(u, "employee_profile", None), "id", "") or "")

    def _org(self):
        req = self.context.get("request")
        return getattr(req, "organization", None)

    def get_roles(self, u):
        org = self._org()
        return sorted(user_role_slugs(u, org)) if org else []

    def get_permissions(self, u):
        org = self._org()
        perms = user_permission_codenames(u, org) if org else set()
        return [] if "*" in perms else sorted(perms)

    def get_organization_id(self, u):
        org = self._org()
        return str(org.id) if org else ""
