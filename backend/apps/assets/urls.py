from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MyAssetRequestViewSet, MyAssetViewSet, MyLicenseViewSet

router = DefaultRouter()
router.register("assets", MyAssetViewSet, basename="my-asset")
router.register("asset-requests", MyAssetRequestViewSet, basename="my-asset-request")
router.register("licenses", MyLicenseViewSet, basename="my-license")

urlpatterns = [path("", include(router.urls))]
