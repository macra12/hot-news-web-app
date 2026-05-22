from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from .views import CategoryViewSet, NewsArticleViewSet, SuperAdminTokenObtainPairView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'news', NewsArticleViewSet)

urlpatterns = [
    path('auth/login/', SuperAdminTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/superadmin/login/', SuperAdminTokenObtainPairView.as_view(), name='superadmin_token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('', include(router.urls)),
]
