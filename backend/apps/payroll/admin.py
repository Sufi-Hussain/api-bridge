from django.contrib import admin

from .models import Payslip, PayslipLine


class PayslipLineInline(admin.TabularInline):
    model = PayslipLine
    extra = 0


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ("employee", "month", "gross", "net", "status", "paid_on")
    list_filter = ("status", "month")
    search_fields = ("employee__first_name", "employee__last_name", "month")
    inlines = [PayslipLineInline]
