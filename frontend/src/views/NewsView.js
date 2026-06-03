"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NewsCard from "@/app/components/NewsCard";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";
import { API_BASE } from "@/config/api";

const PAGE_SIZE = 24;

// Tabs map to real database categories (project scope) + an "All" view.
const TABS = [
  { slug: "",              tkey: "nav.allNews" },
  { slug: "cambodia",      tkey: "nav.cambodia" },
  { slug: "world",         tkey: "nav.world" },
  { slug: "politics",      tkey: "nav.politics" },
  { slug: "technology",    tkey: "nav.technology" },
  { slug: "sports",        tkey: "nav.sports" },
  { slug: "entertainment", tkey: "nav.entertainment" },
  { slug: "business",      tkey: "nav.business" },
  { slug: "education",     tkey: "nav.education" },
];

function Skeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-52 bg-slate-100 dark:bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-2.5 bg-slate-100 dark:bg-gray-800 rounded-full w-20" />
        <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded w-full" />
        <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded w-4/5" />
      </div>
    </div>
  );
}

function LiveDot() {
  return (
    <span className="relative flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
      </span>
      <span className="text-xs text-red-500 font-semibold uppercase tracking-wider">Live</span>
    </span>
  );
}

function NewsContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const cat  = searchParams.get("cat") || "";
  const page = Number(searchParams.get("page") || 1);

  const [data, setData]       = useState(null);   // { results, count, next, previous }
  const [loading, setLoading] = useState(true);

  // Fetch the selected category straight from the database (paginated).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const q = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
      if (cat) q.set("category__slug", cat);
      try {
        const res = await fetch(`${API_BASE}/news/?${q.toString()}`);
        const d = await res.json();
        if (!cancelled) setData(Array.isArray(d) ? { results: d, count: d.length } : d);
      } catch {
        if (!cancelled) setData({ results: [], count: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [cat, page]);

  const articles = data?.results || [];
  const count    = data?.count ?? 0;

  const goTab  = (slug) => router.push(slug ? `/news?cat=${slug}` : "/news");
  const goPage = (p) => router.push(`/news?${cat ? `cat=${cat}&` : ""}page=${p}`);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors group mb-6">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {t("nav.home")}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-1 h-8 bg-red-600 rounded-full" />
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t("news.title")}</h1>
                <LiveDot />
              </div>
              <p className="text-slate-500 dark:text-gray-500 text-sm ml-4">{t("news.subtitleFeed")}</p>
            </div>
            {!loading && (
              <div className="ml-4 sm:ml-0 text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{count}</span>
                <p className="text-slate-400 dark:text-gray-600 text-xs mt-0.5">{t("news.totalArticles")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.slug || "all"}
                onClick={() => goTab(tab.slug)}
                className={`relative whitespace-nowrap px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                  cat === tab.slug
                    ? "border-red-600 text-slate-900 dark:text-white"
                    : "border-transparent text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300 hover:border-slate-300 dark:hover:border-gray-600"
                }`}
              >
                {t(tab.tkey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : !articles.length ? (
          <div className="text-center py-28 border border-dashed border-slate-300 dark:border-gray-800 rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-400 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-lg mb-1">{t("news.noFeedTitle")}</p>
            <p className="text-slate-500 dark:text-gray-500 text-sm mb-6 max-w-xs mx-auto">{t("news.noFeedHint")}</p>
            <button onClick={() => goTab(cat)} className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 rounded-full text-sm font-semibold transition-colors">{t("common.retry")}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a, i) => <NewsCard key={a.id || a.slug || i} article={a} />)}
          </div>
        )}

        {/* Pagination */}
        {!loading && (data?.next || data?.previous) && (
          <div className="flex items-center justify-center gap-3 mt-12 pt-8 border-t border-slate-200 dark:border-gray-800">
            <button disabled={!data?.previous} onClick={() => goPage(page - 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 rounded-full text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>{t("news.prev")}
            </button>
            <span className="px-5 py-2 text-slate-500 dark:text-gray-500 text-sm font-medium">{t("news.page")} <span className="text-slate-900 dark:text-white font-bold">{page}</span></span>
            <button disabled={!data?.next} onClick={() => goPage(page + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 rounded-full text-sm transition-colors">
              {t("news.next")}<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewsView() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-gray-950" />}>
      <NewsContent />
    </Suspense>
  );
}
