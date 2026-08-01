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
from .services.ui_permissions import ui_scopes_for_roles
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
    organizations = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    is_super_admin = serializers.BooleanField(source="is_superuser")

    class Meta:
        model = User
        fields = [
            "id", "email", "name", "first_name", "last_name",
            "job_title", "department", "employee_id", "avatar_url",
            "roles", "permissions", "organization_id", "organizations",
            "email_verified", "is_super_admin",
        ]
        read_only_fields = fields

    # -- employee-derived fields (related_name is `employee`; job title and
    #    department live on the one-to-one `employment` row) -----------------
    @staticmethod
    def _employee(u):
        return getattr(u, "employee", None)

    def get_name(self, u):
        emp = self._employee(u)
        if emp:
            return f"{emp.first_name} {emp.last_name}".strip()
        return u.full_name

    def get_job_title(self, u):
        emp = self._employee(u)
        return getattr(getattr(emp, "employment", None), "job_title", "") or ""

    def get_department(self, u):
        emp = self._employee(u)
        return getattr(getattr(emp, "employment", None), "department", "") or ""

    def get_employee_id(self, u):
        emp = self._employee(u)
        return getattr(emp, "employee_id", "") or ""

    def get_avatar_url(self, u):
        if not u.avatar:
            return None
        request = self.context.get("request")
        url = u.avatar.url
        return request.build_absolute_uri(url) if request else url

    # -- tenant / RBAC ------------------------------------------------------
    def _org(self):
        req = self.context.get("request")
        return getattr(req, "organization", None) or getattr(self.instance, "organization", None)

    def get_roles(self, u):
        org = self._org()
        slugs = sorted(user_role_slugs(u, org)) if org else []
        if u.is_superuser and "super_admin" not in slugs:
            slugs.append("super_admin")
        return slugs

    def get_permissions(self, u):
        """Backend RBAC codenames plus the UI scope wildcards the frontend
        navigation is gated on (see accounts.services.ui_permissions)."""
        org = self._org()
        codenames = user_permission_codenames(u, org) if org else set()
        if "*" in codenames or u.is_superuser:
            return ["*"]
        scopes = ui_scopes_for_roles(self.get_roles(u))
        return sorted(set(codenames) | set(scopes))

    def get_organization_id(self, u):
        org = self._org()
        return str(org.id) if org else ""

    def get_organizations(self, u):
        orgs = [m.organization for m in
                u.memberships.select_related("organization").filter(status="active")]
        return OrganizationBriefSerializer(orgs, many=True).data

