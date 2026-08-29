from rest_framework.routers import DefaultRouter
from .views import LifecycleViewSet

router = DefaultRouter()
router.register("records", LifecycleViewSet, basename="lifecycle")
urlpatterns = router.urls
