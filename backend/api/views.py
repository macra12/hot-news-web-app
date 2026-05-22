from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from .models import Category, NewsArticle
from .serializers import (
    CategorySerializer,
    NewsArticleSerializer,
    SuperAdminTokenObtainPairSerializer,
)


class SuperAdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = SuperAdminTokenObtainPairSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ['name']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()


class NewsArticleViewSet(viewsets.ModelViewSet):
    queryset = NewsArticle.objects.all()
    serializer_class = NewsArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__id', 'category__slug', 'status', 'author']
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['published_at', 'view_count', 'title']
    ordering = ['-published_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        qs = NewsArticle.objects.select_related('author', 'category').filter(deleted_at__isnull=True)
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            qs = qs.filter(status='published')
        return qs

    @action(detail=False, methods=['get'])
    def latest(self, request):
        qs = self.get_queryset().filter(status='published').order_by('-published_at')[:10]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        qs = self.get_queryset().filter(status='published').order_by('-view_count')[:10]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        article = self.get_object()
        article.view_count += 1
        article.save(update_fields=['view_count'])
        return Response({'view_count': article.view_count}, status=status.HTTP_200_OK)

