from django.contrib import admin
from django.utils import timezone
from .models import (
    Category, Tag, NewsSource, UserProfile, NewsArticle,
    CategoryFollow, Bookmark, ArticleReaction, ReadingHistory,
    SearchQuery, Recommendation,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'display_order', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(NewsSource)
class NewsSourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_external', 'is_active', 'website', 'created_at')
    list_filter = ('is_external', 'is_active')
    search_fields = ('name', 'website')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'phone', 'created_at')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')


@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'is_external',
                    'published_at', 'view_count', 'like_count')
    list_filter = ('status', 'category', 'is_external', 'source', 'author',
                   'published_at', 'created_at')
    search_fields = ('title', 'slug', 'content')
    date_hierarchy = 'published_at'
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tags',)
    readonly_fields = ('view_count', 'like_count', 'bookmark_count',
                       'created_at', 'updated_at', 'deleted_at')
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'summary', 'content', 'image', 'tags')
        }),
        ('Source', {
            'fields': ('source', 'is_external', 'external_url')
        }),
        ('Publish', {
            'fields': ('status', 'published_at', 'category')
        }),
        ('Meta', {
            'fields': ('author', 'view_count', 'like_count', 'bookmark_count',
                       'created_at', 'updated_at', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(deleted_at__isnull=True)

    def delete_model(self, request, obj):
        obj.deleted_at = timezone.now()
        obj.save()


@admin.register(CategoryFollow)
class CategoryFollowAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'created_at')
    search_fields = ('user__username', 'category__name')


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('user', 'article', 'created_at')
    search_fields = ('user__username', 'article__title')


@admin.register(ArticleReaction)
class ArticleReactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'article', 'type', 'created_at')
    list_filter = ('type',)
    search_fields = ('user__username', 'article__title')


@admin.register(ReadingHistory)
class ReadingHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'article', 'read_seconds', 'read_at')
    search_fields = ('user__username', 'article__title')


@admin.register(SearchQuery)
class SearchQueryAdmin(admin.ModelAdmin):
    list_display = ('query', 'user', 'results_count', 'created_at')
    search_fields = ('query', 'user__username')


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('user', 'article', 'score', 'reason', 'created_at')
    list_filter = ('reason',)
    search_fields = ('user__username', 'article__title')
