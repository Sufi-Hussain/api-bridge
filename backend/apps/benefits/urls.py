from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MyBenefitViewSet, MyExpenseViewSet, MyLoanViewSet, MyTravelViewSet

router = DefaultRouter()
router.register("benefits", MyBenefitViewSet, basename="my-benefit")
router.register("expenses", MyExpenseViewSet, basename="my-expense")
router.register("travel", MyTravelViewSet, basename="my-travel")
router.register("loans", MyLoanViewSet, basename="my-loan")

urlpatterns = [path("", include(router.urls))]
