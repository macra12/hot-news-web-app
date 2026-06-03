"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import NewsCard from "@/app/components/NewsCard";
import { useHybridCategory } from "@/hooks/useNews";
import { CATEGORY_META, NEWS_FEEDS } from "@/config/feeds";
import { useLanguage } from "@/app/components/LanguageProvider";

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
  const { t } = useLanguage();
  const meta = CATEGORY_META[slug] || {
    label: slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ") : "News",
    feedKey: null,
  };

  // Translate a category label from its slug, falling back to the English label.
  const catLabel = (s, fallback) => {
    const v = t(`nav.${s}`);
    return v === `nav.${s}` ? fallback : v;
  };
  const label = catLabel(slug, meta.label);

  const { articles, loading, error } = useHybridCategory(slug, 12);

  const feed = meta.feedKey ? NEWS_FEEDS[meta.feedKey] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <div className="border-b border-slate-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors group mb-6">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Home
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{label}</h1>
            {feed && <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">{t("category.liveNews")} · {feed.label}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Hybrid feed: live API + stored DB articles */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span className="w-1 h-5 bg-red-600 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{label} - {t("category.liveNews")}</h2>
            {!loading && (
              <span className="ml-2 text-slate-500 dark:text-gray-600 text-xs bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-2.5 py-1 rounded-full">{articles.length} {t("category.articles")}</span>
            )}
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({length:6}).map((_,i)=><Skeleton key={i}/>)}</div>
          ) : error || !articles.length ? (
            <div className="text-center py-16 border border-dashed border-slate-300 dark:border-gray-800 rounded-2xl">
              <p className="text-slate-400 dark:text-gray-400">{t("category.couldntLive")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a,i)=><NewsCard key={a.article_id || a.id || i} article={a}/>)}
            </div>
          )}
        </div>

        {/* Browse other categories */}
        <div className="border-t border-slate-200 dark:border-gray-800 pt-10">
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
