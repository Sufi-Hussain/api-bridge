from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (SpectacularAPIView, SpectacularSwaggerView,)

api_patterns = [
    path("auth/", include("accounts.urls")),
    path("ess/", include("apps.ess.urls")),
    path("hr/", include("apps.hr.urls")),
    path("leave/", include("apps.leave.urls")),
    path("attendance/", include("apps.attendance.urls")),
    path("payroll/", include("apps.payroll.urls")),
    path("documents/", include("apps.documents.urls")),
    path("benefits/", include("apps.benefits.urls")),
    path("assets/", include("apps.assets.urls")),
    path("learning/", include("apps.learning.urls")),
    path("performance/", include("apps.performance.urls")),
    path("timesheets/", include("apps.timesheets.urls")),

    path("notifications/", include("apps.notifications.urls")),
    path("ai/", include("apps.ai.urls")),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(api_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
