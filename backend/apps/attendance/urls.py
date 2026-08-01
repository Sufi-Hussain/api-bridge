from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AttendancePunchViewSet, TimesheetEntryViewSet

router = DefaultRouter()
router.register("punches", AttendancePunchViewSet, basename="attendance-punch")
router.register("timesheets", TimesheetEntryViewSet, basename="timesheet")

urlpatterns = [path("", include(router.urls))]
