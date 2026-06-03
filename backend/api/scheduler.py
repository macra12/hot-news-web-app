"""
Automatic background news importer.

Starts a daemon thread when the Django server boots, so the database is kept
fresh on its own — no separate terminal or OS scheduler needed. Each cycle calls
the `import_news` command (which uses conditional HTTP requests + dedup + a
freshness gate, so it's cheap and safe to run often).

Controlled by environment variables (sensible defaults):
    AUTO_IMPORT_ENABLED   "true"/"false"  (default true)
    AUTO_IMPORT_INTERVAL  seconds between cycles (default 120)
    AUTO_IMPORT_LIMIT     max items per source per cycle (default 20)
    ENABLE_AUTO_IMPORT    "true" to also run under non-runserver servers (gunicorn)

Production note: under multi-worker servers each worker would start its own
thread. For production prefer a single dedicated worker, OS cron/Task Scheduler
calling `manage.py import_news`, or `manage.py run_importer`.
"""
import os
import sys
import time
import logging
import threading

logger = logging.getLogger("api.scheduler")
_started = False


def _loop(interval, limit):
    # Let the server finish booting before the first import.
    time.sleep(8)
    from django.core.management import call_command
    while True:
        try:
            # Prints the cycle to the server console so you can see it working.
            call_command("import_news", limit=limit)
        except Exception as exc:  # noqa: BLE001 — never let the loop die
            logger.warning("auto-import error: %s", exc)
        time.sleep(interval)


def start_auto_importer():
    """Start the background importer once, only in an actual server process."""
    global _started
    if _started:
        return
    if os.environ.get("AUTO_IMPORT_ENABLED", "true").lower() not in ("1", "true", "yes"):
        return

    running_server = "runserver" in sys.argv
    if running_server:
        # `runserver` autoreloader runs ready() in two processes; only the
        # reloaded child (RUN_MAIN=true) should own the importer thread.
        # With --noreload there's a single process and no RUN_MAIN — run there.
        noreload = "--noreload" in sys.argv
        if not noreload and os.environ.get("RUN_MAIN") != "true":
            return
    else:
        # migrate / shell / test / collectstatic etc. must NOT import news.
        # Allow opt-in for real app servers (gunicorn/uwsgi) via env.
        if os.environ.get("ENABLE_AUTO_IMPORT", "").lower() not in ("1", "true", "yes"):
            return

    interval = max(30, int(os.environ.get("AUTO_IMPORT_INTERVAL", "120")))
    limit = int(os.environ.get("AUTO_IMPORT_LIMIT", "20"))
    _started = True
    threading.Thread(target=_loop, args=(interval, limit), daemon=True, name="auto-importer").start()
    logger.info("Auto-importer started — every %ss (limit %s/source).", interval, limit)
