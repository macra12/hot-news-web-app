"use client";
import { useState, useEffect, useCallback } from "react";
import NewsCard from "./components/NewsCard";
import Link from "next/link";
import { fetchRssFeed, fetchGeneralNews, NEWS_FEEDS } from "./lib/newsApi";

const API_BASE = "http://localhost:8000/api";

const LIVE_TABS = [
  { key: "general", label: "🌍 World & Asia" },
  { key: "sports", label: "⚽ Sports" },
  { key: "technology", label: "💻 Tech" },
  { key: "entertainment", label: "🎬 Entertainment" },
  { key: "politics", label: "🏛️ Politics" },
];

const CATEGORY_ICONS = {
  sports: "⚽",
  entertainment: "🎬",
  technology: "💻",
  politics: "🏛️",
  education: "📚",
};

export default function Home() {
  const [liveNews, setLiveNews] = useState([]);
  const [liveTab, setLiveTab] = useState("general");
  const [liveLoading, setLiveLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [cmsNews, setCmsNews] = useState([]);
  const [cmsLoading, setCmsLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);

  // Fetch live RSS news whenever the tab changes
  const loadLiveNews = useCallback(async (tab) => {
    setLiveLoading(true);
    const articles =
      tab === "general"
        ? await fetchGeneralNews(12)
        : await fetchRssFeed(tab, 12);
    setLiveNews(articles);
    setLiveLoading(false);
  }, []);

  useEffect(() => {
    loadLiveNews(liveTab);
  }, [liveTab, loadLiveNews]);

  // Fetch backend categories + latest CMS news
  useEffect(() => {
    const loadBackend = async () => {
      try {
        const [catRes, newsRes] = await Promise.all([
          fetch(`${API_BASE}/categories/`),
          fetch(`${API_BASE}/news/latest/`),
        ]);
        const catData = await catRes.json();
        const newsData = await newsRes.json();
        setCategories(
          Array.isArray(catData)
            ? catData
            : Array.isArray(catData.results)
              ? catData.results
              : []
        );
        setCmsNews(
          Array.isArray(newsData)
            ? newsData
            : Array.isArray(newsData.results)
              ? newsData.results
              : []
        );
      } catch {
        setBackendError(true);
      } finally {
        setCmsLoading(false);
      }
    };
    loadBackend();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-linear-to-br from-gray-900 via-gray-950 to-black py-24 border-b border-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.2)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(220,38,38,0.08)_0%,transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="flex items-center gap-1.5 bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </span>
              <span className="text-gray-500 text-sm">
                Breaking stories updated continuously
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white leading-none">
              Cambodia&apos;s
              <br />
              <span className="text-red-500">Breaking</span> News
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-8 leading-relaxed">
              Fast, reliable, and built for the new generation. Covering local
              and global stories that matter — sports, politics, tech, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/news"
                className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-sm uppercase tracking-wide transition-colors shadow-lg shadow-red-900/30"
              >
                Read All News
              </Link>
              <Link
                href="/about"
                className="px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold text-sm uppercase tracking-wide transition-colors border border-gray-700"
              >
                About Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category strip (from backend) ── */}
      {categories.length > 0 && (
        <section className="border-b border-gray-800 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 overflow-x-auto scrollbar-none">
            <span className="text-gray-600 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
              Browse:
            </span>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white border border-gray-700 hover:border-red-600 rounded-full text-xs font-medium transition-all"
              >
                <span>{CATEGORY_ICONS[cat.slug] || "📰"}</span>
                {cat.name}
              </Link>
            ))}
            <Link
              href="/news"
              className="whitespace-nowrap px-3 py-1.5 text-red-500 hover:text-red-400 text-xs font-medium ml-1"
            >
              All News →
            </Link>
          </div>
        </section>
      )}

      {/* ── Live News with category tabs ── */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        {/* Section header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-1 h-6 bg-red-600 rounded-full" />
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Live Global News
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-8 border-b border-gray-800">
          {LIVE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setLiveTab(tab.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                liveTab === tab.key
                  ? "bg-red-600 text-white"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* News grid */}
        {liveLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-800" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-800 rounded w-1/4" />
                  <div className="h-4 bg-gray-800 rounded w-full" />
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : liveNews.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-4xl mb-3">📡</p>
            <p className="text-gray-400 font-semibold mb-1">
              Unable to load live news
            </p>
            <p className="text-gray-600 text-sm">
              Check your internet connection and try again
            </p>
            <button
              onClick={() => loadLiveNews(liveTab)}
              className="mt-5 px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveNews.map((article, i) => (
              <NewsCard key={article.article_id || i} article={article} />
            ))}
          </div>
        )}

        {/* Source attribution */}
        {!liveLoading && liveNews.length > 0 && (
          <p className="text-center text-gray-700 text-xs mt-8">
            News sourced from{" "}
            {liveTab === "general"
              ? "Reuters & BBC Asia"
              : NEWS_FEEDS[liveTab]?.label || "international publishers"}{" "}
            · Click any article to read on the original site
          </p>
        )}
      </section>

      {/* ── CMS / Local News ── */}
      <section className="border-t border-gray-800 bg-gray-900/30 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="w-1 h-6 bg-red-600 rounded-full" />
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  📰 Local Reporter News
                </h2>
                <p className="text-gray-500 text-xs mt-0.5 ml-0.5">
                  Published by our admin reporters via CMS
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-full text-xs font-semibold transition-colors"
            >
              Manage →
            </Link>
          </div>

          {cmsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="h-32 bg-gray-800" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : backendError ? (
            <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
              <p className="text-3xl mb-3">🔌</p>
              <p className="text-gray-400 font-semibold mb-1">
                Backend offline
              </p>
              <p className="text-gray-600 text-sm">
                Start Django on port 8000 to see local articles
              </p>
            </div>
          ) : cmsNews.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
              <p className="text-3xl mb-3">✍️</p>
              <p className="text-gray-400 font-semibold mb-1">
                No local articles yet
              </p>
              <Link
                href="/admin"
                className="inline-block mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-semibold transition-colors"
              >
                Add First Article
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cmsNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
