from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Category, NewsArticle

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'created_at']
        read_only_fields = ['slug', 'created_at']

class NewsArticleSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    image = serializers.ImageField(required=False)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = NewsArticle
        fields = [
            'id', 'title', 'slug', 'summary', 'content', 'image', 'author', 
            'category', 'category_id', 'published_at', 'status', 'status_display', 
            'view_count', 'created_at', 'updated_at', 'deleted_at'
        ]
        read_only_fields = ['slug', 'author', 'view_count', 'created_at', 'updated_at', 'deleted_at']

    def validate_status(self, value):
        if value not in ['draft', 'published']:
            raise serializers.ValidationError('Status must be draft or published.')
        return value


class SuperAdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if not user.is_active:
            raise AuthenticationFailed('Account is inactive.')

        if not user.is_superuser:
            raise AuthenticationFailed('Superadmin access required.')

        # Keep Django admin compatibility if an existing superuser has stale flags.
        if not user.is_staff:
            user.is_staff = True
            user.save(update_fields=['is_staff'])

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_superuser': user.is_superuser,
        }
        return data
