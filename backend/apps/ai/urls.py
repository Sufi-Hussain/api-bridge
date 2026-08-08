from django.urls import path

from .views import ChatView, ConversationListView

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="ai-conversations"),
    path("chat/", ChatView.as_view(), name="ai-chat"),
]
