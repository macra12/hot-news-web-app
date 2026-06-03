import Link from "next/link";
import Image from "next/image";
import logoSrc from "@/assets/images/logo.png";

const STATS = [
  { value: "10.8M", label: "Internet users in Cambodia (2025)" },
  { value: "60.7%", label: "Internet penetration" },
  { value: "12.9M", label: "Social media identities" },
  { value: "72.4%", label: "Of the population on social platforms" },
];

const OBJECTIVES = [
  "Build a web-based news platform tailored to Cambodian readers.",
  "Integrate public news APIs and RSS feeds for continuously updated content.",
  "Organise news into clear categories for fast, intuitive browsing.",
  "Let users search and read full articles in one place.",
  "Provide a secure admin dashboard for managing news and sources.",
  "Enable staff to add, edit, publish, archive, and delete articles.",
  "Deliver a responsive interface that works on desktop and mobile browsers.",
];

const SCOPE = [
  {
    title: "For readers",
    points: ["Latest, trending and featured news", "Browse by category", "Search by keyword", "Full article detail with images", "Related stories"],
  },
  {
    title: "For admin & reporters",
    points: ["Secure JWT login", "Dashboard overview", "Create, edit & delete articles", "Manage categories & sources", "Publish / unpublish / archive"],
  },
  {
    title: "System",
    points: ["Centralised news database", "Public API & RSS aggregation", "Category & source management", "View-count tracking", "Responsive web design"],
  },
];

const LIMITATIONS = [
  "Content availability depends on third-party public news APIs and RSS feeds.",
  "An internet connection is required — there is no offline mode.",
  "Search is keyword-based; AI-driven personalised recommendations are out of scope.",
  "Live video streaming is not supported in this version.",
  "This release focuses on the web; a native mobile app is planned for the future.",
];

const TECH = [
  { name: "Next.js", role: "React framework — App Router, SSR" },
  { name: "Django", role: "Python backend & REST API" },
  { name: "Django REST Framework", role: "Serializers, viewsets, permissions" },
  { name: "PostgreSQL", role: "Relational database" },
  { name: "Tailwind CSS", role: "Utility-first styling" },
  { name: "SimpleJWT", role: "Stateless token authentication" },
];

function SectionLabel({ children }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-500">
      {children}
    </span>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white">

      {/* Hero */}
      <section className="border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-24">
          <div className="relative h-9 w-44 mb-8">
            <Image src={logoSrc} alt="GenZ Flash News" fill sizes="176px" className="object-cover object-left dark:invert" style={{ objectPosition: "left 48%" }} priority />
          </div>
          <SectionLabel>About the project</SectionLabel>
          <h1 className="mt-3 text-4xl md:text-5xl font-black leading-tight tracking-tight">
            A centralised news platform built for Cambodia&apos;s digital generation.
          </h1>
          <p className="mt-5 text-lg text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            GenZ Flash brings local and international news into one place — aggregating public
            news sources and combining them with editorial content managed by our team, so readers
            can find what matters quickly, on any device.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-gray-500 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="max-w-6xl mx-auto px-6 pb-6 -mt-4 text-xs text-slate-400 dark:text-gray-600">
          Source: DataReportal — Digital 2025: Cambodia.
        </p>
      </section>

      {/* Background & Mission */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-20">
        <SectionLabel>Background</SectionLabel>
        <div className="mt-4 space-y-5 text-slate-600 dark:text-gray-400 leading-relaxed">
          <p>
            Digital technology has changed how people in Cambodia access news. Most readers now
            follow current events through online platforms and social media, where information is
            fast and convenient — but also scattered across many websites and pages.
          </p>
          <p>
            That fragmentation makes it harder to find relevant, organised, and reliable news
            quickly. GenZ Flash addresses this by collecting news from trusted public sources into
            a single platform, organised by category and searchable in seconds, while giving
            editorial staff the tools to publish and manage local stories.
          </p>
        </div>
      </section>

      {/* Objectives */}
      <section className="border-y border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
          <SectionLabel>Objectives</SectionLabel>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold">What the project sets out to do</h2>
          <ol className="mt-8 space-y-4">
            {OBJECTIVES.map((o, i) => (
              <li key={i} className="flex gap-4">
                <span className="shrink-0 text-sm font-bold text-red-600 dark:text-red-500 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-slate-700 dark:text-gray-300 leading-relaxed">{o}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Scope */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <SectionLabel>Scope</SectionLabel>
        <h2 className="mt-3 text-2xl md:text-3xl font-bold">What the platform covers</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {SCOPE.map((col) => (
            <div key={col.title} className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-gray-400">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Limitations */}
      <section className="border-y border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
          <SectionLabel>Limitations</SectionLabel>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold">What this version does not do</h2>
          <ul className="mt-8 space-y-4">
            {LIMITATIONS.map((l, i) => (
              <li key={i} className="flex gap-3 text-slate-600 dark:text-gray-400 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-gray-600" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tech stack */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <SectionLabel>Built with</SectionLabel>
        <h2 className="mt-3 text-2xl md:text-3xl font-bold">Technology stack</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-200 dark:bg-gray-800">
          {TECH.map((t) => (
            <div key={t.name} className="bg-white dark:bg-gray-900 p-6">
              <p className="font-semibold text-slate-900 dark:text-white">{t.name}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-gray-500">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Attribution */}
      <section className="border-t border-slate-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
            A final-year capstone project developed at the{" "}
            <span className="font-semibold text-slate-900 dark:text-white">Royal University of Phnom Penh</span>,
            Faculty of Information Technology — demonstrating full-stack web development across a
            REST API backend and a responsive, component-driven frontend.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">
              Read the news
            </Link>
            <Link href="/admin/login" className="px-5 py-2.5 rounded-full border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:border-slate-400 dark:hover:border-gray-500 text-sm font-semibold transition-colors">
              Admin sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
