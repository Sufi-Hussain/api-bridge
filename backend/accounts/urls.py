"""URL routes for the accounts app. Include under `path('api/auth/', ...)`."""
from django.urls import path
from . import views

urlpatterns = [
    path("login",  views.LoginView.as_view(),  name="auth-login"),
    path("logout", views.LogoutView.as_view(), name="auth-logout"),
    path("refresh", views.RefreshView.as_view(), name="auth-refresh"),
    path("me", views.MeView.as_view(), name="auth-me"),

    path("register", views.RegisterView.as_view(), name="auth-register"),
    path("verify-email", views.verify_email, name="auth-verify-email"),
    path("resend-verification", views.resend_verification, name="auth-resend"),

    path("forgot-password", views.forgot_password, name="auth-forgot"),
    path("reset-password",  views.reset_password,  name="auth-reset"),
    path("change-password", views.ChangePasswordView.as_view(), name="auth-change"),

    path("organizations/", views.OrganizationListAPIView.as_view(), name="organization-list"),
]
