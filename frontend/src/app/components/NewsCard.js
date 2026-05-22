"use client";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "../lib/utils";

function readingTime(text) {
  if (!text) return null;
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function SourceBadge({ article }) {
  const source = article.source || (article.isExternal ? "External" : "GenZFlash");
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full">
      {article.isExternal ? (
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      ) : (
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
      )}
      {source}
    </span>
  );
}

export default function NewsCard({ article }) {
  const isExternal = article.isExternal && article.externalUrl;
  const rt = readingTime(article.summary || article.content);
  const categoryName = article.category?.name || article.category || null;

  const cardContent = (
    <article className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-red-600/50 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-red-950/30 transition-all duration-300 group h-full flex flex-col cursor-pointer">

      {/* Thumbnail */}
      <div className="relative overflow-hidden shrink-0">
        {article.image ? (
          <div className="relative h-52 w-full bg-gray-800">
            <Image
              src={article.image}
              alt={article.title || "News image"}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              unoptimized
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-gray-900/80 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="h-40 bg-linear-to-br from-gray-800 via-gray-850 to-gray-900 flex items-center justify-center">
            <span className="text-5xl opacity-20">📰</span>
          </div>
        )}

        {/* Category badge — always shown, on image or plain bg */}
        {categoryName && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
            {categoryName}
          </span>
        )}

        {/* Reading time badge top-right */}
        {rt && (
          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
            {rt}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">

        {/* Source badge */}
        <SourceBadge article={article} />

        {/* Title */}
        <h3 className="text-white font-bold text-[15px] leading-snug line-clamp-2 group-hover:text-red-400 transition-colors duration-200">
          {article.title}
        </h3>

        {/* Summary */}
        {article.summary && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
            {article.summary}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-800/60 flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            {article.author && (
              <span className="text-[11px] text-gray-500 font-medium truncate">
                {article.author}
              </span>
            )}
            <span className="text-[11px] text-gray-600">
              {formatDate(article.published_at || article.created_at)}
            </span>
          </div>

          {/* Read More pill */}
          <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-800 group-hover:bg-red-600 border border-gray-700 group-hover:border-red-600 text-gray-400 group-hover:text-white text-[11px] font-semibold transition-all duration-200 whitespace-nowrap">
            {isExternal ? "Read Source" : "Read More"}
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isExternal ? "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" : "M9 5l7 7-7 7"} />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );

  if (isExternal) {
    return (
      <a href={article.externalUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={`/news/${article.slug}`} className="block h-full">
      {cardContent}
    </Link>
  );
}
