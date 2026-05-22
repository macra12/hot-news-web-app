import Link from "next/link";

const SCOPE_ITEMS = [
  {
    icon: "🌐",
    title: "Cambodia-Focused Platform",
    desc: "A dedicated web-based news application tailored for users in Cambodia, covering local and national stories with relevance and depth.",
    color: "border-red-600",
  },
  {
    icon: "📰",
    title: "Multi-Category Coverage",
    desc: "Organized news across Sports, Entertainment, Technology, Politics, and Education — giving readers a complete picture of what matters.",
    color: "border-orange-500",
  },
  {
    icon: "📱",
    title: "Responsive Web Design",
    desc: "Fully optimized for both desktop and mobile web browsers. No app download needed — just open and read anywhere, anytime.",
    color: "border-yellow-500",
  },
  {
    icon: "✍️",
    title: "Admin Content Management",
    desc: "Admin reporters can create, edit, publish, and manage articles through a secure CMS panel — from draft to live in minutes.",
    color: "border-green-500",
  },
  {
    icon: "🌍",
    title: "International News Integration",
    desc: "Selected global headlines from trusted international sources are integrated directly into the homepage via NewsData API.",
    color: "border-blue-500",
  },
  {
    icon: "🔐",
    title: "Secure Authentication",
    desc: "JWT-based login system protects the admin panel. Access tokens and refresh tokens ensure safe and stateless authentication.",
    color: "border-purple-500",
  },
  {
    icon: "🔍",
    title: "Search & Category Filter",
    desc: "Users can browse news by category and journalists can search articles by title, content, or summary directly from the backend.",
    color: "border-pink-500",
  },
  {
    icon: "📊",
    title: "Trending News Tracker",
    desc: "Real-time view count tracking on every article identifies what's trending and surfaces the most-read content automatically.",
    color: "border-cyan-500",
  },
];

const LIMITATIONS = [
  {
    icon: "🇰🇭",
    title: "Regional News Focus",
    desc: "Content is primarily centered on Cambodian news with a curated selection of important international stories.",
  },
  {
    icon: "🌐",
    title: "Internet Required",
    desc: "The platform requires an active internet connection to load and display news content — offline mode is not supported.",
  },
  {
    icon: "🤖",
    title: "No AI Recommendations",
    desc: "Advanced AI-based personalized news recommendations are outside the current project scope.",
  },
  {
    icon: "📺",
    title: "No Live Video Streaming",
    desc: "Live video news streaming is not supported. The platform is focused on text-based and image-based articles.",
  },
  {
    icon: "📣",
    title: "Limited Social Integration",
    desc: "Full social media sharing and integration features are limited or not yet available in this version.",
  },
];

const TECH_STACK = [
  {
    name: "Next.js 16",
    desc: "React framework for the frontend with App Router and SSR",
    icon: "▲",
    color: "bg-white text-black",
  },
  {
    name: "Django 5",
    desc: "Python web framework powering the REST API backend",
    icon: "🐍",
    color: "bg-green-800 text-white",
  },
  {
    name: "PostgreSQL",
    desc: "Relational database for storing articles, categories & users",
    icon: "🐘",
    color: "bg-blue-800 text-white",
  },
  {
    name: "Tailwind CSS v4",
    desc: "Utility-first CSS framework for rapid UI development",
    icon: "🎨",
    color: "bg-sky-700 text-white",
  },
  {
    name: "Django REST Framework",
    desc: "Serializers, ViewSets, filtering, pagination, and permissions",
    icon: "🔧",
    color: "bg-red-900 text-white",
  },
  {
    name: "JWT Authentication",
    desc: "SimpleJWT for stateless token-based auth with refresh tokens",
    icon: "🔑",
    color: "bg-yellow-700 text-white",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-gray-900 via-gray-950 to-black py-24 border-b border-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(220,38,38,0.15)_0%,transparent_60%)]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-red-600 text-white font-black text-2xl px-3.5 py-1.5 rounded-lg">
              GEN<span className="text-yellow-300">Z</span>
            </div>
            <span className="text-white font-bold text-3xl">
              Flash<span className="text-red-500">News</span>
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            About{" "}
            <span className="text-red-500">Our Project</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Delivering the future of news to Cambodia&apos;s new generation —
            fast, accurate, and always accessible.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {["Next.js", "Django", "PostgreSQL", "Tailwind CSS"].map((t) => (
              <span
                key={t}
                className="bg-gray-800 border border-gray-700 text-gray-400 px-3 py-1.5 rounded-full text-xs font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-linear-to-r from-red-950/40 to-gray-900 border border-red-900/50 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-lg">
              🎯
            </div>
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            GenZFlash News was built to close the gap between Cambodia&apos;s
            young readers and reliable, timely information. We believe news
            should be{" "}
            <span className="text-red-400 font-semibold">
              fast, categorized, and beautifully presented
            </span>{" "}
            — not buried in cluttered interfaces. Our platform empowers both
            readers and admin reporters through a clean CMS, real-time global
            news integration, and a modern web experience designed for the
            mobile generation.
          </p>
        </div>
      </section>

      {/* Scope */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <span className="text-red-500 text-xs font-bold uppercase tracking-widest">
            What We Do
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2">
            Project Scope
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            The core features and goals this project was designed to accomplish.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SCOPE_ITEMS.map((item) => (
            <div
              key={item.title}
              className={`bg-gray-900 border-t-2 ${item.color} rounded-xl p-6 hover:bg-gray-800 transition-colors group`}
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-white font-bold text-base mb-2 group-hover:text-red-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Limitations */}
      <section className="bg-gray-900/50 border-y border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest">
              Transparency
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2">
              Known Limitations
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              We believe in being honest about what this version of the project
              does and does not support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {LIMITATIONS.map((item) => (
              <div
                key={item.title}
                className="bg-gray-900 border border-yellow-900/40 rounded-xl p-6 flex gap-4"
              >
                <div className="text-2xl shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <h3 className="text-yellow-400 font-semibold text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">
            Technology
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2">
            Tech Stack
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Modern, production-grade tools chosen for scalability and developer
            experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-start gap-4 hover:border-gray-600 transition-colors"
            >
              <div
                className={`w-10 h-10 ${tech.color} rounded-lg flex items-center justify-center font-bold text-sm shrink-0`}
              >
                {tech.icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">
                  {tech.name}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {tech.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RUPP Attribution */}
      <section className="border-t border-gray-800 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="text-4xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Built at RUPP
          </h2>
          <p className="text-gray-500 leading-relaxed mb-6">
            This is a final-year capstone project developed at the{" "}
            <span className="text-white font-semibold">
              Royal University of Phnom Penh
            </span>
            , Faculty of Information Technology. GenZFlash News demonstrates
            full-stack web development skills across a modern REST API backend
            and a responsive, component-driven frontend.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-semibold transition-colors"
            >
              Read the News
            </Link>
            <Link
              href="/admin"
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm font-semibold transition-colors border border-gray-700"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
