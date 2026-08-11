from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MyCertificationViewSet, MyCourseViewSet

router = DefaultRouter()
router.register("courses", MyCourseViewSet, basename="my-course")
router.register("certifications", MyCertificationViewSet, basename="my-certification")

urlpatterns = [path("", include(router.urls))]
