"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import NewsCard from "@/app/components/NewsCard";
import { CATEGORY_META } from "@/config/feeds";
import { useLanguage } from "@/app/components/LanguageProvider";
import { API_BASE } from "@/config/api";

const PAGE_SIZE = 24;

function Skeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-100 dark:bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded w-1/4" />
        <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded w-full" />
        <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded w-3/4" />
      </div>
    </div>
  );
}

export default function CategoryView() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const page = Number(searchParams.get("page") || 1);

  const catLabel = (s, fallback) => {
    const v = t(`nav.${s}`);
    return v === `nav.${s}` ? fallback : v;
  };
  const meta = CATEGORY_META[slug] || { label: slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ") : "News" };
  const label = catLabel(slug, meta.label);

  const [data, setData] = useState(null);   // { results, count, next, previous }
  const [loading, setLoading] = useState(true);

  // Read straight from the database — clean, correctly-categorised articles.
  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/news/?category__slug=${encodeURIComponent(slug)}&page=${page}&page_size=${PAGE_SIZE}`);
        const d = await res.json();
        if (!cancelled) setData(Array.isArray(d) ? { results: d, count: d.length } : d);
      } catch {
        if (!cancelled) setData({ results: [], count: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, page]);

  const articles = data?.results || [];
  const count    = data?.count ?? 0;
  const goPage   = (p) => router.push(`/category/${slug}?page=${p}`);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <div className="border-b border-slate-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors group mb-6">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {t("nav.home")}
          </Link>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{label}</h1>
            {!loading && (
              <span className="text-sm text-slate-500 dark:text-gray-500"><span className="font-bold text-slate-900 dark:text-white tabular-nums">{count}</span> {t("category.articles")}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>
        ) : !articles.length ? (
          <div className="text-center py-20 border border-dashed border-slate-300 dark:border-gray-800 rounded-2xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400 dark:text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-sm">{t("category.empty")}</p>
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

        {/* Browse other categories */}
        <div className="border-t border-slate-200 dark:border-gray-800 pt-10 mt-12">
          <p className="text-slate-400 dark:text-gray-600 text-xs uppercase tracking-wider font-semibold mb-4">{t("category.browseOther")}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_META).map(([s, m]) => (
              <Link key={s} href={`/category/${s}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  s === slug
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600"
                }`}
              >
                {catLabel(s, m.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
