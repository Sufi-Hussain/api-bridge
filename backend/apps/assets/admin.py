from django.contrib import admin

from .models import Asset, AssetRequest, SoftwareLicense


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "serial",
        "value",
        "condition",
        "status",
        "assigned_to",
        "warranty_end",
    )
    list_filter = (
        "category",
        "condition",
        "status",
        "warranty_end",
    )
    search_fields = (
        "name",
        "serial",
        "assigned_to__first_name",
        "assigned_to__last_name",
    )
    ordering = ("name",)
    autocomplete_fields = ("assigned_to",)


@admin.register(AssetRequest)
class AssetRequestAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "category",
        "status",
        "requested_on",
    )
    list_filter = (
        "category",
        "status",
        "requested_on",
    )
    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "justification",
    )
    ordering = ("-requested_on",)
    autocomplete_fields = ("employee",)


@admin.register(SoftwareLicense)
class SoftwareLicenseAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "vendor",
        "seats_total",
        "seats_used",
        "cost_per_seat",
        "renewal_date",
    )
    list_filter = (
        "vendor",
        "renewal_date",
    )
    search_fields = (
        "name",
        "vendor",
    )
    ordering = ("name",)