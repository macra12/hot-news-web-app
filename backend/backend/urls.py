from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # Django admin on a configurable (non-advertised) path. Default "admin/";
    # set DJANGO_ADMIN_PATH to something non-obvious in production.
    path(settings.DJANGO_ADMIN_PATH, admin.site.urls),
    path("api/",   include("api.urls")),
    # OpenAPI schema + interactive docs
    path("api/schema/",         SpectacularAPIView.as_view(),                          name="schema"),
    path("api/docs/",           SpectacularSwaggerView.as_view(url_name="schema"),     name="swagger-ui"),
    path("api/redoc/",          SpectacularRedocView.as_view(url_name="schema"),       name="redoc"),
    # Root redirects to Swagger UI so visiting "/" doesn't 404
    path("", RedirectView.as_view(pattern_name="swagger-ui", permanent=False)),
]

# Serve uploaded media and static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,  document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
