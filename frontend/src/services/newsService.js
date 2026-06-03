// External news service — calls Next.js /api/news server route (no CORS issues)
// All external-facing fetches are server-side; this module is the client-side façade.
import { fetchArticlesByCategory } from "@/services/cmsService";

const ROUTE = "/api/news";

async function get(feedKey) {
  const res = await fetch(`${ROUTE}?category=${encodeURIComponent(feedKey)}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.articles || [];
}

function articleDate(article) {
  const value = article.published_at || article.created_at;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function articleKey(article) {
  const url = article.externalUrl || article.external_url;
  if (url) return `url:${url.replace(/\/$/, "").toLowerCase()}`;
  if (article.slug) return `slug:${article.slug}`;
  return `title:${(article.title || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()}`;
}

function hasImage(article) {
  return Boolean(typeof article.image === "string" && article.image.trim());
}

function mergeAndRank(groups, count) {
  const byKey = new Map();

  groups.flat().forEach((article) => {
    if (!article?.title) return;
    const key = articleKey(article);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, article);
      return;
    }

    const candidateIsBetter =
      (hasImage(article) && !hasImage(existing)) ||
      articleDate(article) > articleDate(existing);

    if (candidateIsBetter) byKey.set(key, article);
  });

  return Array.from(byKey.values())
    .sort((a, b) => {
      const freshness = articleDate(b) - articleDate(a);
      if (Math.abs(freshness) > 30 * 60_000) return freshness;
      return Number(hasImage(b)) - Number(hasImage(a));
    })
    .slice(0, count);
}

/**
 * Fetch articles for a single feed category.
 * @param {string} feedKey  e.g. "world", "sports", "technology"
 * @param {number} count    Max articles to return
 */
export async function fetchCategoryNews(feedKey, count = 10) {
  try {
    const articles = await get(feedKey);
    return articles.slice(0, count);
  } catch {
    return [];
  }
}

/**
 * Merge World + Asia feeds, deduplicate by title, sort newest-first.
 * Used for the homepage lead section.
 */
export async function fetchWorldNews(count = 12) {
  try {
    const [world, asia] = await Promise.allSettled([
      get("world"),
      get("asia"),
    ]);

    const raw = [
      ...(world.status === "fulfilled" ? world.value : []),
      ...(asia.status  === "fulfilled" ? asia.value  : []),
    ];

    const seen = new Set();
    return raw
      .filter((a) => {
        if (!a.title || seen.has(a.title)) return false;
        seen.add(a.title);
        return true;
      })
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, count);
  } catch {
    return [];
  }
}

export async function fetchHybridWorldNews(count = 12) {
  const [live, stored] = await Promise.allSettled([
    fetchWorldNews(count),
    fetchArticlesByCategory("world", count),
  ]);

  return mergeAndRank([
    live.status === "fulfilled" ? live.value : [],
    stored.status === "fulfilled" ? stored.value : [],
  ], count);
}

export async function fetchHybridCategoryNews(feedKey, count = 10) {
  const [live, stored] = await Promise.allSettled([
    fetchCategoryNews(feedKey, count),
    fetchArticlesByCategory(feedKey, count),
  ]);

  return mergeAndRank([
    live.status === "fulfilled" ? live.value : [],
    stored.status === "fulfilled" ? stored.value : [],
  ], count);
}

/**
 * Fetch articles for multiple categories in parallel.
 * Returns an object keyed by feedKey.
 */
export async function fetchMultiCategoryNews(feedKeys, countEach = 5) {
  const results = await Promise.allSettled(
    feedKeys.map((key) => fetchCategoryNews(key, countEach))
  );
  return Object.fromEntries(
    feedKeys.map((key, i) => [
      key,
      results[i].status === "fulfilled" ? results[i].value : [],
    ])
  );
}

export async function fetchHybridMultiCategoryNews(feedKeys, countEach = 5) {
  const results = await Promise.allSettled(
    feedKeys.map((key) => fetchHybridCategoryNews(key, countEach))
  );
  return Object.fromEntries(
    feedKeys.map((key, i) => [
      key,
      results[i].status === "fulfilled" ? results[i].value : [],
    ])
  );
}
