from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsEmployee
from apps.common.viewsets import OrgScopedViewSet

from .models import Promotion, SalaryBand, SalaryRevision
from .serializers import PromotionSerializer, SalaryBandSerializer, SalaryRevisionSerializer


class SalaryBandViewSet(OrgScopedViewSet):
    queryset = SalaryBand.objects.all()
    serializer_class = SalaryBandSerializer
    http_method_names = ["get", "head", "options"]


class PromotionViewSet(OrgScopedViewSet):
    queryset = Promotion.objects.select_related("employee")
    serializer_class = PromotionSerializer
    http_method_names = ["get", "head", "options"]


class SalaryRevisionViewSet(OrgScopedViewSet):
    queryset = SalaryRevision.objects.select_related("employee")
    serializer_class = SalaryRevisionSerializer
    http_method_names = ["get", "head", "options"]
