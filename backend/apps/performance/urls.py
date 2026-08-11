from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MyGoalViewSet, MyReviewViewSet

router = DefaultRouter()
router.register("goals", MyGoalViewSet, basename="my-goal")
router.register("reviews", MyReviewViewSet, basename="my-review")

urlpatterns = [path("", include(router.urls))]
