from django.contrib import admin

from .models import (
    Client,
    Project,
    ProjectAllocation,
    ProjectTask,
    Timesheet,
    TimesheetComment,
    TimesheetLine,
    TimesheetPeriod,
)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "client", "status", "billable", "organization")
    list_filter = ("status", "billable")
    search_fields = ("name", "code")


@admin.register(Timesheet)
class TimesheetAdmin(admin.ModelAdmin):
    list_display = ("employee", "period", "status", "total_hours", "billable_hours")
    list_filter = ("status",)


admin.site.register([Client, ProjectTask, ProjectAllocation, TimesheetPeriod, TimesheetLine, TimesheetComment])
