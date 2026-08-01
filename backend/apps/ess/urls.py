from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    EducationViewSet,
    EmergencyContactViewSet,
    ExperienceViewSet,
    FamilyViewSet,
    ProfileView,
    SkillViewSet,
)

router = DefaultRouter()
router.register("emergency-contacts", EmergencyContactViewSet, basename="emergency-contact")
router.register("family", FamilyViewSet, basename="family")
router.register("education", EducationViewSet, basename="education")
router.register("experience", ExperienceViewSet, basename="experience")
router.register("skills", SkillViewSet, basename="skill")

urlpatterns = [
    path("profile", ProfileView.as_view(), name="ess-profile"),
    path("", include(router.urls)),
]