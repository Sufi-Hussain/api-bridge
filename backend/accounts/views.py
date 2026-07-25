"""
accounts.views
==============

Auth endpoints. Uses SimpleJWT for token issue + refresh (with rotation +
blacklist). Frontend paths (see src/lib/api/auth.ts + src/lib/auth/api.ts):

    POST /api/auth/login
    POST /api/auth/logout
    POST /api/auth/refresh
    GET  /api/auth/me
    POST /api/auth/register
    POST /api/auth/verify-email
    POST /api/auth/resend-verification
    POST /api/auth/forgot-password
    POST /api/auth/reset-password
    POST /api/auth/change-password
"""
from __future__ import annotations
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import Organization, OrganizationMember, LoginHistory, PasswordHistory
from .serializers import (
    RegisterSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
    VerifyEmailSerializer, ChangePasswordSerializer, MeSerializer,
)
from .services import tokens as token_service
from .services import lockout

User = get_user_model()


class LoginThrottle(AnonRateThrottle):
    scope = "login"


def _client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    return xff.split(",")[0].strip() if xff else request.META.get("REMOTE_ADDR")


# ---------------------------------------------------------------------------
# Login / Refresh / Logout
# ---------------------------------------------------------------------------

class LoginView(TokenObtainPairView):
    """
    Overrides SimpleJWT's login to:
      - accept `email` OR `username` field (frontend sends `username`)
      - enforce account lockout
      - record login history
    """
    throttle_classes = [LoginThrottle]

    def post(self, request, *args, **kwargs):
        email = (request.data.get("email") or request.data.get("username") or "").lower()
        password = request.data.get("password") or ""
        ip = _client_ip(request)
        ua = request.META.get("HTTP_USER_AGENT", "")[:500]

        user = User.objects.filter(email__iexact=email).first()
        if user and user.is_locked():
            LoginHistory.objects.create(user=user, email_attempted=email, ip_address=ip,
                                        user_agent=ua, success=False, reason="locked")
            return Response({"detail": "Account temporarily locked."}, status=423)

        if not user or not user.check_password(password) or not user.is_active:
            if user:
                lockout.register_failure(user)
            LoginHistory.objects.create(
                user=user, email_attempted=email, ip_address=ip, user_agent=ua,
                success=False, reason="invalid_credentials",
            )
            return Response({"detail": "Invalid credentials."}, status=401)

        if not user.email_verified:
            return Response({"detail": "Email not verified."}, status=403)

        lockout.register_success(user, ip=ip)
        refresh = RefreshToken.for_user(user)
        LoginHistory.objects.create(user=user, email_attempted=email, ip_address=ip,
                                    user_agent=ua, success=True, reason="ok")
        return Response({"access": str(refresh.access_token), "refresh": str(refresh)})


class RefreshView(TokenRefreshView):
    """Standard SimpleJWT refresh; rotation + blacklist configured in settings."""
    pass


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Blacklist the refresh token if provided.
        raw = request.data.get("refresh")
        if raw:
            try:
                RefreshToken(raw).blacklist()
            except Exception:
                pass
        return Response(status=204)


# ---------------------------------------------------------------------------
# Current user
# ---------------------------------------------------------------------------

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user, context={"request": request}).data)


# ---------------------------------------------------------------------------
# Registration + email verification
# ---------------------------------------------------------------------------

class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]

    @transaction.atomic
    def post(self, request):
        s = RegisterSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        user = User.objects.create_user(
            email=data["email"], password=data["password"],
            first_name=data["first_name"], last_name=data["last_name"],
            is_active=True, email_verified=False,
        )
        PasswordHistory.objects.create(user=user, password_hash=user.password)

        # Create org OR attach via invitation. Real invitation lookup omitted
        # here — wire to your invites table.
        if data.get("organization_name"):
            org = Organization.objects.create(
                name=data["organization_name"],
                slug=data["organization_name"].lower().replace(" ", "-")[:50],
            )
            OrganizationMember.objects.create(
                organization=org, user=user, is_primary=True, status="active",
            )

        raw = token_service.issue(user, "email_verify", ttl_minutes=60 * 24)
        # TODO: send email with link `${FRONTEND_URL}/auth/verify-email?token=${raw}`
        _ = raw
        return Response({"detail": "Registered. Check your email to verify."},
                        status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email(request):
    s = VerifyEmailSerializer(data=request.data); s.is_valid(raise_exception=True)
    user = token_service.consume(s.validated_data["token"], "email_verify")
    if not user:
        return Response({"detail": "Invalid or expired token."}, status=400)
    user.email_verified = True
    user.save(update_fields=["email_verified"])
    return Response({"detail": "Email verified."})


@api_view(["POST"])
@permission_classes([AllowAny])
def resend_verification(request):
    email = (request.data.get("email") or "").lower()
    user = User.objects.filter(email__iexact=email, email_verified=False).first()
    if user:
        raw = token_service.issue(user, "email_verify", ttl_minutes=60 * 24)
        _ = raw  # send email
    # Always return 204 to avoid enumeration.
    return Response(status=204)


# ---------------------------------------------------------------------------
# Password reset
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    s = ForgotPasswordSerializer(data=request.data); s.is_valid(raise_exception=True)
    user = User.objects.filter(email__iexact=s.validated_data["email"]).first()
    if user:
        raw = token_service.issue(user, "password_reset", ttl_minutes=30)
        _ = raw  # send email with `${FRONTEND_URL}/auth/reset-password?token=${raw}`
    return Response(status=204)


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    s = ResetPasswordSerializer(data=request.data); s.is_valid(raise_exception=True)
    user = token_service.consume(s.validated_data["token"], "password_reset")
    if not user:
        return Response({"detail": "Invalid or expired token."}, status=400)

    # Enforce no-reuse against last 5 password hashes.
    new_pw = s.validated_data["password"]
    for row in user.password_history.all()[:5]:
        # Django's check_password requires a User to hash — use a throwaway.
        from django.contrib.auth.hashers import check_password
        if check_password(new_pw, row.password_hash):
            return Response({"detail": "Cannot reuse a recent password."}, status=400)

    user.set_password(new_pw)
    user.locked_until = None
    user.failed_login_attempts = 0
    user.save()
    PasswordHistory.objects.create(user=user, password_hash=user.password)
    return Response({"detail": "Password updated."})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = ChangePasswordSerializer(data=request.data); s.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(s.validated_data["current_password"]):
            return Response({"detail": "Current password is incorrect."}, status=400)
        user.set_password(s.validated_data["new_password"])
        user.save()
        PasswordHistory.objects.create(user=user, password_hash=user.password)
        return Response({"detail": "Password changed."})
