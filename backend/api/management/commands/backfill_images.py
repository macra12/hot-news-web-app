"""
Backfill missing article images.

Many feeds (Al Jazeera, Google News, …) ship no image in their RSS, so older
imported articles were stored with an empty image_url. This walks the imageless
external articles and fills image_url from each article page's og:image.

    python manage.py backfill_images              # up to 60 articles
    python manage.py backfill_images --limit 200  # do more in one pass

Bounded by --limit so it can run on every deploy cheaply: once an article gets
an image it is skipped next time, so repeated runs converge quickly.
"""
from django.core.management.base import BaseCommand

from api.models import NewsArticle
from .import_news import fetch_og_image


class Command(BaseCommand):
    help = "Fill image_url for external articles that have no image, using og:image."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=60, help="Max articles to process")

    def handle(self, *args, **options):
        limit = options["limit"]
        # Imageless external articles that still have a source link to scrape.
        # NOTE: `image` (the uploaded-file field) is nullable, so we must NOT
        # filter image="" — external articles never have an upload anyway, so we
        # key off the empty remote image_url instead.
        qs = (
            NewsArticle.objects.filter(image_url="", is_external=True)
            .exclude(external_url="")
            .order_by("-published_at")[:limit]
        )

        scanned = filled = 0
        for article in qs:
            scanned += 1
            img = fetch_og_image(article.external_url)
            if img:
                article.image_url = img[:600]
                article.save(update_fields=["image_url"])
                filled += 1

        self.stdout.write(self.style.SUCCESS(
            f"Backfill done. {filled} images added ({scanned} articles scanned)."
        ))
