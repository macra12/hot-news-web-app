"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NewsCard from "../components/NewsCard";
import Link from "next/link";
import { fetchRssFeed, fetchGeneralNews, NEWS_FEEDS } from "../lib/newsApi";

const API_BASE = "http://localhost:8000/api";

const TABS = [
  { key: "world",         label: "🌍 World",         rssKey: "world" },
  { key: "asia",          label: "🌏 Asia",           rssKey: "asia" },
  { key: "sports",        label: "⚽ Sports",         rssKey: "sports" },
  { key: "technology",    label: "💻 Tech",           rssKey: "technology" },
  { key: "entertainment", label: "🎬 Entertainment",  rssKey: "entertainment" },
  { key: "politics",      label: "🏛️ Politics",      rssKey: "politics" },
  { key: "education",     label: "📚 Education",      rssKey: "education" },
  { key: "local",         label: "📰 Local CMS",      rssKey: null },
];

function Skeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-800 rounded w-1/4" />
        <div className="h-4 bg-gray-800 rounded w-full" />
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2 mt-4" />
      </div>
    </div>
  );
}

function NewsPageContent() {
  const searchParams = useSearchParams();
  const router    = useRouter();
  const activeTab = searchParams.get("tab") || "world";
  const page      = Number(searchParams.get("page") || 1);

  // null = loading, [] = empty, [...] = data
  const [articles, setArticles] = useState(null);
  const [cmsCount, setCmsCount] = useState(0);

  const loading    = articles === null;
  const currentTab = TABS.find((t) => t.key === activeTab) || TABS[0];
  const feed       = currentTab.rssKey ? NEWS_FEEDS[currentTab.rssKey] : null;

  // Tab click — reset to loading state in the event handler (not the effect)
  const handleTabClick = (key) => {
    setArticles(null);
    router.push(`/news?tab=${key}&page=1`);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // ⚠️ No setState before the first await — all state updates happen after async work
      if (currentTab.rssKey === null) {
        // Local CMS articles
        try {
          const res  = await fetch(`${API_BASE}/news/?page=${page}`);
          const data = await res.json();
          if (!cancelled) {
            setCmsCount(data.count || 0);
            setArticles(
              Array.isArray(data)
                ? data
                : Array.isArray(data.results)
                  ? data.results
                  : []
            );
          }
        } catch {
          if (!cancelled) setArticles([]);
        }
      } else {
        // RSS feed
        const items =
          currentTab.rssKey === "world"
            ? await fetchGeneralNews(12)
            : await fetchRssFeed(currentTab.rssKey, 12);
        if (!cancelled) setArticles(items ?? []);
      }
    })();

    return () => { cancelled = true; };
  }, [activeTab, page, currentTab.rssKey]);

  return (
    <div className="min-h-screen bg-gray-950 py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-red-400 text-sm transition-colors group mb-5"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-1 h-7 bg-red-600 rounded-full" />
            <h1 className="text-3xl md:text-4xl font-black text-white">All News</h1>
          </div>
          {feed && (
            <p className="text-gray-600 text-xs mt-2 ml-3">
              Sourced from {feed.label} · Articles open on publisher&apos;s website
            </p>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-8 border-b border-gray-800">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                  : "text-gray-500 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-28 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-4xl mb-3">{currentTab.rssKey === null ? "✍️" : "📡"}</p>
            <p className="text-gray-400 font-semibold mb-1">
              {currentTab.rssKey === null ? "No local articles yet" : "Could not load news"}
            </p>
            <p className="text-gray-600 text-sm mb-5">
              {currentTab.rssKey === null
                ? "Add articles from the admin panel"
                : "Check your internet connection and try again"}
            </p>
            {currentTab.rssKey === null ? (
              <Link href="/admin" className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-semibold transition-colors">
                Go to Admin
              </Link>
            ) : (
              <button
                onClick={() => { setArticles(null); }}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm font-semibold transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <NewsCard key={article.id || article.article_id || i} article={article} />
            ))}
          </div>
        )}

        {/* CMS pagination */}
        {currentTab.rssKey === null && cmsCount > 20 && !loading && (
          <div className="flex justify-center gap-3 mt-12">
            {page > 1 && (
              <button onClick={() => { setArticles(null); router.push(`/news?tab=local&page=${page - 1}`); }}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white rounded-full text-sm transition-colors">
                ← Previous
              </button>
            )}
            <span className="px-5 py-2 text-gray-600 text-sm">Page {page}</span>
            {articles.length === 20 && (
              <button onClick={() => { setArticles(null); router.push(`/news?tab=local&page=${page + 1}`); }}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white rounded-full text-sm transition-colors">
                Next →
              </button>
            )}
          </div>
        )}

        {/* Attribution */}
        {!loading && articles.length > 0 && feed && (
          <p className="text-center text-gray-700 text-xs mt-10">
            Articles sourced from {feed.label} · Clicking opens the publisher&apos;s website
          </p>
        )}
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <NewsPageContent />
    </Suspense>
  );
}
