from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PromotionViewSet, SalaryBandViewSet, SalaryRevisionViewSet

router = DefaultRouter()
router.register("bands", SalaryBandViewSet, basename="salary-band")
router.register("promotions", PromotionViewSet, basename="promotion")
router.register("revisions", SalaryRevisionViewSet, basename="salary-revision")

urlpatterns = [path("", include(router.urls))]
