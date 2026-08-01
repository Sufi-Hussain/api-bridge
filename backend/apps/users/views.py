# from __future__ import annotations

# from django.contrib.auth import get_user_model
# from rest_framework import status
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# from .serializers import MeSerializer

# User = get_user_model()


# class LoginView(TokenObtainPairView):
#     permission_classes = [AllowAny]


# class RefreshView(TokenRefreshView):
#     permission_classes = [AllowAny]


# class LogoutView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         token = request.data.get("refresh")
#         if not token:
#             return Response({"detail": "refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
#         try:
#             RefreshToken(token).blacklist()
#         except Exception as exc:  # noqa: BLE001
#             return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class MeView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         return Response(MeSerializer(request.user).data)
