from django.contrib import admin

from .models import AttendancePunch, TimesheetEntry


@admin.register(AttendancePunch)
class AttendancePunchAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "status", "clock_in", "clock_out", "worked_hours")
    list_filter = ("status", "date")
    search_fields = ("employee__first_name", "employee__last_name")


@admin.register(TimesheetEntry)
class TimesheetEntryAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "project", "task", "hours", "billable", "status")
    list_filter = ("status", "billable")
    search_fields = ("project", "task", "employee__first_name")
