from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.common.permissions import IsAdminRole
from apps.common.viewsets import current_organization

from .models import ActivityEvent, Invitation, MessageThread, UserSession
from .serializers import (
    ActivityEventSerializer,
    InvitationSerializer,
    MeSerializer,
    MessageThreadSerializer,
    UserSerializer,
    UserSessionSerializer,
)

User = get_user_model()


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]


class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get("refresh")
        if not token:
            return Response({"detail": "refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            RefreshToken(token).blacklist()
        except Exception as exc:  # noqa: BLE001
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    """Tenant-scoped user administration."""

    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]
    search_fields = ("email", "first_name", "last_name")
    filterset_fields = ("role", "is_active")

    def get_queryset(self):
        return User.objects.filter(organization=current_organization(self.request))

    def perform_create(self, serializer):
        serializer.save(organization=current_organization(self.request))


class InvitationViewSet(viewsets.ModelViewSet):
    serializer_class = InvitationSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ("status", "role")

    def get_queryset(self):
        return Invitation.objects.filter(organization=current_organization(self.request))

    def perform_create(self, serializer):
        serializer.save(
            organization=current_organization(self.request), invited_by=self.request.user
        )


class SessionViewSet(viewsets.ModelViewSet):
    """Own sessions only — DELETE revokes a session."""

    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "delete", "head", "options"]

    def get_queryset(self):
        return UserSession.objects.filter(user=self.request.user)


class ActivityEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityEventSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ("type",)

    def get_queryset(self):
        return ActivityEvent.objects.filter(user=self.request.user)


class MessageThreadViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MessageThreadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MessageThread.objects.filter(user=self.request.user)
