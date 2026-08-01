"""
accounts.admin
==============

Admin registrations for the accounts app: custom User, multi-tenant
Organization models, and the RBAC (Role/Permission/UserRole) system.
"""
from __future__ import annotations

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import (
    LoginHistory,
    OneTimeToken,
    Organization,
    OrganizationMember,
    OrganizationSettings,
    PasswordHistory,
    Permission,
    Role,
    User,
    UserRole,
)


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class OrganizationMemberInline(admin.TabularInline):
    model = OrganizationMember
    extra = 0
    fields = ("organization", "status", "is_primary", "joined_at")
    readonly_fields = ("joined_at",)
    autocomplete_fields = ("organization",)


class UserRoleInline(admin.TabularInline):
    model = UserRole
    fk_name = "user"
    extra = 0
    fields = ("role", "organization", "granted_by", "granted_at")
    readonly_fields = ("granted_at",)
    autocomplete_fields = ("role", "organization", "granted_by")


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom user model has no `username` field (login is via email), so the
    default UserAdmin fieldsets/add_fieldsets (which reference `username`)
    are overridden entirely.
    """
    ordering = ("email",)
    list_display = (
        "email",
        "full_name",
        "is_active",
        "is_staff",
        "email_verified",
        "is_locked_display",
        "created_at",
    )
    list_filter = ("is_active", "is_staff", "email_verified", "is_superuser")
    search_fields = ("email", "first_name", "last_name")
    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
        "last_login",
        "failed_login_attempts",
        "last_login_ip",
    )
    inlines = [OrganizationMemberInline, UserRoleInline]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "avatar")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "email_verified",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            _("Security"),
            {
                "fields": (
                    "failed_login_attempts",
                    "locked_until",
                    "last_login_ip",
                    "last_login",
                )
            },
        ),
        (_("Metadata"), {"fields": ("id", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "is_staff", "is_active"),
            },
        ),
    )

    @admin.display(description=_("Full name"))
    def full_name(self, obj: User) -> str:
        return obj.full_name

    @admin.display(boolean=True, description=_("Locked"))
    def is_locked_display(self, obj: User) -> bool:
        return obj.is_locked()


# ---------------------------------------------------------------------------
# Organizations
# ---------------------------------------------------------------------------

class OrganizationSettingsInline(admin.StackedInline):
    model = OrganizationSettings
    can_delete = False
    extra = 0


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "member_count", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [OrganizationSettingsInline]

    @admin.display(description=_("Members"))
    def member_count(self, obj: Organization) -> int:
        return obj.members.count()


@admin.register(OrganizationMember)
class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ("user", "organization", "status", "is_primary", "joined_at")
    list_filter = ("status", "is_primary", "organization")
    search_fields = ("user__email", "organization__name")
    autocomplete_fields = ("user", "organization")


# ---------------------------------------------------------------------------
# RBAC
# ---------------------------------------------------------------------------

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("codename", "name", "group")
    list_filter = ("group",)
    search_fields = ("codename", "name")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("slug", "name", "organization", "is_system", "permission_count")
    list_filter = ("is_system", "organization")
    search_fields = ("slug", "name")
    filter_horizontal = ("permissions",)
    autocomplete_fields = ("organization",)

    @admin.display(description=_("Permissions"))
    def permission_count(self, obj: Role) -> int:
        return obj.permissions.count()


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "organization", "granted_by", "granted_at")
    list_filter = ("organization", "role")
    search_fields = ("user__email", "role__slug")
    autocomplete_fields = ("user", "role", "organization", "granted_by")


# ---------------------------------------------------------------------------
# Tokens / security history (read-mostly, sensitive — keep tightly locked down)
# ---------------------------------------------------------------------------

@admin.register(OneTimeToken)
class OneTimeTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "kind", "expires_at", "used_at", "created_at")
    list_filter = ("kind",)
    search_fields = ("user__email",)
    readonly_fields = ("token_hash", "created_at")
    autocomplete_fields = ("user",)

    def has_change_permission(self, request, obj=None):
        # Tokens are issued/consumed by app logic, not hand-edited.
        return False


@admin.register(PasswordHistory)
class PasswordHistoryAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at")
    search_fields = ("user__email",)
    readonly_fields = ("user", "password_hash", "created_at")
    autocomplete_fields = ("user",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = ("email_attempted", "user", "success", "reason", "ip_address", "created_at")
    list_filter = ("success", "reason")
    search_fields = ("email_attempted", "user__email", "ip_address")
    readonly_fields = (
        "user",
        "email_attempted",
        "ip_address",
        "user_agent",
        "success",
        "reason",
        "created_at",
    )
    autocomplete_fields = ("user",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False