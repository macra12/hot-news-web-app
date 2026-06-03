"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDate, resolveImageUrl } from "../../lib/utils";
import { API_BASE } from "@/config/api";

function readingTime(content) {
  if (!content) return "1 min read";
  const words = content.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Link
        </>
      )}
    </button>
  );
}

function ArticleSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 animate-pulse">
      <div className="h-80 bg-slate-200 dark:bg-gray-900" />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-gray-800 rounded w-24" />
        <div className="h-8 bg-slate-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-8 bg-slate-200 dark:bg-gray-800 rounded w-1/2" />
        <div className="h-4 bg-slate-200 dark:bg-gray-800 rounded w-full mt-6" />
        <div className="h-4 bg-slate-200 dark:bg-gray-800 rounded w-full" />
        <div className="h-4 bg-slate-200 dark:bg-gray-800 rounded w-5/6" />
      </div>
    </div>
  );
}

function RecommendedCard({ article }) {
  const imageUrl = resolveImageUrl(article.image);
  return (
    <Link href={`/news/${article.slug}`} className="group flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 hover:border-red-400/50 dark:hover:border-red-600/40 hover:shadow-md dark:hover:bg-gray-900 transition-all duration-200">
      {imageUrl && (
        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-gray-800">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="min-w-0 flex flex-col gap-1">
        {article.category && (
          <span className="text-red-600 dark:text-red-500 text-[10px] font-bold uppercase tracking-widest">
            {article.category.name}
          </span>
        )}
        <h4 className="text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {article.title}
        </h4>
        <span className="text-slate-400 dark:text-gray-600 text-[11px] mt-auto">
          {formatDate(article.published_at || article.created_at)}
        </span>
      </div>
    </Link>
  );
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading]   = useState(false);

  const fetchRecommended = useCallback(async (categorySlug, currentId) => {
    if (!categorySlug) return;
    setRecLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/news/?category__slug=${categorySlug}&page_size=6`);
      const data = await res.json();
      const all  = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];
      setRecommended(all.filter((a) => a.id !== currentId).slice(0, 4));
    } catch {
      // silently ignore
    } finally {
      setRecLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      const res = await fetch(`${API_BASE}/news/${slug}/`);
      if (cancelled) return;

      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (cancelled) return;

      setArticle(data);
      setLoading(false);

      // Increment view count silently
      fetch(`${API_BASE}/news/${data.slug}/increment_view/`, { method: "POST" }).catch(() => {});

      // Fetch recommendations
      const catSlug = data.category?.slug || data.category?.name?.toLowerCase();
      fetchRecommended(catSlug, data.id);
    })();

    return () => { cancelled = true; };
  }, [slug, fetchRecommended]);

  if (loading) return <ArticleSkeleton />;

  if (notFound || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50 dark:bg-gray-950">
        <p className="text-6xl mb-4">📭</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Article not found</h1>
        <p className="text-slate-500 dark:text-gray-500 mb-6">This article may have been removed or the link is incorrect.</p>
        <Link href="/news" className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-semibold transition-colors">
          ← Back to All News
        </Link>
      </div>
    );
  }

  const rt = readingTime(article.content);
  const categoryName = article.category?.name;
  const categorySlug = article.category?.slug || categoryName?.toLowerCase();
  const heroImageUrl = resolveImageUrl(article.image);
  // Show the real source as the byline; "newsbot" is the internal importer account.
  const sourceName = article.source?.name || (typeof article.source === "string" ? article.source : null);
  const byline = article.author && article.author !== "newsbot" ? article.author : (sourceName || "GenZ Flash");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">

      {/* Hero Image */}
      {heroImageUrl ? (
        <div className="relative w-full h-72 md:h-96 overflow-hidden bg-slate-200 dark:bg-gray-900">
          <Image
            src={heroImageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
          {/* Title overlaid on hero */}
          <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-4 pb-8">
            {categoryName && (
              <span className="inline-block bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 shadow-lg">
                {categoryName}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-lg">
              {article.title}
            </h1>
          </div>
        </div>
      ) : (
        /* No image — plain header strip */
        <div className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/40">
          <div className="max-w-3xl mx-auto px-4 py-10">
            {categoryName && (
              <span className="inline-block bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                {categoryName}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {article.title}
            </h1>
          </div>
        </div>
      )}

      {/* Main content + sidebar */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

        {/* Article column */}
        <div>
          {/* Back link */}
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-slate-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors group mb-8"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All News
          </Link>

          <article>
            {/* Title (shown when no hero image) */}
            {!article.image && null}

            {/* Summary / lead */}
            {article.summary && (
              <p className="text-lg text-slate-700 dark:text-gray-300 leading-relaxed mb-6 pl-4 border-l-[3px] border-red-600">
                {article.summary}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-gray-500 mb-8 pb-6 border-b border-slate-200 dark:border-gray-800">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-slate-600 dark:text-gray-400">{byline}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(article.published_at || article.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.view_count || 0} views
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 dark:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {rt}
              </span>
            </div>

            {/* Content body */}
            <div className="space-y-4">
              {article.content?.split("\n").map((para, i) =>
                para.trim() ? (
                  <p key={i} className="text-slate-700 dark:text-gray-300 leading-[1.85] text-[15px]">
                    {para}
                  </p>
                ) : null
              )}
            </div>

            {article.is_external && article.external_url && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-slate-900 dark:text-white font-semibold mb-1">
                  Read the full story at {sourceName || "the original source"}
                </p>
                <p className="text-slate-500 dark:text-gray-500 text-sm leading-relaxed mb-4">
                  This imported article is stored in GenZFlash for search and discovery. Open the publisher page for the full report when the feed only provides a preview.
                </p>
                <a
                  href={article.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-bold transition-colors"
                >
                  Read Full Article
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {/* Share + Source reference */}
            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-gray-800 flex flex-wrap items-center gap-3">
              <span className="text-slate-400 dark:text-gray-600 text-xs font-semibold uppercase tracking-wider mr-1">Share</span>
              <CopyLinkButton />
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-gray-800 hover:bg-[#1d9bf0]/10 dark:hover:bg-[#1d9bf0]/20 hover:border-[#1d9bf0]/50 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:text-[#1d9bf0] text-xs font-semibold transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Post
              </a>

              {/* Reference / source */}
              {categorySlug && (
                <Link
                  href={`/category/${categorySlug}`}
                  className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  More in {categoryName}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Status badge (draft warning) */}
            {article.status === "draft" && (
              <div className="mt-6 flex items-center gap-2 bg-yellow-900/20 border border-yellow-700/30 text-yellow-500 rounded-xl px-4 py-3 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                This article is a draft and not publicly published.
              </div>
            )}
          </article>

          {/* Mobile recommended (shown below article on small screens) */}
          {recommended.length > 0 && (
            <div className="mt-14 lg:hidden">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1 h-5 bg-red-600 rounded-full" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">More in {categoryName || "News"}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommended.map((rec) => <RecommendedCard key={rec.id} article={rec} />)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block space-y-6 pt-11">
          {/* Recommended */}
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-4 bg-red-600 rounded-full" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                More in {categoryName || "News"}
              </h2>
            </div>

            {recLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 dark:bg-gray-900 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recommended.length > 0 ? (
              <div className="space-y-3">
                {recommended.map((rec) => <RecommendedCard key={rec.id} article={rec} />)}
              </div>
            ) : (
              <p className="text-slate-400 dark:text-gray-600 text-sm">No related articles yet.</p>
            )}

            {/* Browse category link */}
            {categorySlug && (
              <Link
                href={`/category/${categorySlug}`}
                className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 hover:border-red-500/50 dark:hover:border-red-600/50 text-slate-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-xs font-semibold transition-all"
              >
                Browse all {categoryName}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            {/* Divider + Back home */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-gray-800 flex flex-col gap-2">
              <Link
                href="/news"
                className="flex items-center gap-2 text-slate-400 dark:text-gray-600 hover:text-slate-700 dark:hover:text-gray-300 text-xs transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All News
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-400 dark:text-gray-600 hover:text-slate-700 dark:hover:text-gray-300 text-xs transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Related articles grid — full width below (when no sidebar) */}
    </div>
  );
}
