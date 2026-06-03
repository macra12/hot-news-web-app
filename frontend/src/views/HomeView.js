"use client";
import Image from "next/image";
import Link from "next/link";
import NewsCard from "@/app/components/NewsCard";
import { useHybridCategory, useHybridLeadNews, useHybridMultiCategory, useCmsNews, useTrendingNews } from "@/hooks/useNews";
import { relativeTime, resolveImageUrl } from "@/utils";
import { useLanguage } from "@/app/components/LanguageProvider";
import { HOME_TOPIC_BLOCKS } from "@/config/feeds";

const TOPIC_KEYS = HOME_TOPIC_BLOCKS.map((t) => t.key);

// Quick-nav categories (match the project scope + DB category slugs).
const QUICK_NAV = ["cambodia", "world", "politics", "technology", "sports", "entertainment", "business", "education"];

/* ── Routing helper — external articles go through detail page ──── */
function articleHref(article) {
  if (!article.isExternal) return `/news/${article.slug}`;
  const id  = encodeURIComponent(article.article_id || "");
  const cat = encodeURIComponent(article.feedKey || "world");
  return `/news/external?id=${id}&cat=${cat}`;
}

function readingTime(text) {
  if (!text) return null;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/* ── Small shared components ──────────────────────────────────────── */
function SectionHeading({ title, href, live = false }) {
  const { t } = useLanguage();
  return (
    <div className="mb-5 flex items-end justify-between gap-3 border-b border-slate-200 dark:border-gray-800 pb-3">
      <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">
        <span className="h-6 w-1 rounded-full bg-red-600" />
        {title}
        {live && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-600/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            {t("common.live")}
          </span>
        )}
      </h2>
      {href && (
        <Link href={href} className="text-xs font-semibold uppercase tracking-wider text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors whitespace-nowrap">
          {t("common.viewAll")} &rarr;
        </Link>
      )}
    </div>
  );
}

function MetaRow({ article, showReadTime = false }) {
  const ts  = relativeTime(article.published_at || article.created_at);
  const cat = article.category?.name ?? (typeof article.category === "string" ? article.category : null) ?? article.source;
  const rt  = showReadTime ? readingTime(article.summary || article.content) : null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 dark:text-gray-500">
      {cat && <span className="font-bold uppercase tracking-[0.14em] text-red-500 dark:text-red-400">{cat}</span>}
      {cat && ts && <span className="text-slate-300 dark:text-gray-700">&middot;</span>}
      {ts && <time dateTime={article.published_at || article.created_at} suppressHydrationWarning>{ts}</time>}
      {rt && <><span className="text-slate-300 dark:text-gray-700">&middot;</span><span>{rt} min</span></>}
    </div>
  );
}

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

function ErrorState({ message, onRetry }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-gray-800 px-6 py-10 text-center">
      <svg className="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
      <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="rounded-full bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}

/* ── Category quick-nav (horizontal pills) ─────────────────────────── */
function CategoryNav() {
  const { t } = useLanguage();
  return (
    <nav aria-label="Browse categories" className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
      {QUICK_NAV.map((slug) => (
        <Link key={slug} href={`/category/${slug}`}
          className="shrink-0 rounded-full border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-1.5 text-sm font-semibold text-slate-600 dark:text-gray-300 hover:border-red-500 hover:bg-red-600 hover:text-white dark:hover:border-red-500 transition-colors">
          {t(`nav.${slug}`)}
        </Link>
      ))}
    </nav>
  );
}

/* ── Card layouts ─────────────────────────────────────────────────── */
function LeadStory({ article }) {
  const { t } = useLanguage();
  const cat = article.category?.name ?? (typeof article.category === "string" ? article.category : null) ?? article.source;
  return (
    <Link href={articleHref(article)} className="group relative block overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-900 min-h-95 lg:min-h-115 shadow-sm hover:shadow-xl transition-shadow">
      {resolveImageUrl(article.image) ? (
        <Image src={resolveImageUrl(article.image)} alt={article.title} fill sizes="(max-width:1024px) 100vw, 66vw" className="object-cover transition-transform duration-700 group-hover:scale-105" priority unoptimized />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-gray-800 to-gray-950" />
      )}
      {/* Legibility gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-9">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-lg">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />{t("home.topStory")}
          </span>
          {cat && <span className="rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">{cat}</span>}
        </div>
        <h2 className="max-w-3xl text-2xl font-black leading-tight text-white drop-shadow md:text-4xl">
          {article.title}
        </h2>
        {article.summary && <p className="mt-3 max-w-2xl line-clamp-2 text-sm text-gray-200 md:text-base">{article.summary}</p>}
        <div className="mt-4 flex items-center gap-2 text-[12px] text-gray-300">
          <time suppressHydrationWarning>{relativeTime(article.published_at || article.created_at)}</time>
          <span className="inline-flex items-center gap-1.5 text-red-300 font-semibold group-hover:gap-2.5 transition-all ml-2">
            {t("home.readFull")}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

function SecondaryCard({ article }) {
  return (
    <Link href={articleHref(article)} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-red-400/60 dark:hover:border-red-600/50 hover:shadow-md dark:hover:shadow-red-950/20 transition-all">
      <div className="relative aspect-video bg-slate-100 dark:bg-gray-800 shrink-0 overflow-hidden">
        {resolveImageUrl(article.image) ? (
          <Image src={resolveImageUrl(article.image)} alt={article.title} fill sizes="(max-width:768px) 100vw,33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        <h3 className="line-clamp-3 text-[15px] font-bold leading-snug text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{article.title}</h3>
        <div className="mt-auto"><MetaRow article={article} /></div>
      </div>
    </Link>
  );
}

function HeadlineRow({ article }) {
  return (
    <Link href={articleHref(article)} className="group flex items-start gap-3 border-b border-slate-100 dark:border-gray-800 py-3 last:border-b-0">
      {resolveImageUrl(article.image) && (
        <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-gray-800">
          <Image src={resolveImageUrl(article.image)} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        </div>
      )}
      <div className="min-w-0">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{article.title}</h4>
        <div className="mt-1.5"><MetaRow article={article} /></div>
      </div>
    </Link>
  );
}

/* ── Trending: ranked, with big numerals ──────────────────────────── */
function TrendingRank({ article, rank, big = false }) {
  const { t } = useLanguage();
  return (
    <Link href={articleHref(article)} className="group flex items-start gap-4 py-3.5 border-b border-slate-100 dark:border-gray-800 last:border-b-0">
      <span className={`shrink-0 font-black leading-none tabular-nums ${big ? "text-5xl" : "text-3xl"} text-slate-200 dark:text-gray-700 group-hover:text-red-500 transition-colors`}>
        {rank}
      </span>
      <div className="min-w-0">
        <h4 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors md:text-[15px]">
          {article.title}
        </h4>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-gray-500">
          {article.category?.name && <span className="font-bold uppercase tracking-[0.14em] text-red-500 dark:text-red-400">{article.category.name}</span>}
          {article.view_count != null && (
            <>
              {article.category?.name && <span className="text-slate-300 dark:text-gray-700">&middot;</span>}
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" /></svg>
                {article.view_count} {t("home.views")}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

function TrendingSection({ articles }) {
  const { t } = useLanguage();
  if (!articles?.length) return null;
  const [featured, ...rest] = articles.slice(0, 5);
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-5 md:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/10 text-red-500">
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 7-7M21 8v6M21 8h-6" /></svg>
        </span>
        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">{t("home.trending")}</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Featured #1 */}
        <Link href={articleHref(featured)} className="group block">
          <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-gray-800">
            {resolveImageUrl(featured.image) ? (
              <Image src={resolveImageUrl(featured.image)} alt={featured.title} fill sizes="(max-width:1024px) 100vw,40vw" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900" />
            )}
            <span className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white shadow-lg">1</span>
          </div>
          <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors md:text-lg">{featured.title}</h3>
          <div className="mt-2"><MetaRow article={featured} /></div>
        </Link>
        {/* #2–#5 */}
        <div>
          {rest.map((a, i) => <TrendingRank key={a.id || a.slug || i} article={a} rank={i + 2} />)}
        </div>
      </div>
    </section>
  );
}

function TopicBlock({ label, slug, articles }) {
  if (!articles?.length) return null;
  const [featured, ...rest] = articles;
  return (
    <section>
      <SectionHeading title={label} href={`/category/${slug}`} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3"><SecondaryCard article={featured} /></div>
        <div className="lg:col-span-2 divide-y divide-slate-100 dark:divide-gray-800">
          {rest.slice(0, 4).map((a, i) => <HeadlineRow key={a.article_id || a.id || i} article={a} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Join / newsletter CTA band ───────────────────────────────────── */
function JoinBand() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-red-600 to-red-700 px-6 py-10 md:px-12 md:py-12">
      <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-black/10 blur-2xl" />
      <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-black leading-tight text-white md:text-3xl">{t("home.joinTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/85 md:text-base">{t("home.joinText")}</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-red-600 shadow-lg transition-transform hover:scale-105">
          {t("home.joinCta")}
        </Link>
      </div>
    </section>
  );
}

/* ── Main view ────────────────────────────────────────────────────── */
export default function HomeView() {
  const { t } = useLanguage();
  const { articles: leadFeed,    loading: leadLoading,    error: leadError,    reload: reloadLead    } = useHybridLeadNews(8);
  const { articles: cambodiaFeed,loading: cambodiaLoading,error: cambodiaError,reload: reloadCambodia} = useHybridCategory("cambodia", 6);
  const { data: topics,          loading: topicsLoading                                               } = useHybridMultiCategory(TOPIC_KEYS);
  const { articles: cmsNews,     loading: cmsLoading,     error: cmsError,     reload: reloadCms     } = useCmsNews();
  const { articles: trending                                                                          } = useTrendingNews();

  const lead          = leadFeed.find((article) => resolveImageUrl(article.image)) || leadFeed[0];
  const leadRemainder = leadFeed.filter((article) => article !== lead);
  const secondaries   = leadRemainder.slice(0, 3);
  const moreHeadlines = leadRemainder.slice(3);
  const recommended   = cmsNews.slice(0, 3);
  const newsroom      = cmsNews.slice(3);

  return (
    <div className="bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white">
      {/* Breaking ticker */}
      <div className="bg-red-600 text-white text-xs font-semibold py-2">
        <div className="flex items-center gap-4 max-w-7xl mx-auto px-4">
          <span className="shrink-0 uppercase tracking-widest font-black border border-white/40 px-2 py-0.5 rounded text-[10px]">{t("home.breaking")}</span>
          <p className="truncate text-white/90">{t("home.ticker")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-8 md:px-6 md:py-10">

        {/* Category quick-nav */}
        <CategoryNav />

        {/* Lead + secondary grid */}
        <section aria-labelledby="lead-heading">
          <h1 id="lead-heading" className="sr-only">Top stories</h1>
          {leadLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8"><div className="aspect-16/10 lg:min-h-115 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-gray-900" /></div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:col-span-4"><SkeletonCard /><SkeletonCard /></div>
            </div>
          ) : leadError || !lead ? (
            <ErrorState message={t("home.errLead")} onRetry={reloadLead} />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8"><LeadStory article={lead} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:grid-cols-1 lg:col-span-4">
                {secondaries.map((a, i) => <SecondaryCard key={a.article_id || i} article={a} />)}
              </div>
            </div>
          )}
        </section>

        {/* Trending */}
        {trending.length > 0 && <TrendingSection articles={trending} />}

        {/* Cambodia Today */}
        <section aria-labelledby="cambodia-heading">
          <SectionHeading title={t("home.cambodiaToday")} href="/category/cambodia" live />
          {cambodiaLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3"><SkeletonCard /></div>
              <div className="space-y-3 lg:col-span-2">{Array.from({length:4}).map((_,i)=><div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-gray-900"/>)}</div>
            </div>
          ) : cambodiaError || !cambodiaFeed.length ? (
            <ErrorState message={t("home.errCambodia")} onRetry={reloadCambodia} />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3"><SecondaryCard article={cambodiaFeed[0]} /></div>
              <div className="lg:col-span-2">{cambodiaFeed.slice(1,5).map((a,i)=><HeadlineRow key={a.article_id||i} article={a}/>)}</div>
            </div>
          )}
        </section>

        {/* Recommended (CMS) */}
        {(cmsLoading || recommended.length > 0) && (
          <section aria-labelledby="recommended-heading">
            <SectionHeading title={t("home.recommended")} href="/news" />
            {cmsLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{Array.from({length:3}).map((_,i)=><SkeletonCard key={i}/>)}</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {recommended.map((a) => <NewsCard key={a.id} article={a} />)}
              </div>
            )}
          </section>
        )}

        {/* Topic blocks */}
        <section aria-labelledby="topics-heading">
          <h2 id="topics-heading" className="sr-only">Browse by topic</h2>
          {topicsLoading ? (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              {HOME_TOPIC_BLOCKS.map((b)=>(
                <div key={b.key} className="space-y-4">
                  <div className="h-6 w-32 animate-pulse rounded bg-slate-100 dark:bg-gray-800"/>
                  <SkeletonCard/>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {HOME_TOPIC_BLOCKS.map((block) => (
                <TopicBlock key={block.key} label={t(`nav.${block.key}`)} slug={block.key} articles={topics[block.key]} />
              ))}
            </div>
          )}
        </section>

        {/* Join band */}
        <JoinBand />

        {/* More world headlines */}
        {moreHeadlines.length > 0 && (
          <section aria-labelledby="more-heading">
            <SectionHeading title={t("home.moreWorld")} href="/news" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {moreHeadlines.map((a, i) => <SecondaryCard key={a.article_id||i} article={a} />)}
            </div>
          </section>
        )}

        {/* From our newsroom */}
        <section aria-labelledby="newsroom-heading">
          <SectionHeading title={t("home.newsroom")} href="/news?tab=local" />
          {cmsLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{Array.from({length:3}).map((_,i)=><SkeletonCard key={i}/>)}</div>
          ) : cmsError ? (
            <ErrorState message={t("home.errBackend")} onRetry={reloadCms} />
          ) : !newsroom.length ? (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-gray-800 px-6 py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-gray-400">
                {t("home.noStories")}{" "}
                <Link href="/admin" className="font-semibold text-red-500 hover:text-red-600 dark:text-red-400 transition-colors">{t("home.writeFirst")}</Link>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {newsroom.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
