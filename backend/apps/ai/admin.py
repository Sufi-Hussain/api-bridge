from django.contrib import admin

from .models import AIConversation, AIMessage


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ("user", "organization", "title", "updated_at")
    list_filter = ("organization", "updated_at")
    search_fields = ("user__first_name", "user__last_name", "title")


@admin.register(AIMessage)
class AIMessageAdmin(admin.ModelAdmin):
    list_display = ("conversation", "role", "content", "created_at")
    list_filter = ("role", "created_at")
    search_fields = ("content",)