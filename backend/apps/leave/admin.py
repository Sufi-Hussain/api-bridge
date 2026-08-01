from django.contrib import admin

from .models import Holiday, LeaveRequest, LeaveType


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "annual_quota")
    search_fields = ("code", "name")


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "type", "from_date", "to_date", "days", "status")
    list_filter = ("status", "type")
    search_fields = ("employee__first_name", "employee__last_name")


@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ("name", "date", "region")
    list_filter = ("region",)
    search_fields = ("name",)
