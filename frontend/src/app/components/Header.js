"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_CATEGORIES = [
  { name: "Sports", slug: "sports" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Technology", slug: "technology" },
  { name: "Politics", slug: "politics" },
  { name: "Education", slug: "education" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-2xl shadow-black/60" : ""
      }`}
    >
      {/* Top announcement bar */}
      <div className="bg-red-700 text-white text-xs py-1.5 px-4 flex items-center justify-between">
        <span className="font-medium">
          🇰🇭 Cambodia&apos;s #1 Gen Z News Platform
        </span>
        <span className="hidden sm:block text-red-200">{today}</span>
      </div>

      {/* Main navigation */}
      <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-red-600 group-hover:bg-red-500 transition-colors text-white font-black text-lg px-2.5 py-1 rounded leading-tight">
              GEN<span className="text-yellow-300">Z</span>
            </div>
            <div className="leading-tight">
              <div className="text-white font-bold text-xl tracking-tight">
                Flash<span className="text-red-500">News</span>
              </div>
              <div className="text-gray-500 text-[9px] tracking-[0.2em] uppercase">
                Cambodia &amp; Beyond
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 text-gray-300 hover:text-red-400 text-sm font-medium transition-colors rounded-lg hover:bg-gray-800"
            >
              Home
            </Link>

            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button className="px-3 py-2 text-gray-300 hover:text-red-400 text-sm font-medium transition-colors rounded-lg hover:bg-gray-800 flex items-center gap-1">
                Categories
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-2 w-48 overflow-hidden">
                  {NAV_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:bg-red-600 hover:text-white transition-colors text-sm"
                    >
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/news"
              className="px-3 py-2 text-gray-300 hover:text-red-400 text-sm font-medium transition-colors rounded-lg hover:bg-gray-800"
            >
              All News
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 text-gray-300 hover:text-red-400 text-sm font-medium transition-colors rounded-lg hover:bg-gray-800"
            >
              About
            </Link>
            <Link
              href="/admin"
              className="ml-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 py-4 px-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="block px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/news"
              className="block px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              All News
            </Link>

            <div className="border-t border-gray-800 my-2 pt-2">
              <p className="text-gray-600 text-xs px-3 mb-2 uppercase tracking-wider font-semibold">
                Categories
              </p>
              {NAV_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg text-sm transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {cat.name}
                </Link>
              ))}
            </div>

            <Link
              href="/about"
              className="block px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/admin"
              className="block mt-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-center rounded-full text-sm font-bold transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
