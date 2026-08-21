from rest_framework.routers import DefaultRouter

from .views import (
    ClientViewSet,
    MyTimesheetViewSet,
    ProjectTaskViewSet,
    ProjectViewSet,
    TimesheetApprovalViewSet,
)

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="ts-project")
router.register("project-tasks", ProjectTaskViewSet, basename="ts-project-task")
router.register("clients", ClientViewSet, basename="ts-client")
router.register("mine", MyTimesheetViewSet, basename="ts-mine")
router.register("approvals", TimesheetApprovalViewSet, basename="ts-approval")

urlpatterns = router.urls
