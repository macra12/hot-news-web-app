"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import NewsCard from "../../components/NewsCard";
import Link from "next/link";
import { fetchRssFeed, fetchGeneralNews, NEWS_FEEDS } from "../../lib/newsApi";

const API_BASE = "http://localhost:8000/api";

const CATEGORY_META = {
  sports: { icon: "⚽", label: "Sports", feedKey: "sports" },
  entertainment: { icon: "🎬", label: "Entertainment", feedKey: "entertainment" },
  technology: { icon: "💻", label: "Technology", feedKey: "technology" },
  politics: { icon: "🏛️", label: "Politics", feedKey: "politics" },
  education: { icon: "📚", label: "Education", feedKey: "education" },
};

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

export default function CategoryPage() {
  const { slug } = useParams();
  const [externalNews, setExternalNews] = useState([]);
  const [cmsNews, setCmsNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const meta = CATEGORY_META[slug] || {
    icon: "📰",
    label: slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ") : "News",
    feedKey: null,
  };

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      // No setState before the first await — all updates happen after async work
      const [rssResult, backendResult] = await Promise.allSettled([
        meta.feedKey ? fetchRssFeed(meta.feedKey, 9) : fetchGeneralNews(9),
        fetch(`${API_BASE}/news/?category__slug=${slug}`)
          .then((r) => r.json())
          .then((d) =>
            Array.isArray(d) ? d : Array.isArray(d.results) ? d.results : []
          )
          .catch(() => []),
      ]);

      if (cancelled) return;
      setExternalNews(rssResult.status === "fulfilled" ? rssResult.value : []);
      setCmsNews(
        backendResult.status === "fulfilled" ? backendResult.value : []
      );
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [slug, meta.feedKey]);

  const feed = meta.feedKey ? NEWS_FEEDS[meta.feedKey] : null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Page header */}
      <div className="border-b border-gray-800 bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-red-400 text-sm transition-colors group mb-6"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Home
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{meta.icon}</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">
                {meta.label}
              </h1>
              {feed && (
                <p className="text-gray-500 text-sm mt-1">
                  Live feed from {feed.label} · Click any article to read on
                  source site
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Live news from RSS */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span className="w-1 h-5 bg-red-600 rounded-full" />
            <h2 className="text-xl font-bold text-white">
              Live {meta.label} News
            </h2>
            {feed && (
              <span className="ml-2 text-gray-600 text-xs bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full">
                {feed.label}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
          ) : externalNews.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
              <p className="text-3xl mb-3">📡</p>
              <p className="text-gray-400 mb-1">Could not load live news</p>
              <p className="text-gray-600 text-sm">
                Check your internet connection
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {externalNews.map((article, i) => (
                <NewsCard key={article.article_id || i} article={article} />
              ))}
            </div>
          )}
        </div>

        {/* CMS articles for this category */}
        {!loading && cmsNews.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-8">
              <span className="w-1 h-5 bg-red-600 rounded-full" />
              <h2 className="text-xl font-bold text-white">
                Local Reporter Articles
              </h2>
              <span className="ml-2 text-gray-600 text-xs bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full">
                {cmsNews.length} articles
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cmsNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* All categories nav */}
        <div className="border-t border-gray-800 pt-10">
          <p className="text-gray-600 text-xs uppercase tracking-wider font-semibold mb-4">
            Browse other categories
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_META).map(([s, m]) => (
              <Link
                key={s}
                href={`/category/${s}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  s === slug
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 border border-gray-700 text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600"
                }`}
              >
                <span>{m.icon}</span>
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
