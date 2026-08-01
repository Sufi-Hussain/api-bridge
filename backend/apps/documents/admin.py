from django.contrib import admin

from .models import DocumentItem


@admin.register(DocumentItem)
class DocumentItemAdmin(admin.ModelAdmin):
    list_display = ("employee", "name", "category", "status", "expires_on", "created_at")
    list_filter = ("category", "status")
    search_fields = ("name", "employee__first_name")
