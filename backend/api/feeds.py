"""
Centralised news-source configuration — the single source of truth for every
external feed the platform aggregates into its own database.

`seed_sources` reads this file to create the Category + NewsSource rows, and
`import_news` ingests each active source. To add a provider, add one entry here.

feed_type:
    "rss"      → standard RSS/Atom feed (BBC, CNN, Khmer Times, RFA, VOA, Telegram bridge)
    "newsdata" → NewsData.io JSON API (needs NEWSDATA_KEY env var)

Notes on platforms the user asked about:
    • Facebook  — has NO public RSS/API. Pulling a Page requires the Graph API
                  with a Page access token + app review, so it is intentionally
                  left as an inactive MANUAL source (enable once you have a token).
    • Telegram  — public channels are read through an RSS bridge (RSSHub). These
                  are marked is_active=False by default because public bridges are
                  rate-limited; flip them on (or self-host RSSHub) when ready.
"""

# Default category seed (matches the project scope: sports, entertainment,
# technology, politics, education + Cambodia/World/Business).
CATEGORIES = [
    {"name": "World",         "icon": "🌍", "order": 1},
    {"name": "Cambodia",      "icon": "🇰🇭", "order": 2},
    {"name": "Politics",      "icon": "🏛️", "order": 3},
    {"name": "Technology",    "icon": "💻", "order": 4},
    {"name": "Sports",        "icon": "⚽", "order": 5},
    {"name": "Entertainment", "icon": "🎬", "order": 6},
    {"name": "Business",      "icon": "💼", "order": 7},
    {"name": "Education",     "icon": "📚", "order": 8},
]

# Each source: name, feed URL (api_endpoint), feed_type, the category imported
# articles default to, website, and whether to import it by default.
SOURCES = [
    # ── BBC ───────────────────────────────────────────────────────────────────
    {"name": "BBC World",         "feed_type": "rss", "category": "World",
     "url": "https://feeds.bbci.co.uk/news/world/rss.xml",                  "website": "https://www.bbc.com/news", "active": True},
    {"name": "BBC Asia",          "feed_type": "rss", "category": "World",
     "url": "https://feeds.bbci.co.uk/news/world/asia/rss.xml",             "website": "https://www.bbc.com/news", "active": True},
    {"name": "BBC Technology",    "feed_type": "rss", "category": "Technology",
     "url": "https://feeds.bbci.co.uk/news/technology/rss.xml",             "website": "https://www.bbc.com/news/technology", "active": True},
    {"name": "BBC Business",      "feed_type": "rss", "category": "Business",
     "url": "https://feeds.bbci.co.uk/news/business/rss.xml",               "website": "https://www.bbc.com/news/business", "active": True},
    {"name": "BBC Politics",      "feed_type": "rss", "category": "Politics",
     "url": "https://feeds.bbci.co.uk/news/politics/rss.xml",               "website": "https://www.bbc.com/news/politics", "active": True},
    {"name": "BBC Sport",         "feed_type": "rss", "category": "Sports",
     "url": "https://feeds.bbci.co.uk/sport/rss.xml",                       "website": "https://www.bbc.com/sport", "active": True},
    {"name": "BBC Entertainment", "feed_type": "rss", "category": "Entertainment",
     "url": "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", "website": "https://www.bbc.com/news/entertainment_and_arts", "active": True},

    # ── CNN (DISABLED) ─────────────────────────────────────────────────────────
    # CNN discontinued its public RSS feeds (rss.cnn.com) — they now return stale
    # 2023 articles with no publish dates. Left here (inactive) for reference.
    {"name": "CNN Top Stories",   "feed_type": "rss", "category": "World",
     "url": "http://rss.cnn.com/rss/edition.rss",                           "website": "https://edition.cnn.com", "active": False},
    {"name": "CNN World",         "feed_type": "rss", "category": "World",
     "url": "http://rss.cnn.com/rss/edition_world.rss",                     "website": "https://edition.cnn.com/world", "active": False},
    {"name": "CNN Technology",    "feed_type": "rss", "category": "Technology",
     "url": "http://rss.cnn.com/rss/edition_technology.rss",                "website": "https://edition.cnn.com/business/tech", "active": False},

    # ── Al Jazeera + The Guardian (working feeds with real publish dates) ──────
    {"name": "Al Jazeera",          "feed_type": "rss", "category": "World",
     "url": "https://www.aljazeera.com/xml/rss/all.xml",                    "website": "https://www.aljazeera.com", "active": True},
    {"name": "The Guardian World",  "feed_type": "rss", "category": "World",
     "url": "https://www.theguardian.com/world/rss",                       "website": "https://www.theguardian.com/world", "active": True},
    {"name": "The Guardian Tech",   "feed_type": "rss", "category": "Technology",
     "url": "https://www.theguardian.com/technology/rss",                  "website": "https://www.theguardian.com/technology", "active": True},

    # ── Khmer / Cambodia feeds ────────────────────────────────────────────────
    {"name": "Khmer Times",       "feed_type": "rss", "category": "Cambodia",
     "url": "https://www.khmertimeskh.com/feed/",                           "website": "https://www.khmertimeskh.com", "active": True},
    {"name": "CamboJA News",      "feed_type": "rss", "category": "Cambodia",
     "url": "https://cambojanews.com/feed/",                                "website": "https://cambojanews.com", "active": True},
    # RFA Khmer refuses connections from many networks (and is geo-blocked in
    # some regions) → disabled to keep import cycles clean. Re-enable if your
    # network can reach https://www.rfa.org/khmer/rss2.xml.
    {"name": "RFA Khmer",         "feed_type": "rss", "category": "Cambodia",
     "url": "https://www.rfa.org/khmer/rss2.xml",                           "website": "https://www.rfa.org/khmer", "active": False},
    # VOA Khmer has no public RSS endpoint (placeholder URL) → disabled.
    {"name": "VOA Khmer",         "feed_type": "rss", "category": "Cambodia",
     "url": "https://khmer.voanews.com/api/zq$omekvi_",                     "website": "https://khmer.voanews.com", "active": False},

    # ── Telegram channels (via RSSHub bridge — enable when ready) ──────────────
    {"name": "Telegram · Example Channel", "feed_type": "rss", "category": "Cambodia",
     "url": "https://rsshub.app/telegram/channel/durov",                   "website": "https://t.me/durov", "active": False},

    # ── NewsData.io API (needs NEWSDATA_KEY) ──────────────────────────────────
    {"name": "NewsData.io",       "feed_type": "newsdata", "category": "World",
     "url": "https://newsdata.io/api/1/news",                              "website": "https://newsdata.io", "active": False},

    # ── Facebook (no public API — placeholder, enable with Graph API token) ────
    {"name": "Facebook Page (manual)", "feed_type": "manual", "category": "Cambodia",
     "url": "",                                                            "website": "https://facebook.com", "active": False},
]
