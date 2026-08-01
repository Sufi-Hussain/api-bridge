from django.contrib import admin

from .models import BusinessUnit, CostCenter, Department, Location, Organization, Team


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "country", "currency", "is_active")
    search_fields = ("name", "code", "domain")
    list_filter = ("is_active", "country")


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "organization", "open_positions", "budget_usd")
    search_fields = ("name", "code")
    list_filter = ("organization",)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "department", "location", "organization")
    search_fields = ("name",)
    list_filter = ("organization", "department")


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "country", "type", "organization")
    search_fields = ("name", "city", "country")
    list_filter = ("organization", "type", "country")


@admin.register(BusinessUnit)
class BusinessUnitAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "head_name", "organization")
    search_fields = ("name", "code")
    list_filter = ("organization",)


@admin.register(CostCenter)
class CostCenterAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "business_unit", "budget_usd", "organization")
    search_fields = ("code", "name")
    list_filter = ("organization",)
