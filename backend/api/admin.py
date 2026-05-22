from django.contrib import admin
from django.utils import timezone
from .models import Category, NewsArticle

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

class NewsArticleInline(admin.StackedInline):
    model = NewsArticle
    extra = 0
    readonly_fields = ('view_count', 'created_at', 'updated_at')

@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'published_at', 'view_count')
    list_filter = ('status', 'category', 'author', 'published_at', 'created_at')
    search_fields = ('title', 'slug', 'content')
    date_hierarchy = 'published_at'
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('view_count', 'created_at', 'updated_at', 'deleted_at')
    inlines = [NewsArticleInline] if False else []
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'summary', 'content', 'image')
        }),
        ('Publish', {
            'fields': ('status', 'published_at', 'category')
        }),
        ('Meta', {
            'fields': ('author', 'view_count', 'created_at', 'updated_at', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(deleted_at__isnull=True)

    def delete_model(self, request, obj):
        obj.deleted_at = timezone.now()
        obj.save()
