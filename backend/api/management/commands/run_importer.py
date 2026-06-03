"""
Continuously keep the database fresh by importing the newest news on a loop.

This is the "call the feeds every time → store the newest" worker. Run it once
and leave it running; it re-imports every `--interval` seconds. Duplicate
articles are skipped automatically (dedup by original URL), and stale/undated
items are rejected by import_news, so only genuinely new, recent stories land.

    python manage.py run_importer                      # every 10 min, limit 20
    python manage.py run_importer --interval 300       # every 5 min
    python manage.py run_importer --limit 15 --prune-days 60

For production, prefer an OS scheduler (Windows Task Scheduler / cron) calling
`python manage.py import_news` — but this loop is the zero-config way to start.
"""
import time
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = "Run the news importer continuously on a fixed interval."

    def add_arguments(self, parser):
        parser.add_argument("--interval", type=int, default=600, help="Seconds between imports (default 600).")
        parser.add_argument("--limit", type=int, default=20, help="Max items per source per run.")
        parser.add_argument("--prune-days", type=int, default=0,
                            help="If set, delete external articles older than N days each cycle.")

    def handle(self, *args, **options):
        # Conditional GET means frequent polling is cheap; 30s floor is plenty.
        interval = max(30, options["interval"])
        limit = options["limit"]
        prune_days = options["prune_days"]

        self.stdout.write(self.style.SUCCESS(
            f"News importer started — every {interval}s (limit {limit}/source). Ctrl+C to stop."
        ))

        cycle = 0
        while True:
            cycle += 1
            stamp = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
            self.stdout.write(f"\n── cycle {cycle} @ {stamp} ──")
            try:
                call_command("import_news", limit=limit)
                if prune_days > 0:
                    self._prune(prune_days)
            except Exception as exc:  # noqa: BLE001 — never let one cycle kill the loop
                self.stdout.write(self.style.ERROR(f"  cycle error: {exc}"))

            try:
                time.sleep(interval)
            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING("\nImporter stopped."))
                break

    def _prune(self, days):
        from datetime import timedelta
        from api.models import NewsArticle
        cutoff = timezone.now() - timedelta(days=days)
        deleted, _ = NewsArticle.objects.filter(
            is_external=True, published_at__lt=cutoff
        ).delete()
        if deleted:
            self.stdout.write(f"  pruned {deleted} article(s) older than {days} days")
