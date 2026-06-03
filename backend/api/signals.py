from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.contrib.postgres.search import SearchVector
from .models import UserProfile, NewsArticle


@receiver(post_save, sender=User)
def ensure_user_profile(sender, instance, created, **kwargs):
    """Create a UserProfile for every new user; promote staff/superusers to admin."""
    if created:
        role = UserProfile.Role.ADMIN if (instance.is_staff or instance.is_superuser) else UserProfile.Role.READER
        UserProfile.objects.create(user=instance, role=role)
    else:
        # Keep the profile in sync if a user is later promoted to staff/superuser.
        UserProfile.objects.get_or_create(user=instance)


# Weighted search vector: title (A) > summary (B) > content (C).
ARTICLE_SEARCH_VECTOR = (
    SearchVector("title", weight="A", config="english")
    + SearchVector("summary", weight="B", config="english")
    + SearchVector("content", weight="C", config="english")
)


@receiver(post_save, sender=NewsArticle)
def update_article_search_vector(sender, instance, **kwargs):
    """Recompute the full-text vector after each save, and drop the stats cache.

    Uses .update() so it writes only the search_vector column and does NOT
    re-fire post_save (no recursion).
    """
    if kwargs.get("update_fields") and "search_vector" in kwargs["update_fields"]:
        return  # avoid loop if something updates only the vector
    NewsArticle.objects.filter(pk=instance.pk).update(search_vector=ARTICLE_SEARCH_VECTOR)
    from django.core.cache import cache
    cache.delete("admin_stats")  # keep dashboard analytics fresh after edits
