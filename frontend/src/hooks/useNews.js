"use client";
import { useState, useEffect, useCallback } from "react";
import {
  fetchWorldNews,
  fetchCategoryNews,
  fetchMultiCategoryNews,
  fetchHybridWorldNews,
  fetchHybridCategoryNews,
  fetchHybridMultiCategoryNews,
} from "@/services/newsService";
import {
  fetchLatestArticles,
  fetchTrendingArticles,
  fetchArticlesByCategory,
  fetchNewsPage,
} from "@/services/cmsService";

// How often the homepage live sections silently re-fetch the newest data.
// Matched to the importer cadence (~2 min) — refreshing faster just wastes
// requests since the DB doesn't change in between.
const LIVE_REFRESH_MS = 120_000;

/* ── DB-backed category feed (clean, categorised, deduped, fresh) ──────────────
 * The homepage uses these instead of the flaky external NewsData.io live API,
 * which returns miscategorised / duplicated content. The database is filled by
 * the importer from BBC / Khmer Times / Al Jazeera / Guardian with correct
 * categories, so these sections are accurate and auto-refresh.                  */
export function useDbCategory(slug, count = 6) {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  const load = useCallback(async () => {
    if (!slug) { setLoading(false); return; }
    setError(false);
    try {
      const data = await fetchArticlesByCategory(slug, count);
      setArticles(data);
      if (!data.length) setError(true);
    } catch { setError(true); }
    finally  { setLoading(false); }
  }, [slug, count]);

  useEffect(() => {
    load();
    const id = setInterval(load, LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return { articles, loading, error, reload: load };
}

export function useDbMultiCategory(slugs, countEach = 5) {
  const [data,    setData]    = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const results = await Promise.allSettled(slugs.map((s) => fetchArticlesByCategory(s, countEach)));
      if (!cancelled) {
        setData(Object.fromEntries(slugs.map((s, i) => [s, results[i].status === "fulfilled" ? results[i].value : []])));
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, LIVE_REFRESH_MS);
    return () => { cancelled = true; clearInterval(id); };
  // slugs come from a frozen config array — stable reference, run once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading };
}

export function useHybridCategory(slug, count = 6) {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  const load = useCallback(async () => {
    if (!slug) { setLoading(false); return; }
    setError(false);
    try {
      const data = await fetchHybridCategoryNews(slug, count);
      setArticles(data);
      if (!data.length) setError(true);
    } catch {
      setError(true);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [slug, count]);

  useEffect(() => {
    load();
    const id = setInterval(load, LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return { articles, loading, error, reload: load };
}

export function useHybridLeadNews(count = 8) {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const data = await fetchHybridWorldNews(count);
      setArticles(data);
      if (!data.length) setError(true);
    } catch {
      setError(true);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [count]);

  useEffect(() => {
    load();
    const id = setInterval(load, LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return { articles, loading, error, reload: load };
}

export function useHybridMultiCategory(slugs, countEach = 5) {
  const [data,    setData]    = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const result = await fetchHybridMultiCategoryNews(slugs, countEach);
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, LIVE_REFRESH_MS);
    return () => { cancelled = true; clearInterval(id); };
  // slugs come from a frozen config array — stable reference, run once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading };
}

/* ── Lead news (World + Asia merged) ──────────────────────────────── */
export function useLeadNews() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const data = await fetchWorldNews(8);
      setArticles(data);
      if (!data.length) setError(true);
    } catch { setError(true); }
    finally  { setLoading(false); }
  }, []);

  // Initial load + silent live refresh on an interval.
  useEffect(() => {
    load();
    const id = setInterval(load, LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);
  return { articles, loading, error, reload: load };
}

/* ── Single category external news ────────────────────────────────── */
export function useCategoryNews(feedKey, count = 6) {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  const load = useCallback(async () => {
    if (!feedKey) { setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const data = await fetchCategoryNews(feedKey, count);
      setArticles(data);
      if (!data.length) setError(true);
    } catch { setError(true); }
    finally  { setLoading(false); }
  }, [feedKey, count]);

  useEffect(() => { load(); }, [load]);
  return { articles, loading, error, reload: load };
}

/* ── Multiple topic blocks in one parallel fetch ───────────────────── */
export function useMultiTopicNews(topicKeys) {
  const [data,    setData]    = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchMultiCategoryNews(topicKeys, 5);
      if (!cancelled) { setData(result); setLoading(false); }
    })();
    return () => { cancelled = true; };
  // topicKeys are a frozen config array — stable reference, run once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading };
}

/* ── Latest CMS articles ───────────────────────────────────────────── */
export function useCmsNews() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const data = await fetchLatestArticles();
      setArticles(data);
    } catch { setError(true); setArticles([]); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);
  return { articles, loading, error, reload: load };
}

/* ── Trending / hot CMS articles (auto-refreshing) ────────────────── */
export function useTrendingNews() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchTrendingArticles();
      setArticles(data || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return { articles, loading };
}

/* ── Paginated CMS articles (news page "Local CMS" tab) ────────────── */
export function useCmsPage(page = 1) {
  const [articles, setArticles] = useState(null); // null = loading
  const [count,    setCount]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { articles: data, count: total } = await fetchNewsPage(page);
      if (!cancelled) { setArticles(data); setCount(total); }
    })();
    return () => { cancelled = true; };
  }, [page]);

  return { articles, count };
}

/* ── External feed for news page tab ──────────────────────────────── */
export function useFeedTab(feedKey, page) {
  const [articles, setArticles] = useState(null); // null = loading

  useEffect(() => {
    if (!feedKey) return;
    let cancelled = false;
    (async () => {
      const data = feedKey === "world"
        ? await fetchWorldNews(12)
        : await fetchCategoryNews(feedKey, 12);
      if (!cancelled) setArticles(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [feedKey, page]);

  return { articles };
}
