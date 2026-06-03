"use client";
import Link from "next/link";
import Image from "next/image";
import { NAV_CATEGORIES, NEWSROOM_LINKS, POLICY_LINKS, SOCIAL_LINKS } from "@/config/nav";
import { useLanguage } from "./LanguageProvider";
import logoSrc from "@/assets/images/logo.png";

function FooterWordmark() {
  return (
    <Link href="/" aria-label="Genzflash News — Home">
      {/* Transparent logo: black wordmark in light mode, inverted to white in dark */}
      <div className="rounded-lg overflow-hidden px-2 py-0.5 inline-block">
        <div className="relative h-8 w-40">
          <Image
            src={logoSrc}
            alt="Genzflash News"
            fill
            sizes="160px"
            className="object-cover dark:invert"
            style={{ objectPosition: "center 48%" }}
          />
        </div>
      </div>
    </Link>
  );
}

function SocialIcon({ label, href, path }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 text-slate-500 dark:text-gray-400 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d={path} />
      </svg>
    </a>
  );
}

function ColHeading({ children }) {
  return (
    <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">
      {children}
    </h2>
  );
}

function ColLink({ href, children }) {
  return (
    <Link href={href}
      className="block text-sm text-slate-600 dark:text-gray-400 transition-colors hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5 transform duration-150">
      {children}
    </Link>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Top strip */}
      <div className="border-b border-slate-200 dark:border-gray-900 bg-slate-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600" />
            </span>
            {t("footer.liveUpdated")}
          </div>
          <Link href="/register"
            className="text-xs font-semibold px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors">
            {t("footer.createAccount")}
          </Link>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">

          {/* Brand column */}
          <div className="md:col-span-5">
            <FooterWordmark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-gray-400">
              {t("footer.tagline")}
            </p>

            {/* Social links */}
            <div className="mt-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">{t("footer.followUs")}</p>
              <ul className="flex gap-2.5" aria-label="Social media">
                {SOCIAL_LINKS.map((item) => (
                  <li key={item.label}><SocialIcon {...item} /></li>
                ))}
              </ul>
            </div>

            {/* Auth CTA */}
            <div className="mt-8 flex items-center gap-3">
              <Link href="/login"
                className="text-xs font-medium px-4 py-2 rounded-full border border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:border-slate-400 dark:hover:border-gray-500 hover:text-slate-900 dark:hover:text-white transition-all">
                {t("header.signin")}
              </Link>
              <Link href="/register"
                className="text-xs font-semibold px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors">
                {t("footer.registerFree")}
              </Link>
            </div>
          </div>

          {/* Sections */}
          <nav aria-labelledby="footer-sections" className="md:col-span-3 md:col-start-7">
            <ColHeading>{t("footer.sections")}</ColHeading>
            <ul className="space-y-2.5">
              {NAV_CATEGORIES.map((cat) => (
                <li key={cat.slug}><ColLink href={`/category/${cat.slug}`}>{t(`nav.${cat.slug}`)}</ColLink></li>
              ))}
            </ul>
          </nav>

          {/* Newsroom */}
          <nav aria-labelledby="footer-newsroom" className="md:col-span-3">
            <ColHeading>{t("footer.newsroom")}</ColHeading>
            <ul className="space-y-2.5">
              {NEWSROOM_LINKS.map((link) => (
                <li key={link.href}><ColLink href={link.href}>{link.label}</ColLink></li>
              ))}
            </ul>
          </nav>
          {/* Admin entry points are intentionally NOT exposed in the public footer. */}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200 dark:border-gray-800/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Policies">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-xs text-slate-500 dark:text-gray-600">&copy; {year} GenZFlash News. {t("footer.rights")}</p>
        </div>
      </div>

      {/* RUPP attribution */}
      <div className="border-t border-slate-200 dark:border-gray-800/40 px-4 py-3">
        <p className="mx-auto max-w-7xl text-center text-[11px] leading-relaxed text-slate-400 dark:text-gray-700 md:text-left">
          {t("footer.capstone")} &middot; {year}
        </p>
      </div>
    </footer>
  );
}
