import Link from "next/link";

const CATEGORIES = [
  { name: "Sports", slug: "sports" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Technology", slug: "technology" },
  { name: "Politics", slug: "politics" },
  { name: "Education", slug: "education" },
];

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "All News", href: "/news" },
  { label: "About Us", href: "/about" },
  { label: "Admin Panel", href: "/admin" },
];

const TECH_STACK = [
  "Next.js 16",
  "Django 5",
  "PostgreSQL",
  "Tailwind CSS v4",
  "REST API",
  "JWT Auth",
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 group mb-4">
            <div className="bg-red-600 group-hover:bg-red-500 transition-colors text-white font-black text-lg px-2.5 py-1 rounded leading-tight">
              GEN<span className="text-yellow-300">Z</span>
            </div>
            <span className="text-white font-bold text-xl">
              Flash<span className="text-red-500">News</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed mb-5">
            Cambodia&apos;s premier digital news platform for the new
            generation. Fast, accurate, and built for Gen Z readers across the
            Kingdom.
          </p>
          <div className="flex gap-4">
            {["📱", "💬", "📺", "🐦"].map((icon) => (
              <span
                key={icon}
                className="text-gray-600 hover:text-red-400 cursor-pointer text-lg transition-colors"
              >
                {icon}
              </span>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5 pb-2 border-b border-red-700">
            Categories
          </h4>
          <ul className="space-y-3">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-colors group"
                >
                  <span className="w-1 h-1 bg-red-700 rounded-full group-hover:bg-red-400 transition-colors"></span>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5 pb-2 border-b border-red-700">
            Quick Links
          </h4>
          <ul className="space-y-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-colors group"
                >
                  <span className="w-1 h-1 bg-red-700 rounded-full group-hover:bg-red-400 transition-colors"></span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech Stack */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5 pb-2 border-b border-red-700">
            Built With
          </h4>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full hover:border-red-800 hover:text-red-400 transition-colors cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
          <p className="text-gray-700 text-xs mt-5 leading-relaxed">
            Final-year capstone project — Royal University of Phnom Penh,
            Faculty of Information Technology.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800/60 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-600 text-xs">
            © {year}{" "}
            <span className="text-red-600 font-semibold">GenZFlash News</span>.
            All rights reserved.
          </p>
          <p className="text-gray-700 text-xs">
            Built with ❤️ at RUPP · Phnom Penh, Cambodia
          </p>
        </div>
      </div>
    </footer>
  );
}
