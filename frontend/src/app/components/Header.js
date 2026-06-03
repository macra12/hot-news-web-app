"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "./LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE } from "@/config/api";
import logoSrc from "@/assets/images/logo.png";

const HEADER_HEIGHT_VAR = "--header-h";

const CATEGORY_NAV = [
  { tkey: "nav.home",          href: "/" },
  { tkey: "nav.allNews",       href: "/news" },
  { tkey: "nav.cambodia",      href: "/category/cambodia" },
  { tkey: "nav.world",         href: "/category/world" },
  { tkey: "nav.sports",        href: "/category/sports" },
  { tkey: "nav.technology",    href: "/category/technology" },
  { tkey: "nav.politics",      href: "/category/politics" },
  { tkey: "nav.entertainment", href: "/category/entertainment" },
  { tkey: "nav.education",     href: "/category/education" },
  { tkey: "nav.about",         href: "/about" },
];

/**
 * Precise active-state check so only ONE nav item highlights at a time.
 * Matches the exact path or a sub-path (e.g. /category/sports/...), never a
 * sibling that merely shares a prefix. Query strings are ignored.
 */
function isNavActive(pathname, href) {
  const base = href.split("?")[0];
  if (base === "/") return pathname === "/";
  return pathname === base || pathname.startsWith(base + "/");
}

/* ── Logo ─────────────────────────────────────────────────────────── */
/**
 * The actual logo PNG has a white background and is square with the
 * wordmark centred. We display it in a white pill container so it
 * looks crisp in both light and dark mode without any CSS hacks.
 * object-cover + a wide container crops the empty whitespace padding.
 */
function Wordmark() {
  return (
    <Link href="/" aria-label="Genzflash News — Home" className="shrink-0">
      <div className="rounded-lg overflow-hidden px-2 py-0.5">
        <div className="relative h-8 w-40">
          <Image
            src={logoSrc}
            alt="Genzflash News"
            fill
            sizes="160px"
            className="object-cover dark:invert"
            style={{ objectPosition: "center 48%" }}
            priority
          />
        </div>
      </div>
    </Link>
  );
}

/* ── Icon buttons ────────────────────────────────────────────────── */
function SunIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function MenuIcon({ open }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

/* ── Theme toggle ────────────────────────────────────────────────── */
function ThemeToggle({ compact = false }) {
  const { theme, toggle } = useTheme();
  const { t } = useLanguage();
  return (
    <button type="button" onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:border-slate-400 dark:hover:border-gray-500 hover:text-slate-900 dark:hover:text-white transition-all"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      {!compact && <span className="hidden sm:inline">{theme === "dark" ? t("header.light") : t("header.dark")}</span>}
    </button>
  );
}

/* ── Language switch (segmented EN | ខ្មែរ — active one is highlighted) ─── */
function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const base = "px-2.5 py-1 rounded-full transition-colors";
  const on = "bg-red-600 text-white";
  const off = "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white";
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-slate-200 dark:border-gray-700 p-0.5 text-xs font-semibold" role="group" aria-label="Language">
      <button type="button" onClick={() => setLang("en")} aria-pressed={lang === "en"} lang="en" className={`${base} font-sans ${lang === "en" ? on : off}`}>EN</button>
      <button type="button" onClick={() => setLang("km")} aria-pressed={lang === "km"} lang="km" className={`${base} font-khmer ${lang === "km" ? on : off}`}>ខ្មែរ</button>
    </div>
  );
}

/* Full-width segmented language switch for the mobile drawer */
function LanguageToggleWide() {
  const { lang, setLang } = useLanguage();
  const base = "flex-1 rounded-md py-2 text-sm font-medium transition-colors";
  const on = "bg-red-600 text-white";
  const off = "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800";
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-gray-700 p-1" role="group" aria-label="Language">
      <button type="button" onClick={() => setLang("en")} aria-pressed={lang === "en"} lang="en" className={`${base} font-sans ${lang === "en" ? on : off}`}>English</button>
      <button type="button" onClick={() => setLang("km")} aria-pressed={lang === "km"} lang="km" className={`${base} font-khmer ${lang === "km" ? on : off}`}>ខ្មែរ</button>
    </div>
  );
}

/* ── User auth pill ─────────────────────────────────────────────── */
function AuthArea() {
  const { user, ready, signOut } = useAuth();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menuOpen]);

  if (!ready) return <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-gray-800" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login"
          className="text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:border-slate-400 dark:hover:border-gray-500 hover:text-slate-900 dark:hover:text-white transition-all">
          {t("header.signin")}
        </Link>
        <Link href="/register"
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors">
          {t("header.register")}
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setMenuOpen(v => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:border-slate-400 dark:hover:border-gray-500 transition-all">
        <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
          {user.username[0].toUpperCase()}
        </span>
        <span className="hidden sm:block max-w-25 truncate">{user.username}</span>
        {user.isAdmin && <span className="hidden sm:block text-[9px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Admin</span>}
        <svg className={cn("w-3 h-3 transition-transform", menuOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-800">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.username}</p>
            <p className="text-[11px] text-slate-400 dark:text-gray-600">{user.isAdmin ? t("header.administrator") : t("header.member")}</p>
          </div>
          {user.isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {t("header.adminPanel")}
            </Link>
          )}
          <button onClick={() => { setMenuOpen(false); signOut(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {t("header.signout")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Search bar with debounced typeahead ─────────────────────────── */
function SearchBar({ className = "", onClose, autoFocus = false }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  // Debounced typeahead — hits the fast full-text endpoint (page_size=6).
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/news/?search=${encodeURIComponent(term)}&page_size=6`, { signal: ctrl.signal });
        const data = await res.json();
        setResults(Array.isArray(data) ? data : data.results || []);
        setOpen(true);
      } catch { /* aborted or network */ }
      finally { setLoading(false); }
    }, 250);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [query]);

  useEffect(() => {
    const close = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) { router.push(`/search?q=${encodeURIComponent(q)}`); setOpen(false); onClose?.(); }
  };

  const goToArticle = (slug) => {
    router.push(`/news/${slug}`);
    setQuery(""); setOpen(false); onClose?.();
  };

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <form onSubmit={submit} role="search" className="relative flex items-center">
        <span className="absolute left-3.5 text-slate-400 dark:text-gray-500 pointer-events-none"><SearchIcon /></span>
        <input ref={inputRef} type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder={t("header.search")}
          className="w-full rounded-full border border-slate-200 dark:border-gray-700 bg-slate-100 dark:bg-gray-800/70 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition" />
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden z-50">
          {loading && results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 dark:text-gray-500">{t("search.searching")}</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 dark:text-gray-500">{t("search.noResults")}</div>
          ) : (
            <>
              {results.map((a) => (
                <button key={a.id} type="button" onClick={() => goToArticle(a.slug)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors border-b border-slate-100 dark:border-gray-800/60 last:border-b-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{a.title}</p>
                  <p className="text-[11px] text-red-500 dark:text-red-400 font-semibold uppercase tracking-wide mt-0.5">{a.category?.name || a.source || "News"}</p>
                </button>
              ))}
              <button type="button" onClick={submit}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
                {t("search.seeAll")} &ldquo;{query.trim()}&rdquo; &rarr;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Mobile drawer ───────────────────────────────────────────────── */
function MobileDrawer({ open, pathname, onClose }) {
  const { theme, toggle } = useTheme();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 top-0 z-50 bg-white dark:bg-gray-950 border-b border-slate-200 dark:border-gray-800 pb-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-gray-800">
          <Wordmark />
          <button onClick={onClose} className="rounded-md p-2 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors" aria-label="Close menu">
            <MenuIcon open={true} />
          </button>
        </div>

        <div className="px-4 pt-4 pb-3"><SearchBar onClose={onClose} autoFocus /></div>

        <nav className="px-4 pt-2" aria-label="Mobile navigation">
          {CATEGORY_NAV.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={cn("flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                         : "text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-900")}>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                {t(item.tkey)}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 mt-4 pt-4 border-t border-slate-100 dark:border-gray-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={toggle}
              className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              {theme === "dark" ? t("header.light") : t("header.dark")}
            </button>
            <LanguageToggleWide />
          </div>

          {user ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 px-3 py-2">
                <span className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                  {user.username[0].toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.username}</p>
                  <p className="text-[11px] text-slate-400 dark:text-gray-600">{user.isAdmin ? t("header.administrator") : t("header.member")}</p>
                </div>
              </div>
              {user.isAdmin && (
                <Link href="/admin" onClick={onClose}
                  className="flex items-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
                  {t("header.adminPanel")}
                </Link>
              )}
              <button onClick={() => { onClose(); signOut(); }}
                className="flex items-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                {t("header.signout")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link href="/login" onClick={onClose}
                className="flex items-center justify-center px-4 py-2.5 rounded-lg border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 text-sm font-semibold hover:border-slate-400 dark:hover:border-gray-500 transition-colors">
                {t("header.signin")}
              </Link>
              <Link href="/register" onClick={onClose}
                className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">
                {t("header.register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Main Header ─────────────────────────────────────────────────── */
export default function Header() {
  const pathname  = usePathname() ?? "/";
  const { t } = useLanguage();
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [mobileSearch,  setMobileSearch]  = useState(false);
  const headerRef = useRef(null);
  const closeMobile = useCallback(() => setMenuOpen(false), []);

  useEffect(() => { closeMobile(); setMobileSearch(false); }, [pathname, closeMobile]);

  useEffect(() => {
    let frame = 0; let prev = false;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const next = window.scrollY > 8;
        if (next !== prev) { prev = next; setScrolled(next); }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const setVar = () => document.documentElement.style.setProperty(HEADER_HEIGHT_VAR, `${el.offsetHeight}px`);
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setMobileSearch(v => !v); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header ref={headerRef}
        className={cn("fixed inset-x-0 top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md transition-shadow duration-300",
          scrolled ? "shadow-md shadow-black/10 dark:shadow-black/40" : "border-b border-slate-200/80 dark:border-gray-800/80")}>

        {/* Row 1 — Utility bar (desktop) */}
        <div className="hidden md:block border-b border-slate-100 dark:border-gray-800/60">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-500">
              <time suppressHydrationWarning>
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </time>
              <span className="text-slate-300 dark:text-gray-700">|</span>
              <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600" />
                </span>
                {t("header.live")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
              <span className="text-slate-200 dark:text-gray-800">|</span>
              <AuthArea />
            </div>
          </div>
        </div>

        {/* Row 2 — Brand + Search */}
        <div className="border-b border-slate-100 dark:border-gray-800/60">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
            <Wordmark />
            <div className="hidden md:flex flex-1 max-w-xl mx-auto">
              <SearchBar className="w-full" />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="md:hidden"><ThemeToggle compact /></div>
              <button type="button" onClick={() => setMobileSearch(v => !v)}
                className="md:hidden rounded-md p-2 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors" aria-label="Search">
                <SearchIcon />
              </button>
              <button type="button" onClick={() => setMenuOpen(v => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}
                className="md:hidden rounded-md p-2 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
                <MenuIcon open={menuOpen} />
              </button>
            </div>
          </div>
          {mobileSearch && (
            <div className="md:hidden px-4 pb-3"><SearchBar onClose={() => setMobileSearch(false)} autoFocus /></div>
          )}
        </div>

        {/* Row 3 — Category nav (desktop) */}
        <nav aria-label="Category navigation" className="hidden md:block">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
              {CATEGORY_NAV.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                    className={cn("relative whitespace-nowrap px-3.5 py-3 text-[13px] font-medium transition-colors",
                      active
                        ? "text-red-600 dark:text-red-400 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-red-500"
                        : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white")}>
                    {t(item.tkey)}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      <MobileDrawer open={menuOpen} pathname={pathname} onClose={closeMobile} />
    </>
  );
}
