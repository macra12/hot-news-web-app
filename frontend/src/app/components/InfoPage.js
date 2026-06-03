import Link from "next/link";

/**
 * Shared layout for static information / legal pages (Contact, Help, Terms, …).
 * Server component — no client hooks, so these pages are statically rendered
 * and fast. Children are raw <h2>/<p>/<ul> elements, styled via the wrapper.
 */
export default function InfoPage({ title, subtitle, updated, children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <header className="border-b border-slate-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link
            href="/"
            className="group mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500 dark:text-gray-400">{subtitle}</p>}
          {updated && <p className="mt-4 text-xs uppercase tracking-wider text-slate-400 dark:text-gray-600">Last updated {updated}</p>}
        </div>
      </header>

      <article
        className="mx-auto max-w-3xl px-6 py-12 space-y-2
          [&_h2]:mt-9 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-white
          [&_p]:mb-4 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-slate-600 dark:[&_p]:text-gray-400
          [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:text-[15px] [&_li]:text-slate-600 dark:[&_li]:text-gray-400
          [&_a]:font-medium [&_a]:text-red-600 hover:[&_a]:underline dark:[&_a]:text-red-400"
      >
        {children}
      </article>
    </div>
  );
}
