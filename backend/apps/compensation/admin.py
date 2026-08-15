from django.contrib import admin

from .models import SalaryBand, Promotion, SalaryRevision


@admin.register(SalaryBand)
class SalaryBandAdmin(admin.ModelAdmin):
    list_display = (
        "grade",
        "role",
        "department",
        "min_usd",
        "mid_usd",
        "max_usd",
        "current_avg_usd",
        "headcount",
        "currency",
    )
    list_filter = (
        "grade",
        "department",
        "currency",
    )
    search_fields = (
        "grade",
        "role",
        "department",
    )
    ordering = ("grade",)


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "from_grade",
        "to_grade",
        "department",
        "effective",
        "current_salary",
        "proposed_salary",
        "hike_pct",
        "status",
        "recommender",
    )
    list_filter = (
        "status",
        "department",
        "from_grade",
        "to_grade",
        "effective",
    )
    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "from_grade",
        "to_grade",
        "department",
        "recommender",
        "justification",
    )
    ordering = ("-effective",)
    autocomplete_fields = ("employee",)


@admin.register(SalaryRevision)
class SalaryRevisionAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "effective",
        "previous_salary",
        "new_salary",
        "hike_pct",
        "reason",
        "status",
        "approver",
    )
    list_filter = (
        "status",
        "effective",
    )
    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "reason",
        "approver",
    )
    ordering = ("-effective",)
    autocomplete_fields = ("employee",)