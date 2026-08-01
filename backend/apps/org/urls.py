from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BusinessUnitViewSet,
    CostCenterViewSet,
    DepartmentViewSet,
    LocationViewSet,
    OrganizationProfileView,
    TeamViewSet,
)

router = DefaultRouter()
router.register("departments", DepartmentViewSet, basename="department")
router.register("teams", TeamViewSet, basename="team")
router.register("locations", LocationViewSet, basename="location")
router.register("business-units", BusinessUnitViewSet, basename="business-unit")
router.register("cost-centers", CostCenterViewSet, basename="cost-center")

urlpatterns = [
    path("profile", OrganizationProfileView.as_view(), name="org-profile"),
    path("", include(router.urls)),
]
