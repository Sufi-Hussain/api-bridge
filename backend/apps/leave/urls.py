from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import HolidayViewSet, LeaveRequestViewSet, LeaveTypeViewSet

router = DefaultRouter()
router.register("requests", LeaveRequestViewSet, basename="leave-request")
router.register("types", LeaveTypeViewSet, basename="leave-type")
router.register("holidays", HolidayViewSet, basename="holiday")

urlpatterns = [path("", include(router.urls))]
