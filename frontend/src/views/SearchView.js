"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NewsCard from "@/app/components/NewsCard";
import { useLanguage } from "@/app/components/LanguageProvider";
import { API_BASE } from "@/config/api";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="aspect-video w-full animate-pulse bg-slate-100 dark:bg-gray-800" />
      <div className="space-y-2.5 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-gray-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const q = params.get("q") || "";
  const page = Number(params.get("page") || 1);

  const [term, setTerm] = useState(q);
  const [data, setData] = useState(null);     // { results, count, next, previous }
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTerm(q); }, [q]);

  useEffect(() => {
    if (!q.trim()) { setData({ results: [], count: 0 }); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/news/?search=${encodeURIComponent(q)}&page=${page}`);
        const d = await res.json();
        if (!cancelled) setData(Array.isArray(d) ? { results: d, count: d.length } : d);
      } catch {
        if (!cancelled) setData({ results: [], count: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [q, page]);

  const submit = (e) => {
    e.preventDefault();
    const v = term.trim();
    if (v) router.push(`/search?q=${encodeURIComponent(v)}`);
  };

  const results = data?.results || [];
  const count = data?.count ?? results.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-1 h-8 bg-red-600 rounded-full" />
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t("search.heading")}</h1>
          </div>
          <form onSubmit={submit} role="search" className="relative max-w-2xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>
            </span>
            <input
              type="search" value={term} onChange={(e) => setTerm(e.target.value)} autoFocus
              placeholder={t("header.search")}
              className="w-full rounded-full border border-slate-200 dark:border-gray-700 bg-slate-100 dark:bg-gray-800/70 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            />
          </form>
          {q.trim() && !loading && (
            <p className="text-slate-500 dark:text-gray-500 text-sm mt-4">
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">{count}</span> {t("search.count")} · {t("search.resultsFor")} &ldquo;<span className="text-slate-700 dark:text-gray-300">{q}</span>&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : !q.trim() ? (
          <div className="text-center py-24 text-slate-400 dark:text-gray-600">{t("search.startTyping")}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-300 dark:border-gray-800 rounded-2xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400 dark:text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-lg mb-1">{t("search.noneTitle")}</p>
            <p className="text-slate-500 dark:text-gray-500 text-sm">{t("search.noneHint")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((a, i) => <NewsCard key={a.id || a.slug || i} article={a} />)}
            </div>

            {(data?.next || data?.previous) && (
              <div className="flex items-center justify-center gap-3 mt-12 pt-8 border-t border-slate-200 dark:border-gray-800">
                <button disabled={!data?.previous} onClick={() => router.push(`/search?q=${encodeURIComponent(q)}&page=${page - 1}`)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 rounded-full text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>{t("news.prev")}
                </button>
                <span className="px-5 py-2 text-slate-500 dark:text-gray-500 text-sm font-medium">{t("news.page")} <span className="text-slate-900 dark:text-white font-bold">{page}</span></span>
                <button disabled={!data?.next} onClick={() => router.push(`/search?q=${encodeURIComponent(q)}&page=${page + 1}`)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 rounded-full text-sm transition-colors">
                  {t("news.next")}<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchView() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-gray-950" />}>
      <SearchContent />
    </Suspense>
  );
}
