from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DepartmentViewSet, HREmployeeViewSet

router = DefaultRouter()
router.register("departments", DepartmentViewSet, basename="hr-department")
router.register("employees", HREmployeeViewSet, basename="hr-employee")

urlpatterns = [path("", include(router.urls))]
