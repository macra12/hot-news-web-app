"""
Curate the category list down to the project's defined scope.

- Ensures the canonical categories (from api/feeds.py) exist with proper icon/order.
- Merges known duplicates/aliases into the canonical category, reassigning every
  article first so no content is lost (e.g. "Sport" -> "Sports").
- Deletes leftover non-canonical categories only when they have no articles.

    python manage.py curate_categories
"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import Category, NewsArticle
from api import feeds

# Non-canonical slug -> canonical category name
ALIASES = {
    "sport": "Sports",
    "tech": "Technology",
    "technologies": "Technology",
    "politic": "Politics",
    "entertainment-and-arts": "Entertainment",
    "entertainments": "Entertainment",
    "biz": "Business",
    "economy": "Business",
    "local": "Cambodia",
    "khmer": "Cambodia",
    "international": "World",
    "global": "World",
}


class Command(BaseCommand):
    help = "Merge duplicate categories and keep only the project-scope set."

    def handle(self, *args, **options):
        canonical = {}
        for c in feeds.CATEGORIES:
            obj, _ = Category.objects.update_or_create(
                name=c["name"],
                defaults={"icon": c["icon"], "display_order": c["order"]},
            )
            canonical[c["name"]] = obj
        canonical_slugs = {slugify(n) for n in canonical}

        merged = removed = 0
        for cat in Category.objects.exclude(name__in=canonical.keys()):
            target_name = ALIASES.get(cat.slug)
            target = canonical.get(target_name) if target_name else None

            if target:
                # Reassign every article, then drop the duplicate.
                moved = NewsArticle.objects.filter(category=cat).update(category=target)
                cat.delete()
                merged += 1
                self.stdout.write(f"  merged '{cat.name}' -> '{target.name}' ({moved} articles)")
            elif not NewsArticle.objects.filter(category=cat).exists():
                cat.delete()
                removed += 1
                self.stdout.write(f"  removed empty '{cat.name}'")
            else:
                count = NewsArticle.objects.filter(category=cat).count()
                self.stdout.write(self.style.WARNING(
                    f"  kept '{cat.name}' ({count} articles) — not in scope, no alias. "
                    f"Reassign manually if needed."
                ))

        self.stdout.write(self.style.SUCCESS(
            f"Done. {merged} merged, {removed} removed. "
            f"Canonical categories: {', '.join(sorted(canonical))}."
        ))
