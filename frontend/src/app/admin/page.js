"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = "http://localhost:8000/api";
const EMPTY_NEWS = { title: "", summary: "", content: "", status: "draft", category_id: "" };
const EMPTY_CAT = { name: "" };

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium animate-in ${
        toast.type === "error"
          ? "bg-red-950 border-red-800 text-red-300"
          : "bg-green-950 border-green-800 text-green-300"
      }`}
    >
      <span>{toast.type === "error" ? "❌" : "✅"}</span>
      {toast.msg}
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className={`bg-gray-900 border-l-4 ${accent} rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [section, setSection] = useState("dashboard");
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [newsForm, setNewsForm] = useState(EMPTY_NEWS);
  const [catForm, setCatForm] = useState(EMPTY_CAT);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(
    async (tk) => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${tk}` };
        const [nRes, cRes] = await Promise.all([
          fetch(`${API_BASE}/news/`, { headers }),
          fetch(`${API_BASE}/categories/`, { headers }),
        ]);
        if (nRes.status === 401) {
          localStorage.removeItem("token");
          router.push("/admin/login");
          return;
        }
        const nData = await nRes.json();
        const cData = await cRes.json();
        setNews(
          Array.isArray(nData)
            ? nData
            : Array.isArray(nData.results)
              ? nData.results
              : []
        );
        setCategories(
          Array.isArray(cData)
            ? cData
            : Array.isArray(cData.results)
              ? cData.results
              : []
        );
      } catch {
        showToast("Failed to load data. Check backend connection.", "error");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
    fetchData(t);
  }, [fetchData, router]);

  const createNews = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...newsForm };
      if (!payload.category_id) delete payload.category_id;
      const res = await fetch(`${API_BASE}/news/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        const msg = Object.values(err).flat().join(" ") || "Failed to create article";
        showToast(msg, "error");
      } else {
        showToast("Article created successfully!");
        setNewsForm(EMPTY_NEWS);
        fetchData(token);
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const createCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/categories/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(catForm),
      });
      if (!res.ok) {
        showToast("Failed to create category", "error");
      } else {
        showToast("Category created!");
        setCatForm(EMPTY_CAT);
        fetchData(token);
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (endpoint, id, label) => {
    if (!confirm(`Delete this ${label}? This cannot be undone.`)) return;
    try {
      await fetch(`${API_BASE}/${endpoint}/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(`${label} deleted`);
      fetchData(token);
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  const published = news.filter((n) => n.status === "published").length;
  const drafts = news.filter((n) => n.status === "draft").length;

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "articles", label: "Articles", icon: "📰", count: news.length },
    { id: "categories", label: "Categories", icon: "🏷️", count: categories.length },
  ];

  if (!token || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="flex gap-1.5 justify-center mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-red-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-gray-600 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2.5 group mb-1">
          <div className="bg-red-600 group-hover:bg-red-500 transition-colors text-white font-black text-base px-2 py-0.5 rounded">
            GEN<span className="text-yellow-300">Z</span>
          </div>
          <span className="text-white font-bold text-lg">
            Flash<span className="text-red-500">News</span>
          </span>
        </Link>
        <p className="text-gray-600 text-[10px] tracking-wider uppercase ml-0.5">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest px-3 py-2 mt-1">
          Navigation
        </p>
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setSection(item.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              section === item.id
                ? "bg-red-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-base">{item.icon}</span>
              {item.label}
            </span>
            {item.count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  section === item.id
                    ? "bg-red-700 text-red-200"
                    : "bg-gray-800 text-gray-500"
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-800 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors"
        >
          <span>🌐</span> View Site
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-gray-400 hover:text-red-400 hover:bg-gray-800/70 rounded-lg text-sm transition-colors"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 bg-gray-900 border-r border-gray-800 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-56 bg-gray-900 border-r border-gray-800 flex flex-col z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-bold text-white capitalize">
                {section === "dashboard"
                  ? "Dashboard"
                  : section === "articles"
                    ? "Articles"
                    : "Categories"}
              </h1>
              <p className="text-gray-600 text-xs hidden sm:block">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <span className="bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
            Admin
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* ── DASHBOARD ── */}
          {section === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Articles" value={news.length} icon="📰" accent="border-blue-600" />
                <StatCard label="Published" value={published} icon="✅" accent="border-green-600" />
                <StatCard label="Drafts" value={drafts} icon="📝" accent="border-yellow-600" />
                <StatCard label="Categories" value={categories.length} icon="🏷️" accent="border-purple-600" />
              </div>

              {/* Recent articles table */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="font-bold text-white text-sm">Recent Articles</h2>
                  <button
                    onClick={() => setSection("articles")}
                    className="text-red-400 hover:text-red-300 text-xs transition-colors"
                  >
                    View all →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {["Title", "Category", "Status", "Views", "Date"].map((h) => (
                          <th key={h} className="text-left px-6 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/70">
                      {news.slice(0, 6).map((article) => (
                        <tr key={article.id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="px-6 py-3.5 max-w-[220px]">
                            <p className="text-sm text-white font-medium truncate">{article.title}</p>
                          </td>
                          <td className="px-6 py-3.5 text-sm text-gray-400">
                            {article.category?.name || "—"}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              article.status === "published"
                                ? "bg-green-900/50 border border-green-700/40 text-green-400"
                                : "bg-yellow-900/50 border border-yellow-700/40 text-yellow-400"
                            }`}>
                              {article.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-sm text-gray-500">{article.view_count || 0}</td>
                          <td className="px-6 py-3.5 text-sm text-gray-500">
                            {new Date(article.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {news.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-14 text-center text-gray-600 text-sm">
                            No articles yet.{" "}
                            <button onClick={() => setSection("articles")} className="text-red-500 hover:text-red-400 underline">
                              Create your first one
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Categories quick view */}
              {categories.length > 0 && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h2 className="font-bold text-white text-sm mb-4">Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span key={cat.id} className="flex items-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                        🏷️ {cat.name}
                        <span className="text-gray-600">
                          {news.filter((n) => n.category?.name === cat.name).length}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ARTICLES ── */}
          {section === "articles" && (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Create form */}
              <div className="xl:col-span-2">
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden sticky top-0">
                  <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="font-bold text-white text-sm">New Article</h2>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Fill in all required fields
                    </p>
                  </div>
                  <form onSubmit={createNews} className="p-5 space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Title *
                      </label>
                      <input
                        type="text"
                        placeholder="Article headline..."
                        value={newsForm.title}
                        onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-white placeholder-gray-600 px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Summary
                      </label>
                      <input
                        type="text"
                        placeholder="Short description (optional)..."
                        value={newsForm.summary}
                        onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-white placeholder-gray-600 px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Content *
                      </label>
                      <textarea
                        placeholder="Write the full article here..."
                        value={newsForm.content}
                        onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                        rows={8}
                        className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-white placeholder-gray-600 px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all resize-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Category
                        </label>
                        <select
                          value={newsForm.category_id}
                          onChange={(e) => setNewsForm({ ...newsForm, category_id: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-white px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                        >
                          <option value="">None</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Status
                        </label>
                        <select
                          value={newsForm.status}
                          onChange={(e) => setNewsForm({ ...newsForm, status: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-white px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm transition-colors"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Publishing...
                        </span>
                      ) : (
                        "Publish Article"
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Articles table */}
              <div className="xl:col-span-3">
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="font-bold text-white text-sm">All Articles</h2>
                    <p className="text-gray-500 text-xs mt-0.5">{news.length} total · {published} published · {drafts} drafts</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left px-5 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">Title</th>
                          <th className="text-left px-5 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">Cat.</th>
                          <th className="text-left px-5 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">Status</th>
                          <th className="text-left px-5 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">Views</th>
                          <th className="text-left px-5 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/70">
                        {news.map((article) => (
                          <tr key={article.id} className="hover:bg-gray-800/40 transition-colors group">
                            <td className="px-5 py-3.5 max-w-[180px]">
                              <p className="text-sm text-white font-medium truncate">{article.title}</p>
                              <p className="text-[10px] text-gray-600 mt-0.5">
                                {new Date(article.created_at).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-gray-400">
                              {article.category?.name || "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                article.status === "published"
                                  ? "bg-green-900/50 border border-green-700/40 text-green-400"
                                  : "bg-yellow-900/50 border border-yellow-700/40 text-yellow-400"
                              }`}>
                                {article.status === "published" ? "Live" : "Draft"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-gray-500">
                              {article.view_count || 0}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                  href={`/news/${article.slug}`}
                                  target="_blank"
                                  className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                                >
                                  View
                                </Link>
                                <button
                                  onClick={() => deleteItem("news", article.id, "article")}
                                  className="text-red-500 hover:text-red-400 text-xs font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {news.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-gray-600 text-sm">
                              No articles yet. Create your first one using the form.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {section === "categories" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Form */}
              <div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="font-bold text-white text-sm">New Category</h2>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Categories organize your articles
                    </p>
                  </div>
                  <form onSubmit={createCategory} className="p-5 space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sports, Technology..."
                        value={catForm.name}
                        onChange={(e) => setCatForm({ name: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-white placeholder-gray-600 px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm transition-colors"
                    >
                      {submitting ? "Creating..." : "Create Category"}
                    </button>
                  </form>

                  <div className="px-5 pb-5">
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Suggested: Sports, Entertainment, Technology, Politics, Education
                    </p>
                  </div>
                </div>
              </div>

              {/* Categories list */}
              <div className="md:col-span-2">
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="font-bold text-white text-sm">All Categories</h2>
                    <p className="text-gray-500 text-xs mt-0.5">{categories.length} categories</p>
                  </div>
                  <div className="divide-y divide-gray-800/70">
                    {categories.map((cat) => {
                      const articleCount = news.filter(
                        (n) => n.category?.name === cat.name
                      ).length;
                      return (
                        <div
                          key={cat.id}
                          className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/40 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center justify-center text-sm">
                              🏷️
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{cat.name}</p>
                              <p className="text-gray-600 text-xs">/{cat.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500 text-xs bg-gray-800 px-2.5 py-1 rounded-full">
                              {articleCount} articles
                            </span>
                            <button
                              onClick={() => deleteItem("categories", cat.id, "category")}
                              className="text-red-500 hover:text-red-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {categories.length === 0 && (
                      <div className="px-6 py-16 text-center text-gray-600 text-sm">
                        No categories yet. Create some to organize your articles.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
