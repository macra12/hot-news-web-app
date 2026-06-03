"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NewsCard from "../../components/NewsCard";
import { formatDate, resolveImageUrl } from "../../lib/utils";

function readingTime(text) {
  if (!text) return "1 min read";
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

// Break a block of text into readable paragraphs (~3 sentences each).
function toParagraphs(text, perPara = 3) {
  if (!text) return [];
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|\S.+$/g) || [text];
  const out = [];
  for (let i = 0; i < sentences.length; i += perPara) {
    const p = sentences.slice(i, i + perPara).join(" ").trim();
    if (p) out.push(p);
  }
  return out;
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
        <><svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-green-500">Copied!</span></>
      ) : (
        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy Link</>
      )}
    </button>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 animate-pulse">
      <div className="h-80 bg-slate-200 dark:bg-gray-900" />
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        <div className="space-y-4">
          <div className="h-3 bg-slate-200 dark:bg-gray-800 rounded w-20" />
          <div className="h-7 bg-slate-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-7 bg-slate-200 dark:bg-gray-800 rounded w-1/2" />
          <div className="h-3 bg-slate-200 dark:bg-gray-800 rounded w-full mt-6" />
          <div className="h-3 bg-slate-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-gray-800 rounded w-5/6" />
          <div className="h-3 bg-slate-200 dark:bg-gray-800 rounded w-4/6" />
        </div>
        <div className="hidden lg:block space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-24 bg-slate-200 dark:bg-gray-900 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

function ExternalArticleContent() {
  const params   = useSearchParams();
  const articleId = params.get("id") || "";
  const category  = params.get("cat") || "world";

  const [article,      setArticle]      = useState(null);
  const [related,      setRelated]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);

  useEffect(() => {
    if (!articleId) { setNotFound(true); setLoading(false); return; }
    let cancelled = false;

    (async () => {
      const res  = await fetch(`/api/news?category=${category}`);
      if (cancelled) return;

      if (!res.ok) { setNotFound(true); setLoading(false); return; }

      const data     = await res.json();
      if (cancelled) return;

      const articles = data.articles || [];
      const found    = articles.find((a) => a.article_id === articleId);

      if (!found) { setNotFound(true); setLoading(false); return; }

      setArticle(found);
      setRelated(articles.filter((a) => a.article_id !== articleId).slice(0, 6));
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [articleId, category]);

  if (loading) return <Skeleton />;

  if (notFound || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50 dark:bg-gray-950">
        <p className="text-6xl mb-4">📭</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Article not found</h1>
        <p className="text-slate-500 dark:text-gray-500 mb-6">This article may have expired or the link is broken.</p>
        <Link href="/news" className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-semibold transition-colors">
          ← Back to All News
        </Link>
      </div>
    );
  }

  const categoryName = article.category?.name || "News";
  // Prefer the fuller body when the feed provided one beyond the short summary.
  const fullBody = article.content && article.content.length > (article.summary?.length || 0) + 40
    ? article.content
    : "";
  const paragraphs = toParagraphs(fullBody);
  const rt = readingTime(fullBody || article.summary);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">

      {/* Hero */}
      {resolveImageUrl(article.image) ? (
        <div className="relative w-full h-72 md:h-[420px] overflow-hidden bg-slate-200 dark:bg-gray-900">
          <Image src={resolveImageUrl(article.image)} alt={article.title} fill className="object-cover" priority unoptimized />
          {/* Dark gradient keeps the overlaid title legible on any photo, both themes */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-4 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                {categoryName}
              </span>
              <span className="bg-black/50 backdrop-blur-sm text-gray-200 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                {article.source}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-xl">
              {article.title}
            </h1>
          </div>
        </div>
      ) : (
        <div className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/40">
          <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {categoryName}
              </span>
              <span className="text-slate-500 dark:text-gray-500 text-xs border border-slate-300 dark:border-gray-700 px-2.5 py-1 rounded-full">
                {article.source}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">{article.title}</h1>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

        {/* Article column */}
        <div>
          <Link href="/news" className="inline-flex items-center gap-1.5 text-slate-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors group mb-8">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All News
          </Link>

          {/* Summary / lead paragraph */}
          {article.summary && (
            <p className="text-lg md:text-xl text-slate-700 dark:text-gray-300 leading-relaxed mb-8 pl-4 border-l-[3px] border-red-600">
              {article.summary}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-gray-500 mb-8 pb-6 border-b border-slate-200 dark:border-gray-800">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-slate-600 dark:text-gray-400">{article.author}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(article.published_at)}
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 dark:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {rt}
            </span>
          </div>

          {/* Full body (when the feed supplied more than the short summary) */}
          {paragraphs.length > 0 && (
            <article className="space-y-4 mb-8">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] leading-[1.85] text-slate-700 dark:text-gray-300">{p}</p>
              ))}
            </article>
          )}

          {/* Story details — every field the API gave us */}
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-px overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-200 dark:bg-gray-800 mb-8">
            {[
              ["Source", article.source],
              ["Category", categoryName],
              ["Author", article.author],
              ["Published", formatDate(article.published_at)],
              ["Reading time", rt],
              ["Type", "External preview"],
            ].map(([label, value]) => (
              <div key={label} className="bg-white dark:bg-gray-900 px-4 py-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600">{label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-800 dark:text-gray-200 truncate">{value || "—"}</dd>
              </div>
            ))}
          </dl>

          {/* Content note + Read Full Article CTA */}
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-slate-900 dark:text-white font-semibold mb-1">This article is from {article.source}</p>
                <p className="text-slate-500 dark:text-gray-500 text-sm leading-relaxed mb-4">
                  GenZFlash shows a preview of this story. Click below to read the full article on the publisher&apos;s website.
                </p>
                <a
                  href={article.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-bold transition-colors shadow-lg shadow-red-900/30"
                >
                  Read Full Article at {article.source}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Source reference box */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 mb-8">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-transparent flex items-center justify-center text-base">
              {article.source?.startsWith("BBC") ? "🇬🇧" : article.source?.includes("Khmer") ? "🇰🇭" : "📰"}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400 dark:text-gray-600 uppercase tracking-wider font-semibold">Source</p>
              <a
                href={article.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium truncate block"
              >
                {article.source} ↗
              </a>
            </div>
            <div className="ml-auto min-w-0 text-right hidden sm:block">
              <p className="text-[11px] text-slate-400 dark:text-gray-600 uppercase tracking-wider font-semibold">Category</p>
              <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">{categoryName}</p>
            </div>
          </div>

          {/* Share row */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-gray-800">
            <span className="text-slate-400 dark:text-gray-600 text-xs font-semibold uppercase tracking-wider">Share</span>
            <CopyLinkButton />
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(article.externalUrl || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-gray-800 hover:bg-[#1d9bf0]/10 dark:hover:bg-[#1d9bf0]/20 hover:border-[#1d9bf0]/50 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:text-[#1d9bf0] text-xs font-semibold transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Post
            </a>
          </div>

          {/* Mobile related articles */}
          {related.length > 0 && (
            <div className="mt-14 lg:hidden">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1 h-5 bg-red-600 rounded-full" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">More {categoryName} News</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {related.slice(0, 4).map((a, i) => (
                  <NewsCard key={a.article_id || i} article={a} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">

            {/* Related articles */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-4 bg-red-600 rounded-full" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  More {categoryName} News
                </h2>
              </div>

              {related.length > 0 ? (
                <div className="space-y-3">
                  {related.map((a, i) => (
                    <RelatedItem key={a.article_id || i} article={a} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 dark:text-gray-600 text-sm">No related articles available.</p>
              )}
            </div>

            {/* Browse category */}
            <Link
              href={`/category/${category}`}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 hover:border-red-500/50 dark:hover:border-red-600/50 text-slate-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-xs font-semibold transition-all"
            >
              Browse all {categoryName}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Nav */}
            <div className="pt-4 border-t border-slate-200 dark:border-gray-800 flex flex-col gap-2">
              <Link href="/news" className="flex items-center gap-2 text-slate-400 dark:text-gray-600 hover:text-slate-700 dark:hover:text-gray-300 text-xs transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All News
              </Link>
              <Link href="/" className="flex items-center gap-2 text-slate-400 dark:text-gray-600 hover:text-slate-700 dark:hover:text-gray-300 text-xs transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function RelatedItem({ article }) {
  const id  = encodeURIComponent(article.article_id || "");
  const cat = encodeURIComponent(article.feedKey || "world");

  return (
    <Link
      href={`/news/external?id=${id}&cat=${cat}`}
      className="group flex gap-3 p-3 rounded-xl bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 hover:border-red-400/50 dark:hover:border-red-600/40 hover:shadow-md dark:hover:bg-gray-900 transition-all duration-200"
    >
      {resolveImageUrl(article.image) && (
        <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-gray-800">
          <Image src={resolveImageUrl(article.image)} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        </div>
      )}
      <div className="min-w-0">
        <h4 className="text-slate-900 dark:text-white text-xs font-semibold leading-snug line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {article.title}
        </h4>
        <span className="text-slate-400 dark:text-gray-600 text-[11px] mt-1 block">{formatDate(article.published_at)}</span>
      </div>
    </Link>
  );
}

export default function ExternalArticlePage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ExternalArticleContent />
    </Suspense>
  );
}
