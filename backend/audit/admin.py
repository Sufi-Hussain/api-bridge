"""
audit.admin
===========

Read-only admin view for AuditEvent. Audit records are written exclusively
via `log_event()` / the auth signal handlers — never hand-created or edited
in admin, since that would defeat the point of an audit trail.
"""
from __future__ import annotations

from django.contrib import admin
from django.urls import NoReverseMatch, reverse
from django.utils.html import format_html

from .models import AuditEvent


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    date_hierarchy = "created_at"
    list_display = (
        "created_at",
        "action",
        "actor",
        "organization",
        "content_type",
        "target_link",
        "ip_address",
    )
    list_filter = ("action", "organization", "content_type")
    search_fields = (
        "action",
        "object_id",
        "actor__email",
        "ip_address",
    )
    autocomplete_fields = ("actor", "organization")
    readonly_fields = (
        "id",
        "organization",
        "actor",
        "action",
        "content_type",
        "object_id",
        "target_link",
        "ip_address",
        "user_agent",
        "metadata",
        "created_at",
    )
    ordering = ("-created_at",)

    @admin.display(description="Target")
    def target_link(self, obj: AuditEvent):
        if not obj.target:
            return "—"
        try:
            url = reverse(
                f"admin:{obj.content_type.app_label}_{obj.content_type.model}_change",
                args=[obj.object_id],
            )
            return format_html('<a href="{}">{}</a>', url, obj.target)
        except NoReverseMatch:
            # Target model has no registered admin — show as plain text.
            return str(obj.target)

    # Audit trail is append-only and machine-written — lock admin down to
    # viewing/searching. No manual create, edit, or delete.
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False