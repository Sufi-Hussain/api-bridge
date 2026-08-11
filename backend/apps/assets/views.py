from __future__ import annotations

from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsEmployee
from apps.common.viewsets import current_employee

from . import services
from .serializers import AssetRequestSerializer, AssetSerializer, SoftwareLicenseSerializer


class MyAssetViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsEmployee]
    serializer_class = AssetSerializer

    def get_queryset(self):
        return services.my_assets(current_employee(self.request))


class MyAssetRequestViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated, IsEmployee]
    serializer_class = AssetRequestSerializer

    def get_queryset(self):
        return services.my_asset_requests(current_employee(self.request))

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        obj = services.request_asset(current_employee(request), **ser.validated_data)
        return Response(self.get_serializer(obj).data, status=201)


class MyLicenseViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsEmployee]
    serializer_class = SoftwareLicenseSerializer

    def get_queryset(self):
        return services.my_licenses(current_employee(self.request))
