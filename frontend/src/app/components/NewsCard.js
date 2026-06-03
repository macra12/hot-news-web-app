"use client";
import Link from "next/link";
import Image from "next/image";
import { formatDate, resolveImageUrl } from "../lib/utils";

function readingTime(text) {
  if (!text) return null;
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

// Tasteful gradients (full literal class strings so Tailwind keeps them).
const PLACEHOLDER_GRADIENTS = [
  "from-red-500 to-rose-700",
  "from-blue-500 to-indigo-700",
  "from-emerald-500 to-teal-700",
  "from-amber-500 to-orange-700",
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-700",
  "from-fuchsia-500 to-pink-700",
  "from-slate-600 to-slate-800",
];

// Deterministic gradient per article so cards look varied but stable.
function pickGradient(seed) {
  const s = String(seed || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_GRADIENTS[h % PLACEHOLDER_GRADIENTS.length];
}

export default function NewsCard({ article }) {
  const isExternal = article.isExternal && article.externalUrl;
  const rt = readingTime(article.summary || article.content);
  const categoryName = article.category?.name || article.category || null;
  const sourceName = article.source || (isExternal ? "External" : "GenZ Flash");
  // "newsbot" is the internal importer account — never show it as a byline.
  const byline = article.author && article.author !== "newsbot" ? article.author : null;
  const imageUrl = resolveImageUrl(article.image);
  const date = formatDate(article.published_at || article.created_at);

  const href = isExternal
    ? `/news/external?id=${encodeURIComponent(article.article_id || "")}&cat=${encodeURIComponent(article.feedKey || "world")}`
    : `/news/${article.slug}`;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:border-slate-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
    >
      {/* Thumbnail */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-gray-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.title || "News image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className={`flex h-full w-full flex-col items-center justify-center bg-linear-to-br ${pickGradient(article.slug || article.title)} p-4 text-center`}>
            <svg className="mb-2 h-7 w-7 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9" />
            </svg>
            <span className="text-sm font-black uppercase tracking-wide text-white/95">{categoryName || "GenZ Flash"}</span>
            <span className="mt-0.5 text-[11px] font-medium text-white/70">{sourceName}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Kicker: category + source */}
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
          {categoryName && <span className="text-red-600 dark:text-red-500">{categoryName}</span>}
          {categoryName && <span className="text-slate-300 dark:text-gray-700">·</span>}
          <span className="truncate text-slate-400 dark:text-gray-500">{sourceName}</span>
        </div>

        <h3 className="text-[15px] font-semibold leading-snug text-slate-900 line-clamp-2 group-hover:text-red-700 dark:text-white dark:group-hover:text-red-400">
          {article.title}
        </h3>

        {article.summary && (
          <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-2 dark:text-gray-400">
            {article.summary}
          </p>
        )}

        {/* Meta */}
        <div className="mt-4 flex items-center gap-2 pt-3 text-xs text-slate-400 border-t border-slate-100 dark:border-gray-800 dark:text-gray-500">
          {byline && <span className="truncate">{byline}</span>}
          {byline && <span className="text-slate-300 dark:text-gray-700">·</span>}
          <span className="whitespace-nowrap">{date}</span>
          {rt && (
            <>
              <span className="text-slate-300 dark:text-gray-700">·</span>
              <span className="whitespace-nowrap">{rt}</span>
            </>
          )}
          {isExternal && (
            <svg className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="External source">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          )}
        </div>
      </div>
    </Link>
  );
}
