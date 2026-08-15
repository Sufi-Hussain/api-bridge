from django.contrib import admin

from .models import (
    Benefit,
    BenefitEnrollment,
    ExpenseClaim,
    ExpenseReceipt,
    TravelRequest,
    Loan,
)


@admin.register(Benefit)
class BenefitAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "provider",
        "premium",
        "employer_contribution",
        "renewal_date",
    )
    list_filter = (
        "category",
        "renewal_date",
    )
    search_fields = (
        "name",
        "provider",
    )
    ordering = ("name",)


@admin.register(BenefitEnrollment)
class BenefitEnrollmentAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "benefit",
        "status",
        "claims",
        "usage",
        "enrolled_on",
    )
    list_filter = (
        "status",
        "enrolled_on",
    )
    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "benefit__name",
    )
    ordering = ("-enrolled_on",)
    autocomplete_fields = (
        "employee",
        "benefit",
    )


@admin.register(ExpenseClaim)
class ExpenseClaimAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "employee",
        "category",
        "amount",
        "currency",
        "date",
        "status",
        "approver",
        "receipt_count",
    )
    list_filter = (
        "category",
        "status",
        "currency",
        "date",
    )
    search_fields = (
        "title",
        "employee__first_name",
        "employee__last_name",
        "approver",
        "notes",
    )
    ordering = ("-date",)
    autocomplete_fields = ("employee",)


@admin.register(ExpenseReceipt)
class ExpenseReceiptAdmin(admin.ModelAdmin):
    list_display = (
        "claim",
        "caption",
        "file",
    )
    search_fields = (
        "claim__title",
        "caption",
    )
    autocomplete_fields = ("claim",)


@admin.register(TravelRequest)
class TravelRequestAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "destination",
        "purpose",
        "from_date",
        "to_date",
        "estimated_cost",
        "status",
        "approver",
    )
    list_filter = (
        "status",
        "from_date",
        "to_date",
    )
    search_fields = (
        "destination",
        "purpose",
        "employee__first_name",
        "employee__last_name",
        "approver",
    )
    ordering = ("-from_date",)
    autocomplete_fields = ("employee",)


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "type",
        "principal",
        "outstanding",
        "emi",
        "tenure_months",
        "interest_rate",
        "start_date",
        "status",
    )
    list_filter = (
        "status",
        "start_date",
    )
    search_fields = (
        "type",
        "employee__first_name",
        "employee__last_name",
    )
    ordering = ("-start_date",)
    autocomplete_fields = ("employee",)