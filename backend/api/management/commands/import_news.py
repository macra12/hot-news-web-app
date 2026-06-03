"""
Aggregate external news into the platform's own database.

Reads every active NewsSource (seeded from api/feeds.py), fetches its feed,
parses each item into a fully-formed NewsArticle (title, summary, content,
image, author, published date, source, category, external link), de-duplicates
by the original URL, and stores it — so the rest of the app serves a single,
centralised source of truth from /api/news/.

    python manage.py import_news                 # all active sources
    python manage.py import_news --source "BBC World"
    python manage.py import_news --limit 15      # max items per source
"""
import os
import re
import time
import hashlib
import html
from email.utils import parsedate_to_datetime
from datetime import datetime, timedelta, timezone as dt_timezone

import requests
import feedparser

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.text import slugify

from api.models import NewsArticle, NewsSource

# A real browser UA — some publishers (Cloudflare-fronted) block bot UAs,
# especially from datacenter IPs like the production host.
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")
IMG_RE = re.compile(r"""<img[^>]+src=["']([^"']+)["']""", re.I)
KHMER_RE = re.compile(r"[\u1780-\u17ff]")
MIN_TEXT_CHARS = 60
MOJIBAKE_MARKERS = ("\u00c3", "\u00c2", "\u00e2", "\u00e1")

CP1252_REVERSE = {
    0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85,
    0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A,
    0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92,
    0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
    0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C,
    0x017E: 0x9E, 0x0178: 0x9F,
}

CAMBODIA_TERMS = (
    "cambodia", "cambodian", "khmer", "phnom penh", "siem reap",
    "battambang", "kampot", "kep", "sihanoukville", "preah sihanouk",
    "bavet", "poipet", "svay rieng", "takeo", "kampong", "kandal",
    "pursat", "mondulkiri", "ratanakiri", "prey veng", "hun manet",
    "hun sen", "senate", "national assembly", "ministry",
    "khmertimeskh.com", "cambojanews.com", "camboja",
    "phnompenhpost.com", "cambodianess.com", "freshnewsasia.com",
)
BAD_IMAGE_TERMS = (
    "logo", "favicon", "icon", "placeholder", "default-image",
    "default_img", "blank", "avatar", "profile",
)


def repair_mojibake(text):
    if not text:
        return ""
    if not any(marker in text for marker in MOJIBAKE_MARKERS):
        return text

    raw = bytearray()
    for char in text:
        try:
            raw.extend(char.encode("cp1252"))
        except UnicodeEncodeError:
            code = ord(char)
            if code <= 0xFF:
                raw.append(code)
            elif code in CP1252_REVERSE:
                raw.append(CP1252_REVERSE[code])
            else:
                return text

    try:
        return raw.decode("utf-8").strip() or text
    except UnicodeDecodeError:
        return text


def clean_text(text):
    text = html.unescape(repair_mojibake(text or ""))
    return WS_RE.sub(" ", text).strip()


def clean_url(url):
    return html.unescape(repair_mojibake(str(url or ""))).strip()


def clean_image_url(url):
    url = clean_url(url)
    if not url:
        return ""
    lower = url.lower()
    return "" if any(term in lower for term in BAD_IMAGE_TERMS) else url


def safe_int(value):
    try:
        return int(value or 0)
    except (TypeError, ValueError):
        return 0


def strip_html(text):
    if not text:
        return ""
    text = TAG_RE.sub(" ", text)
    return clean_text(text)


def extract_image(entry):
    """Pull the best image URL out of an RSS/Atom entry."""
    # media:content / media:thumbnail
    candidates = []
    for key in ("media_content", "media_thumbnail"):
        media = entry.get(key)
        if media and isinstance(media, list):
            for item in media:
                url = clean_image_url(item.get("url"))
                if url:
                    width = safe_int(item.get("width") or item.get("height"))
                    candidates.append((width, url))
    if candidates:
        return max(candidates, key=lambda item: item[0])[1]
    # enclosure links
    for link in entry.get("links", []):
        if link.get("rel") == "enclosure" and str(link.get("type", "")).startswith("image"):
            return clean_image_url(link.get("href"))
    if entry.get("enclosures"):
        href = clean_image_url(entry["enclosures"][0].get("href") or entry["enclosures"][0].get("url"))
        if href:
            return href
    # first <img> inside the summary/content HTML
    html = ""
    if entry.get("content"):
        html = entry["content"][0].get("value", "")
    html = html or entry.get("summary", "")
    m = IMG_RE.search(html)
    return clean_image_url(m.group(1)) if m else ""


def is_useful_item(item):
    text = f"{item.get('title', '')} {item.get('summary', '')} {item.get('content', '')}".strip()
    return bool(item.get("title") and item.get("link") and (len(text) >= MIN_TEXT_CHARS or item.get("image")))


def is_cambodia_item(item):
    haystack = " ".join(
        str(item.get(key, ""))
        for key in ("title", "summary", "content", "link")
    ).lower()
    return bool(KHMER_RE.search(haystack) or any(term in haystack for term in CAMBODIA_TERMS))


def entry_datetime(entry):
    """Return the entry's real publish datetime, or None if it has none.

    We deliberately do NOT fall back to "now": undated items usually come from
    stale/broken feeds, and stamping them with the current time makes old news
    masquerade as fresh.
    """
    parsed = entry.get("published_parsed") or entry.get("updated_parsed")
    if parsed:
        return datetime.fromtimestamp(time.mktime(parsed), tz=dt_timezone.utc)
    return None


def parse_datetime_value(value):
    if not value:
        return None
    cleaned = clean_text(str(value)).replace("Z", "+00:00")
    for parser in (
        lambda raw: datetime.fromisoformat(raw),
        parsedate_to_datetime,
    ):
        try:
            dt = parser(cleaned)
        except (TypeError, ValueError, OverflowError, IndexError):
            continue
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=dt_timezone.utc)
        return dt
    return None


# Reject items older than this — keeps the feed genuinely "fresh".
MAX_AGE_DAYS = 30


def unique_slug(title, link):
    base = slugify(title)[:180] or "article"
    if not NewsArticle.objects.filter(slug=base).exists():
        return base
    suffix = hashlib.md5((link or title).encode("utf-8")).hexdigest()[:8]
    return f"{base}-{suffix}"[:200]


class Command(BaseCommand):
    help = "Fetch active news sources and store their articles in the database."

    def add_arguments(self, parser):
        parser.add_argument("--source", type=str, default=None, help="Only import this source name")
        parser.add_argument("--limit", type=int, default=20, help="Max items per source")

    # ── Author for imported articles ──────────────────────────────────────────
    def get_bot_user(self):
        user, _ = User.objects.get_or_create(
            username="newsbot",
            defaults={"first_name": "News", "last_name": "Aggregator", "is_active": True},
        )
        return user

    def handle(self, *args, **options):
        sources = NewsSource.objects.filter(is_active=True)
        if options["source"]:
            sources = sources.filter(name=options["source"])

        if not sources.exists():
            self.stdout.write(self.style.WARNING(
                "No active sources. Run `python manage.py seed_sources` first."
            ))
            return

        bot = self.get_bot_user()
        total_new = total_seen = 0

        for source in sources:
            if source.feed_type == "manual" or not source.api_endpoint:
                continue
            try:
                if source.feed_type == "newsdata":
                    items = self.fetch_newsdata(source, options["limit"])
                else:
                    items = self.fetch_rss(source, options["limit"])
            except requests.exceptions.RequestException as exc:
                # Network/HTTP problem — keep it to one clean line, keep going.
                self.stdout.write(self.style.WARNING(f"  ⚠ {source.name}: unreachable ({type(exc).__name__})"))
                continue
            except Exception as exc:  # noqa: BLE001 — keep importing other sources
                self.stdout.write(self.style.ERROR(f"  ✗ {source.name}: {exc}"))
                continue

            if items is None:  # 304 Not Modified — nothing changed since last poll
                self.stdout.write(f"  · {source.name}: not modified")
                continue

            cutoff = timezone.now() - timedelta(days=MAX_AGE_DAYS)
            new = skipped = 0
            for item in items:
                total_seen += 1
                link = item["link"]
                published = item["published_at"]
                if not link or not item["title"]:
                    continue
                # Freshness gate: only store items with a real, recent publish date.
                if published is None or published < cutoff:
                    skipped += 1
                    continue
                if not is_useful_item(item):
                    skipped += 1
                    continue
                if (
                    source.default_category
                    and source.default_category.slug == "cambodia"
                    and not is_cambodia_item(item)
                ):
                    skipped += 1
                    continue
                if len(link) > 500:
                    skipped += 1
                    continue
                if NewsArticle.objects.filter(external_url=link).exists():
                    continue
                try:
                    NewsArticle.objects.create(
                        title=item["title"][:200],
                        slug=unique_slug(item["title"], link),
                        summary=item["summary"][:500],
                        content=item["content"] or item["summary"] or item["title"],
                        image_url=item["image"][:600] if item["image"] else "",
                        author=bot,
                        category=source.default_category,
                        source=source,
                        is_external=True,
                        external_url=link[:500],
                        status="published",
                        published_at=item["published_at"],
                    )
                    new += 1
                except Exception:  # noqa: BLE001 — one bad item must not kill the cycle
                    skipped += 1
                    continue

            total_new += new
            source.last_imported_at = timezone.now()
            source.save(update_fields=["last_imported_at"])
            self.stdout.write(f"  · {source.name}: +{new} new, {skipped} stale/undated ({len(items)} fetched)")

        self.stdout.write(self.style.SUCCESS(
            f"Done. {total_new} new articles stored ({total_seen} items scanned)."
        ))

    # ── RSS / Atom ────────────────────────────────────────────────────────────
    def fetch_rss(self, source, limit):
        # Conditional GET: only download when the feed changed since last poll.
        headers = {"User-Agent": UA}
        if source.etag:
            headers["If-None-Match"] = source.etag
        if source.last_modified:
            headers["If-Modified-Since"] = source.last_modified

        resp = requests.get(source.api_endpoint, headers=headers, timeout=20)
        if resp.status_code == 304:
            return None  # nothing new — saves bandwidth and avoids rate limits
        resp.raise_for_status()

        # Remember validators for next time.
        new_etag = resp.headers.get("ETag", "")
        new_lm = resp.headers.get("Last-Modified", "")
        if new_etag != source.etag or new_lm != source.last_modified:
            source.etag = new_etag
            source.last_modified = new_lm
            source.save(update_fields=["etag", "last_modified"])

        parsed = feedparser.parse(resp.content)
        items = []
        for entry in parsed.entries[:limit]:
            content = ""
            if entry.get("content"):
                content = strip_html(entry["content"][0].get("value", ""))
            summary = strip_html(entry.get("summary", ""))
            items.append({
                "title":        strip_html(entry.get("title", "")),
                "summary":      summary,
                "content":      content or summary,
                "image":        extract_image(entry),
                "link":         clean_url(entry.get("link", "")),
                "published_at": entry_datetime(entry),
            })
        return items

    # ── NewsData.io API ───────────────────────────────────────────────────────
    def fetch_newsdata(self, source, limit):
        key = os.environ.get("NEWSDATA_KEY", "")
        if not key:
            raise RuntimeError("NEWSDATA_KEY env var not set")
        params = {"apikey": key, "language": "en", "size": min(limit, 10)}
        resp = requests.get(source.api_endpoint, params=params, headers={"User-Agent": UA}, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        items = []
        for r in (data.get("results") or [])[:limit]:
            items.append({
                "title":        clean_text(r.get("title") or ""),
                "summary":      strip_html(r.get("description") or ""),
                "content":      strip_html(r.get("content") or r.get("description") or ""),
                "image":        clean_image_url(r.get("image_url") or ""),
                "link":         clean_url(r.get("link") or ""),
                "published_at": parse_datetime_value(r.get("pubDate")),
            })
        return items
