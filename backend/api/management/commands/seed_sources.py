"""
Seed the database with the default categories and news sources defined in
api/feeds.py. Safe to run repeatedly — it updates existing rows in place.

    python manage.py seed_sources
"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import Category, NewsSource
from api import feeds


class Command(BaseCommand):
    help = "Create/update default categories and news sources from api/feeds.py"

    def handle(self, *args, **options):
        # ── Categories ────────────────────────────────────────────────────────
        cat_by_name = {}
        for c in feeds.CATEGORIES:
            obj, created = Category.objects.update_or_create(
                name=c["name"],
                defaults={"icon": c["icon"], "display_order": c["order"]},
            )
            cat_by_name[c["name"]] = obj
            self.stdout.write(("  + " if created else "  · ") + f"category {obj.name}")

        # ── Sources ───────────────────────────────────────────────────────────
        for s in feeds.SOURCES:
            category = cat_by_name.get(s["category"])
            obj, created = NewsSource.objects.update_or_create(
                name=s["name"],
                defaults={
                    "slug":             slugify(s["name"]),
                    "api_endpoint":     s["url"],
                    "website":          s.get("website", ""),
                    "feed_type":        s["feed_type"],
                    "default_category": category,
                    "is_external":      s["feed_type"] != "manual",
                    "is_active":        s["active"],
                },
            )
            self.stdout.write(("  + " if created else "  · ") + f"source {obj.name} ({obj.feed_type})")

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(feeds.CATEGORIES)} categories and {len(feeds.SOURCES)} sources."
        ))
