from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActivityEventViewSet,
    InvitationViewSet,
    LoginView,
    LogoutView,
    MeView,
    MessageThreadViewSet,
    RefreshView,
    SessionViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")
router.register("invitations", InvitationViewSet, basename="invitation")
router.register("sessions", SessionViewSet, basename="session")
router.register("activity", ActivityEventViewSet, basename="activity-event")
router.register("messages", MessageThreadViewSet, basename="message-thread")

urlpatterns = [
    path("login", LoginView.as_view(), name="auth-login"),
    path("refresh", RefreshView.as_view(), name="auth-refresh"),
    path("logout", LogoutView.as_view(), name="auth-logout"),
    path("me", MeView.as_view(), name="auth-me"),
    path("", include(router.urls)),
]
