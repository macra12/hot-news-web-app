from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex
from django.utils.text import slugify
from django.utils import timezone
import uuid


# ──────────────────────────────────────────────────────────────────────────────
#  Category
# ──────────────────────────────────────────────────────────────────────────────
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.CharField(max_length=255, blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Emoji or icon name for the UI")
    display_order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['slug']),
        ]
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ──────────────────────────────────────────────────────────────────────────────
#  Tag  — fine-grained topic labels used for content-based recommendations
# ──────────────────────────────────────────────────────────────────────────────
class Tag(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['slug'])]
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ──────────────────────────────────────────────────────────────────────────────
#  NewsSource  — where an article came from (own CMS or an external public API)
# ──────────────────────────────────────────────────────────────────────────────
class NewsSource(models.Model):
    class FeedType(models.TextChoices):
        RSS      = 'rss',      'RSS / Atom feed'
        NEWSDATA = 'newsdata', 'NewsData.io API'
        MANUAL   = 'manual',   'Manual / CMS only'

    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    website = models.URLField(blank=True)
    api_endpoint = models.URLField(blank=True, help_text="RSS/feed or public news API URL")
    feed_type = models.CharField(max_length=20, choices=FeedType.choices, default=FeedType.RSS)
    default_category = models.ForeignKey(
        'Category', on_delete=models.SET_NULL,
        related_name='sources', null=True, blank=True,
        help_text="Articles imported from this source default to this category",
    )
    is_external = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    last_imported_at = models.DateTimeField(null=True, blank=True)
    # HTTP conditional-request caches so frequent polling only downloads when
    # the feed actually changed (server replies 304 Not Modified otherwise).
    etag = models.CharField(max_length=255, blank=True)
    last_modified = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['slug'])]
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ──────────────────────────────────────────────────────────────────────────────
#  UserProfile  — extends Django's built-in User (readers, reporters, admins)
# ──────────────────────────────────────────────────────────────────────────────
class UserProfile(models.Model):
    class Role(models.TextChoices):
        READER   = 'reader',   'Reader'
        REPORTER = 'reporter', 'Reporter'
        ADMIN    = 'admin',    'Admin'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.READER)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    # Categories a user follows are stored in CategoryFollow (keyed on User);
    # access them with `user.category_follows`. This drives the personalised feed.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['role'])]

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN or self.user.is_staff

    def __str__(self):
        return f"{self.user.username} ({self.role})"


# ──────────────────────────────────────────────────────────────────────────────
#  NewsArticle
# ──────────────────────────────────────────────────────────────────────────────
class NewsArticle(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    summary = models.TextField(max_length=500, blank=True)
    content = models.TextField()
    image = models.ImageField(upload_to='news/', blank=True, null=True)
    # Remote image URL for imported/external articles (hotlinked, not downloaded)
    image_url = models.URLField(max_length=600, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='articles')
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name='articles',
        null=True,
        blank=True,
    )
    tags = models.ManyToManyField(Tag, related_name='articles', blank=True)

    # Source tracking — own content vs. external public-API content
    source = models.ForeignKey(
        NewsSource, on_delete=models.SET_NULL,
        related_name='articles', null=True, blank=True,
    )
    is_external = models.BooleanField(default=False)
    external_url = models.URLField(max_length=500, blank=True)

    published_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    # Denormalised engagement counters — cheap to read for trending/recommendations
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    bookmark_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)  # soft delete

    # Precomputed PostgreSQL full-text index (title^A, summary^B, content^C).
    # Maintained by a post_save signal; queried with a GIN index for fast,
    # ranked search that scales to large article counts.
    search_vector = SearchVectorField(null=True, blank=True, editable=False)

    class Meta:
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['published_at']),
            models.Index(fields=['category']),
            models.Index(fields=['status']),
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['view_count']),
            models.Index(fields=['is_external']),
            models.Index(fields=['external_url']),
            GinIndex(fields=['search_vector'], name='news_search_vector_gin'),
        ]
        ordering = ['-published_at', 'title']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.deleted_at:
            super().delete(*args, **kwargs)
        else:
            self.deleted_at = timezone.now()
            self.save()

    def hard_delete(self):
        super().delete()

    @property
    def is_active(self):
        return not self.deleted_at

    @property
    def display_image(self):
        """Best available image: an uploaded file, else the remote/external URL."""
        if self.image:
            try:
                return self.image.url
            except ValueError:
                pass
        return self.image_url or None

    def __str__(self):
        return self.title


# ──────────────────────────────────────────────────────────────────────────────
#  CategoryFollow  — explicit "I'm interested in this topic" signal
# ──────────────────────────────────────────────────────────────────────────────
class CategoryFollow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='category_follows')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='category_follows')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'category'], name='unique_user_category_follow'),
        ]
        indexes = [models.Index(fields=['user', 'category'])]

    def __str__(self):
        return f"{self.user.username} → {self.category.name}"


# ──────────────────────────────────────────────────────────────────────────────
#  Bookmark  — saved articles (strong interest signal)
# ──────────────────────────────────────────────────────────────────────────────
class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    article = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'article'], name='unique_user_article_bookmark'),
        ]
        indexes = [models.Index(fields=['user', '-created_at'])]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} ★ {self.article.title}"


# ──────────────────────────────────────────────────────────────────────────────
#  ArticleReaction  — like / love (engagement signal)
# ──────────────────────────────────────────────────────────────────────────────
class ArticleReaction(models.Model):
    class Type(models.TextChoices):
        LIKE = 'like', 'Like'
        LOVE = 'love', 'Love'
        WOW  = 'wow',  'Wow'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reactions')
    article = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name='reactions')
    type = models.CharField(max_length=10, choices=Type.choices, default=Type.LIKE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'article'], name='unique_user_article_reaction'),
        ]
        indexes = [models.Index(fields=['article', 'type'])]

    def __str__(self):
        return f"{self.user.username} {self.type} {self.article.title}"


# ──────────────────────────────────────────────────────────────────────────────
#  ReadingHistory  — behaviour signal that powers "because you read…"
# ──────────────────────────────────────────────────────────────────────────────
class ReadingHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reading_history')
    article = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name='reads')
    read_seconds = models.PositiveIntegerField(default=0, help_text="Dwell time in seconds")
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', '-read_at']),
            models.Index(fields=['article']),
        ]
        ordering = ['-read_at']
        verbose_name_plural = 'Reading history'

    def __str__(self):
        return f"{self.user.username} read {self.article.title}"


# ──────────────────────────────────────────────────────────────────────────────
#  SearchQuery  — search intent, used for trending topics & recommendations
# ──────────────────────────────────────────────────────────────────────────────
class SearchQuery(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        related_name='searches', null=True, blank=True,  # null = anonymous
    )
    query = models.CharField(max_length=200)
    results_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['query']),
            models.Index(fields=['-created_at']),
        ]
        ordering = ['-created_at']
        verbose_name_plural = 'Search queries'

    def __str__(self):
        return self.query


# ──────────────────────────────────────────────────────────────────────────────
#  Recommendation  — precomputed per-user picks with an explainable reason
# ──────────────────────────────────────────────────────────────────────────────
class Recommendation(models.Model):
    class Reason(models.TextChoices):
        FOLLOWED_CATEGORY = 'followed_category', 'From a followed category'
        SIMILAR_TAGS      = 'similar_tags',      'Similar to what you read'
        TRENDING          = 'trending',          'Trending now'
        POPULAR           = 'popular',           'Popular with readers'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    article = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name='recommended_to')
    score = models.FloatField(default=0.0, help_text="Higher = stronger match")
    reason = models.CharField(max_length=30, choices=Reason.choices, default=Reason.POPULAR)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'article'], name='unique_user_article_recommendation'),
        ]
        indexes = [
            models.Index(fields=['user', '-score']),
        ]
        ordering = ['-score', '-created_at']

    def __str__(self):
        return f"{self.article.title} → {self.user.username} ({self.score:.2f})"
