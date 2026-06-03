/**
 * CMS service — wraps all Django REST API calls.
 *
 * All article CRUD operations use the article's `slug` as the URL identifier
 * because the backend sets `lookup_field = "slug"` on NewsArticleViewSet.
 */

import { ENDPOINTS, FETCH_DEFAULTS } from "@/config/api";

// ── Internal helpers ──────────────────────────────────────────────────────────

function authHeaders(token) {
  return token
    ? { ...FETCH_DEFAULTS.headers, Authorization: `Bearer ${token}` }
    : FETCH_DEFAULTS.headers;
}

/** Generic JSON fetch — throws on non-2xx. Returns null on 204 No Content. */
async function req(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...FETCH_DEFAULTS.headers, ...options.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function toArray(data) {
  if (Array.isArray(data))           return data;
  if (Array.isArray(data?.results))  return data.results;
  return [];
}

// ── Public article reads ──────────────────────────────────────────────────────

export async function fetchLatestArticles() {
  try { return toArray(await req(ENDPOINTS.news.latest)); }
  catch { return []; }
}

export async function fetchTrendingArticles() {
  try { return toArray(await req(ENDPOINTS.news.trending)); }
  catch { return []; }
}

/** Fetch a single article by its slug — used by the public detail page. */
export async function fetchArticleBySlug(slug) {
  return req(ENDPOINTS.news.detail(slug));
}

/** Fetch published articles for a given category slug. */
export async function fetchArticlesByCategory(categorySlug, pageSize = 10) {
  try {
    const url = `${ENDPOINTS.news.byCategory(categorySlug)}&page_size=${pageSize}`;
    return toArray(await req(url));
  } catch { return []; }
}

/** Paginated list of published articles (Local CMS tab). */
export async function fetchNewsPage(page = 1) {
  try {
    const data = await req(ENDPOINTS.news.paginated(page));
    return { articles: toArray(data), count: data?.count ?? 0 };
  } catch { return { articles: [], count: 0 }; }
}

/**
 * Atomically increment view count.
 * Uses slug (not UUID) — backend lookup_field = "slug".
 */
export async function incrementViewCount(slug) {
  if (!slug) return;
  try {
    await fetch(ENDPOINTS.news.incrementView(slug), { method: "POST" });
  } catch { /* fire-and-forget — never block page rendering */ }
}

// ── Admin — articles (require superuser JWT) ──────────────────────────────────

/** Fetch ALL articles (including drafts) for the admin dashboard. */
export async function fetchAllArticles(token) {
  return toArray(await req(ENDPOINTS.news.list, { headers: authHeaders(token) }));
}

/**
 * Create a new article. Accepts FormData so image uploads work.
 * Do NOT pass Content-Type — the browser sets the multipart boundary.
 */
export async function createArticle(formData, token) {
  const res = await fetch(ENDPOINTS.news.list, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}` },
    body:    formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Partial-update an article by slug.
 * @param {string} slug   The article's unique slug (URL identifier).
 */
export async function updateArticle(slug, payload, token) {
  return req(ENDPOINTS.news.update(slug), {
    method:  "PATCH",
    headers: authHeaders(token),
    body:    JSON.stringify(payload),
  });
}

/**
 * Soft-delete an article by slug.
 * The backend sets deleted_at and keeps the DB row; it disappears from the API.
 */
export async function deleteArticle(slug, token) {
  const res = await fetch(ENDPOINTS.news.delete(slug), {
    method:  "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ── Admin — categories ────────────────────────────────────────────────────────

export async function fetchCategories(token) {
  try {
    return toArray(await req(ENDPOINTS.categories.list, {
      headers: authHeaders(token),
    }));
  } catch { return []; }
}

export async function createCategory(payload, token) {
  return req(ENDPOINTS.categories.list, {
    method:  "POST",
    headers: authHeaders(token),
    body:    JSON.stringify(payload),
  });
}

export async function deleteCategory(id, token) {
  const res = await fetch(ENDPOINTS.categories.detail(id), {
    method:  "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(username, password) {
  return req(ENDPOINTS.auth.login, {
    method: "POST",
    body:   JSON.stringify({ username, password }),
  });
}

export async function adminLogin(username, password) {
  return req(ENDPOINTS.auth.admin, {
    method: "POST",
    body:   JSON.stringify({ username, password }),
  });
}
