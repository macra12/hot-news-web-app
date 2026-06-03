"use client";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import Icon from "../components/AdminIcons";
import EChart from "../components/EChart";
import { useTheme } from "../components/ThemeProvider";
import logoSrc from "@/assets/images/logo.png";
import { API_BASE } from "@/config/api";

const EMPTY_NEWS = { title: "", summary: "", content: "", status: "draft", category_id: "" };
const EMPTY_CAT = { name: "", description: "", icon: "" };
const EMPTY_SOURCE = { name: "", website: "", api_endpoint: "", is_external: true, is_active: true };
const EMPTY_USER = { username: "", email: "", first_name: "", last_name: "", password: "", role: "reporter" };

// ── Shared theme-aware class tokens (light + dark) ────────────────────────────
const CARD = "rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900";
const CARD_HEAD = "px-6 py-4 border-b border-slate-200 dark:border-gray-800";
const TH = "text-left py-3 text-slate-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider";
const ROW = "hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-colors";
const DIVIDE = "divide-y divide-slate-200 dark:divide-gray-800/70";
const TITLE = "font-semibold text-slate-900 dark:text-white text-sm";
const SUB = "text-slate-500 dark:text-gray-500 text-xs mt-0.5";
const MUTED = "text-slate-500 dark:text-gray-500";
const FAINT = "text-slate-400 dark:text-gray-600";
const BTN = "bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:bg-slate-200 dark:disabled:bg-gray-800 disabled:text-slate-400 dark:disabled:text-gray-600 text-white font-semibold rounded-lg text-sm transition-colors";
const CHIP = "text-slate-500 dark:text-gray-500 text-xs bg-slate-100 dark:bg-gray-800 px-2.5 py-1 rounded-full tabular-nums";

const STATUS_STYLES = {
  published: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
  draft:     "bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400",
  archived:  "bg-slate-200/70 dark:bg-gray-700/40 border border-slate-300 dark:border-gray-600/50 text-slate-500 dark:text-gray-400",
};

const ROLE_STYLES = {
  admin:    "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400",
  reporter: "bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400",
  reader:   "bg-slate-200/70 dark:bg-gray-700/40 border border-slate-300 dark:border-gray-600/50 text-slate-500 dark:text-gray-400",
};

const inputCls =
  "w-full bg-white dark:bg-gray-950/60 border border-slate-300 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all";
const labelCls = "block text-[11px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = memo(function Toast({ toast }) {
  if (!toast) return null;
  const error = toast.type === "error";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium ${
        error
          ? "bg-red-50 dark:bg-red-950/90 border-red-300 dark:border-red-800 text-red-700 dark:text-red-200"
          : "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200"
      }`}
    >
      <Icon name={error ? "close" : "check"} className="w-4 h-4 shrink-0" />
      {toast.msg}
    </div>
  );
});

// ── Stat card ───────────────────────────────────────────────────────────────
const StatCard = memo(function StatCard({ label, value, icon, accent }) {
  return (
    <div className={`group ${CARD} p-5 transition-colors hover:border-slate-300 dark:hover:border-gray-700`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 dark:text-gray-500 text-[11px] font-semibold uppercase tracking-wider">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
          <Icon name={icon} className="w-4 h-4" />
        </span>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</p>
    </div>
  );
});

// ── ECharts option builders ───────────────────────────────────────────────────
const CHART_COLORS = ["#ef4444", "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6"];
const SENS_COLORS = ["#ef4444", "#f59e0b", "#94a3b8"];

function pieOption(data, dark, colors = CHART_COLORS) {
  const text = dark ? "#cbd5e1" : "#334155";
  return {
    color: colors,
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, type: "scroll", textStyle: { color: text }, itemWidth: 12, itemHeight: 12 },
    series: [{
      type: "pie",
      radius: ["46%", "72%"],
      center: ["50%", "44%"],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: dark ? "#111827" : "#ffffff", borderWidth: 2 },
      label: { color: text, fontSize: 11, formatter: "{b}\n{d}%" },
      labelLine: { length: 6, length2: 8 },
      data: (data || []).filter((d) => d.count > 0).map((d) => ({ name: d.name, value: d.count })),
    }],
  };
}

function barOption(data, dark) {
  const text = dark ? "#cbd5e1" : "#334155";
  const grid = dark ? "#1f2937" : "#e2e8f0";
  const d = (data || []).slice().reverse();
  return {
    grid: { left: 8, right: 30, top: 8, bottom: 4, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: { type: "value", axisLine: { show: false }, splitLine: { lineStyle: { color: grid } }, axisLabel: { color: text } },
    yAxis: { type: "category", data: d.map((x) => x.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: text } },
    series: [{ type: "bar", data: d.map((x) => x.count), barWidth: "55%", itemStyle: { color: "#ef4444", borderRadius: [0, 4, 4, 0] }, label: { show: true, position: "right", color: text } }],
  };
}

// ── Sidebar (top-level so it never remounts on parent re-render) ──────────────
const Sidebar = memo(function Sidebar({ nav, section, onSelect, onLogout }) {
  return (
    <>
      <div className="p-5 border-b border-slate-200 dark:border-gray-800">
        <Link href="/" className="block">
          <div className="relative h-7 w-36">
            <Image src={logoSrc} alt="GenZ Flash News" fill sizes="144px" className="object-cover object-left dark:invert" style={{ objectPosition: "left 48%" }} priority />
          </div>
        </Link>
        <p className={`${FAINT} text-[10px] tracking-[0.25em] uppercase mt-2`}>Admin Console</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className={`${FAINT} text-[10px] font-bold uppercase tracking-widest px-3 py-2`}>Manage</p>
        {nav.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-red-600 text-white shadow-sm shadow-red-900/30"
                  : "text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon name={item.icon} className="w-4.5 h-4.5" />
                {item.label}
              </span>
              {item.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-md tabular-nums ${active ? "bg-red-700/60 text-red-100" : "bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-500"}`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-gray-800 space-y-0.5">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 dark:text-gray-400 transition-colors hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white">
          <Icon name="home" className="w-4.5 h-4.5" /> View Site
        </Link>
        <button onClick={onLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 dark:text-gray-400 transition-colors hover:bg-slate-100 dark:hover:bg-gray-800/70 hover:text-red-500 dark:hover:text-red-400">
          <Icon name="logout" className="w-4.5 h-4.5" /> Logout
        </button>
      </div>
    </>
  );
});

export default function AdminDashboard() {
  const [section, setSection] = useState("dashboard");
  const [news, setNews] = useState([]);
  const [articlesPage, setArticlesPage] = useState(1);
  const [articlesMeta, setArticlesMeta] = useState({ count: 0, next: null, previous: null });
  const PAGE_SIZE = 20;
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const [newsForm, setNewsForm] = useState(EMPTY_NEWS);
  const [newsImage, setNewsImage] = useState(null);
  const [editingNews, setEditingNews] = useState(null);

  const [catForm, setCatForm] = useState(EMPTY_CAT);
  const [editingCat, setEditingCat] = useState(null);

  const [sourceForm, setSourceForm] = useState(EMPTY_SOURCE);
  const [userForm, setUserForm] = useState(EMPTY_USER);

  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const authHeaders = useCallback((tk) => ({ Authorization: `Bearer ${tk || token}` }), [token]);

  const fetchData = useCallback(
    async (tk, page = 1) => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${tk}` };
        const [nRes, cRes, sRes, uRes, stRes] = await Promise.all([
          fetch(`${API_BASE}/news/?page=${page}&page_size=${PAGE_SIZE}`, { headers }),
          fetch(`${API_BASE}/categories/`, { headers }),
          fetch(`${API_BASE}/sources/`, { headers }),
          fetch(`${API_BASE}/admin/users/`, { headers }),
          fetch(`${API_BASE}/admin/stats/`, { headers }),
        ]);
        if (nRes.status === 401) {
          localStorage.removeItem("token");
          router.push("/admin/login");
          return;
        }
        const unwrap = async (res) => {
          const d = await res.json().catch(() => []);
          return Array.isArray(d) ? d : Array.isArray(d.results) ? d.results : [];
        };
        const nData = await nRes.json().catch(() => ({}));
        setNews(Array.isArray(nData) ? nData : nData.results || []);
        setArticlesMeta({ count: nData.count ?? 0, next: nData.next ?? null, previous: nData.previous ?? null });
        setArticlesPage(page);
        setCategories(await unwrap(cRes));
        setSources(await unwrap(sRes));
        setUsers(uRes.ok ? await unwrap(uRes) : []);
        setStats(stRes.ok ? await stRes.json().catch(() => null) : null);
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

  // ── Articles ──────────────────────────────────────────────────────────────
  const resetNewsForm = () => { setNewsForm(EMPTY_NEWS); setNewsImage(null); setEditingNews(null); };

  const submitNews = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", newsForm.title);
      payload.append("summary", newsForm.summary || "");
      payload.append("content", newsForm.content);
      payload.append("status", newsForm.status);
      payload.append("category_id", newsForm.category_id || "");
      if (newsImage) payload.append("image", newsImage);

      const editing = Boolean(editingNews);
      const res = await fetch(
        editing ? `${API_BASE}/news/${editingNews}/` : `${API_BASE}/news/`,
        { method: editing ? "PATCH" : "POST", headers: authHeaders(), body: payload }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(Object.values(err).flat().join(" ") || "Failed to save article", "error");
      } else {
        showToast(editing ? "Article updated" : "Article created");
        resetNewsForm();
        fetchData(token, articlesPage);
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const editNews = (a) => {
    setEditingNews(a.slug);
    setNewsForm({
      title: a.title || "",
      summary: a.summary || "",
      content: a.content || "",
      status: a.status || "draft",
      category_id: a.category?.id || "",
    });
    setNewsImage(null);
    setSection("articles");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeNewsStatus = async (a, status) => {
    try {
      const res = await fetch(`${API_BASE}/news/${a.slug}/`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { showToast("Failed to update status", "error"); return; }
      showToast(`Article ${status}`);
      fetchData(token, articlesPage);
    } catch { showToast("Network error", "error"); }
  };

  // ── Categories ──────────────────────────────────────────────────────────────
  const resetCatForm = () => { setCatForm(EMPTY_CAT); setEditingCat(null); };

  const submitCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const editing = Boolean(editingCat);
      const res = await fetch(
        editing ? `${API_BASE}/categories/${editingCat}/` : `${API_BASE}/categories/`,
        {
          method: editing ? "PATCH" : "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(Object.values(err).flat().join(" ") || "Failed to save category", "error");
      } else {
        showToast(editing ? "Category updated" : "Category created");
        resetCatForm();
        fetchData(token, articlesPage);
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const editCategory = (c) => {
    setEditingCat(c.id);
    setCatForm({ name: c.name || "", description: c.description || "", icon: c.icon || "" });
  };

  // ── Sources ──────────────────────────────────────────────────────────────────
  const submitSource = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/sources/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(sourceForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(Object.values(err).flat().join(" ") || "Failed to add source", "error");
      } else {
        showToast("Source added");
        setSourceForm(EMPTY_SOURCE);
        fetchData(token, articlesPage);
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSourceActive = async (s) => {
    try {
      const res = await fetch(`${API_BASE}/sources/${s.id}/`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !s.is_active }),
      });
      if (!res.ok) { showToast("Failed to update source", "error"); return; }
      fetchData(token, articlesPage);
    } catch { showToast("Network error", "error"); }
  };

  const runImport = async () => {
    setImporting(true);
    showToast("Importing news from active sources…");
    try {
      const res = await fetch(`${API_BASE}/admin/import-news/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 20 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { showToast(data.detail || "Import failed", "error"); return; }
      showToast(`Imported ${data.imported ?? 0} new articles`);
      fetchData(token, articlesPage);
    } catch {
      showToast("Network error during import", "error");
    } finally {
      setImporting(false);
    }
  };

  // ── Users ─────────────────────────────────────────────────────────────────────
  const submitUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(Object.values(err).flat().join(" ") || "Failed to create user", "error");
      } else {
        showToast("User created");
        setUserForm(EMPTY_USER);
        fetchData(token, articlesPage);
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const changeUserRole = async (u, role) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${u.id}/`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(Object.values(err).flat().join(" ") || "Failed to update role", "error");
        return;
      }
      showToast("Role updated");
      fetchData(token, articlesPage);
    } catch { showToast("Network error", "error"); }
  };

  // News uses slug, others use id.
  const deleteItem = async (endpoint, identifier, label) => {
    if (!confirm(`Delete this ${label}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${identifier}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || `Failed to delete ${label}`, "error");
        return;
      }
      showToast(`${label} deleted`);
      fetchData(token, articlesPage);
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  }, [router]);

  const onSelect = useCallback((id) => { setSection(id); setSidebarOpen(false); }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const published = stats?.published ?? news.filter((n) => n.status === "published").length;
  const drafts    = stats?.drafts ?? news.filter((n) => n.status === "draft").length;
  const archived  = stats?.archived ?? news.filter((n) => n.status === "archived").length;
  const totalViews = stats?.total_views ?? news.reduce((s, n) => s + (n.view_count || 0), 0);

  const NAV = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: "dashboard" },
      { id: "articles", label: "Articles", icon: "article", count: news.length },
      { id: "categories", label: "Categories", icon: "tag", count: categories.length },
      { id: "sources", label: "Sources", icon: "globe", count: sources.length },
      { id: "users", label: "Users", icon: "users", count: users.length },
    ],
    [news.length, categories.length, sources.length, users.length]
  );

  const sectionTitle = useMemo(() => {
    const map = { dashboard: "Dashboard", articles: "Articles", categories: "Categories", sources: "News Sources", users: "Users & Admins" };
    return map[section] || "Dashboard";
  }, [section]);

  const todayLabel = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    []
  );

  // ── Chart options (theme-aware) ──────────────────────────────────────────────
  const { theme } = useTheme();
  const dark = theme === "dark";
  const catOption  = useMemo(() => pieOption(stats?.category_breakdown, dark), [stats, dark]);
  const srcOption  = useMemo(() => barOption(stats?.source_breakdown, dark), [stats, dark]);
  const typeOption = useMemo(
    () => pieOption((stats?.type_breakdown || []).map((t) => ({ name: t.type, count: t.count })), dark),
    [stats, dark]
  );
  const sensOption = useMemo(
    () => pieOption([
      { name: "High",   count: stats?.sensitivity?.high   || 0 },
      { name: "Medium", count: stats?.sensitivity?.medium || 0 },
      { name: "None",   count: stats?.sensitivity?.none   || 0 },
    ], dark, SENS_COLORS),
    [stats, dark]
  );

  if (!token || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="flex gap-1.5 justify-center mb-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2.5 h-2.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className={`${FAINT} text-sm`}>Loading admin console…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 flex-col shrink-0">
        <Sidebar nav={NAV} section={section} onSelect={onSelect} onLogout={logout} />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 flex flex-col z-10">
            <Sidebar nav={NAV} section={section} onSelect={onSelect} onLogout={logout} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={sectionTitle} subtitle={todayLabel} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto p-6">
          {/* ── DASHBOARD ── */}
          {section === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Articles" value={stats?.total_articles ?? news.length} icon="article" accent="bg-sky-500/10 text-sky-500" />
                <StatCard label="Fresh · 24h" value={stats?.recent_24h ?? 0} icon="trend" accent="bg-red-500/10 text-red-500" />
                <StatCard label="Fresh · 7 days" value={stats?.recent_7d ?? 0} icon="trend" accent="bg-emerald-500/10 text-emerald-500" />
                <StatCard label="Total Views" value={totalViews} icon="eye" accent="bg-cyan-500/10 text-cyan-500" />
                <StatCard label="Published" value={published} icon="checkCircle" accent="bg-emerald-500/10 text-emerald-500" />
                <StatCard label="Drafts" value={drafts} icon="pencil" accent="bg-amber-500/10 text-amber-500" />
                <StatCard label="Sensitive" value={stats?.sensitive_count ?? 0} icon="archive" accent="bg-orange-500/10 text-orange-500" />
                <StatCard label="Categories" value={categories.length} icon="tag" accent="bg-violet-500/10 text-violet-500" />
              </div>

              {/* Analytics: distributions (ECharts donut + bar) */}
              {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`${CARD} p-6`}>
                    <h2 className={`${TITLE} mb-2`}>Articles by Category</h2>
                    <EChart option={catOption} height={300} />
                  </div>
                  <div className={`${CARD} p-6`}>
                    <h2 className={`${TITLE} mb-2`}>Top Sources</h2>
                    <EChart option={srcOption} height={300} />
                  </div>
                </div>
              )}

              {/* Analytics: auto-classification (content type + sensitivity) */}
              {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`${CARD} p-6`}>
                    <h2 className={`${TITLE} mb-2`}>Content Type (auto-classified)</h2>
                    <EChart option={typeOption} height={300} />
                  </div>
                  <div className={`${CARD} p-6`}>
                    <h2 className={TITLE}>Content Sensitivity</h2>
                    <p className={`${SUB} mb-1`}>Auto-classified — review high-sensitivity stories.</p>
                    <EChart option={sensOption} height={240} />
                    {stats.sensitive_examples?.length > 0 && (
                      <div className="border-t border-slate-200 dark:border-gray-800 mt-3 pt-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-red-500 mb-2">Flagged for review</p>
                        <ul className="space-y-1.5">
                          {stats.sensitive_examples.map((e) => (
                            <li key={e.slug} className="flex items-start gap-2 text-sm">
                              <Icon name="archive" className="w-3.5 h-3.5 mt-0.5 text-red-500 shrink-0" />
                              <Link href={`/news/${e.slug}`} target="_blank" className="text-slate-600 dark:text-gray-300 hover:text-red-500 line-clamp-1">{e.title}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {stats?.top_articles?.length > 0 && (
                <div className={`${CARD} p-6`}>
                  <h2 className={`flex items-center gap-2 ${TITLE} mb-4`}>
                    <Icon name="trend" className="w-4 h-4 text-red-500" /> Most Viewed
                  </h2>
                  <div className="space-y-1">
                    {stats.top_articles.map((a, i) => (
                      <div key={a.id} className="flex items-center gap-3 text-sm py-1.5">
                        <span className={`${FAINT} font-bold w-5 tabular-nums`}>{i + 1}</span>
                        <Link href={`/news/${a.slug}`} target="_blank" className="text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white truncate flex-1">{a.title}</Link>
                        <span className={`${MUTED} text-xs tabular-nums`}>{a.view_count} views</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`${CARD} overflow-hidden`}>
                <div className={`${CARD_HEAD} flex items-center justify-between`}>
                  <h2 className={TITLE}>Recent Articles</h2>
                  <button onClick={() => setSection("articles")} className="text-red-500 hover:text-red-400 text-xs font-medium transition-colors">View all →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-gray-800">
                        {["Title", "Category", "Status", "Views", "Date"].map((h) => (
                          <th key={h} className={`${TH} px-6`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={DIVIDE}>
                      {news.slice(0, 6).map((article) => (
                        <tr key={article.id} className={ROW}>
                          <td className="px-6 py-3.5 max-w-55"><p className="text-sm text-slate-900 dark:text-white font-medium truncate">{article.title}</p></td>
                          <td className="px-6 py-3.5 text-sm text-slate-600 dark:text-gray-400">{article.category?.name || "—"}</td>
                          <td className="px-6 py-3.5"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[article.status] || STATUS_STYLES.draft}`}>{article.status}</span></td>
                          <td className={`px-6 py-3.5 text-sm ${MUTED} tabular-nums`}>{article.view_count || 0}</td>
                          <td className={`px-6 py-3.5 text-sm ${MUTED}`}>{new Date(article.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {news.length === 0 && (
                        <tr><td colSpan={5} className={`px-6 py-14 text-center ${FAINT} text-sm`}>No articles yet. <button onClick={() => setSection("articles")} className="text-red-500 hover:text-red-400 underline">Create your first one</button></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ARTICLES ── */}
          {section === "articles" && (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-2">
                <div className={`${CARD} overflow-hidden sticky top-0`}>
                  <div className={`${CARD_HEAD} flex items-center justify-between`}>
                    <div>
                      <h2 className={TITLE}>{editingNews ? "Edit Article" : "New Article"}</h2>
                      <p className={SUB}>{editingNews ? "Update and save changes" : "Fill in the required fields"}</p>
                    </div>
                    {editingNews && <button onClick={resetNewsForm} className={`${MUTED} hover:text-slate-900 dark:hover:text-white text-xs font-medium`}>Cancel</button>}
                  </div>
                  <form onSubmit={submitNews} className="p-5 space-y-4">
                    <div><label className={labelCls}>Title *</label><input type="text" placeholder="Article headline" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} className={inputCls} required /></div>
                    <div><label className={labelCls}>Summary</label><input type="text" placeholder="Short description" value={newsForm.summary} onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })} className={inputCls} /></div>
                    <div><label className={labelCls}>Content *</label><textarea placeholder="Write the full article…" value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} rows={8} className={`${inputCls} resize-none`} required /></div>
                    <div><label className={labelCls}>Image {editingNews && <span className={`${FAINT} normal-case`}>(leave empty to keep current)</span>}</label><input type="file" accept="image/*" onChange={(e) => setNewsImage(e.target.files?.[0] || null)} className={`${inputCls} file:mr-3 file:px-3 file:py-1.5 file:border-0 file:rounded file:bg-red-600 file:text-white file:text-xs file:font-semibold`} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Category</label>
                        <select value={newsForm.category_id} onChange={(e) => setNewsForm({ ...newsForm, category_id: e.target.value })} className={inputCls}>
                          <option value="">None</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Status</label>
                        <select value={newsForm.status} onChange={(e) => setNewsForm({ ...newsForm, status: e.target.value })} className={inputCls}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" disabled={submitting} className={`w-full py-3 ${BTN}`}>
                      {submitting ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span> : editingNews ? "Save Changes" : "Publish Article"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="xl:col-span-3">
                <div className={`${CARD} overflow-hidden`}>
                  <div className={CARD_HEAD}>
                    <h2 className={TITLE}>All Articles</h2>
                    <p className={SUB}>{stats?.total_articles ?? articlesMeta.count} total · {published} published · {drafts} drafts · {archived} archived</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-gray-800">
                          <th className={`${TH} px-5`}>Title</th>
                          <th className={`${TH} px-5`}>Cat.</th>
                          <th className={`${TH} px-5`}>Status</th>
                          <th className={`${TH} px-5`}>Views</th>
                          <th className={`${TH} px-5 text-right`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className={DIVIDE}>
                        {news.map((article) => (
                          <tr key={article.id} className={ROW}>
                            <td className="px-5 py-3.5 max-w-45">
                              <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{article.title}</p>
                              <p className={`text-[10px] ${FAINT} mt-0.5`}>{new Date(article.created_at).toLocaleDateString()}</p>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-gray-400">{article.category?.name || "—"}</td>
                            <td className="px-5 py-3.5">
                              <select value={article.status} onChange={(e) => changeNewsStatus(article, e.target.value)}
                                title="Change status — only 'Published' is visible to readers"
                                className={`text-xs font-semibold px-2 py-1 rounded-md outline-none cursor-pointer ${STATUS_STYLES[article.status] || STATUS_STYLES.draft}`}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                              </select>
                            </td>
                            <td className={`px-5 py-3.5 text-xs ${MUTED} tabular-nums`}>{article.view_count || 0}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-1">
                                <Link href={`/news/${article.slug}`} target="_blank" title="View on site" aria-label="View"
                                  className="p-1.5 rounded-md text-sky-500 hover:bg-sky-500/10 transition-colors"><Icon name="eye" className="w-4 h-4" /></Link>
                                <button onClick={() => editNews(article)} title="Edit" aria-label="Edit"
                                  className="p-1.5 rounded-md text-amber-500 hover:bg-amber-500/10 transition-colors"><Icon name="pencil" className="w-4 h-4" /></button>
                                <button onClick={() => deleteItem("news", article.slug, "article")} title="Delete" aria-label="Delete"
                                  className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"><Icon name="trash" className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {news.length === 0 && <tr><td colSpan={5} className={`px-6 py-16 text-center ${FAINT} text-sm`}>No articles on this page.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination — lets the admin manage ALL articles, not just the first 20 */}
                  {articlesMeta.count > PAGE_SIZE && (
                    <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 dark:border-gray-800">
                      <span className={SUB}>
                        {(articlesPage - 1) * PAGE_SIZE + 1}–{Math.min(articlesPage * PAGE_SIZE, articlesMeta.count)} of {articlesMeta.count}
                      </span>
                      <div className="flex items-center gap-2">
                        <button disabled={!articlesMeta.previous} onClick={() => fetchData(token, articlesPage - 1)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Prev</button>
                        <span className={`${MUTED} text-xs tabular-nums px-1`}>Page {articlesPage}</span>
                        <button disabled={!articlesMeta.next} onClick={() => fetchData(token, articlesPage + 1)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {section === "categories" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className={`${CARD} overflow-hidden`}>
                  <div className={`${CARD_HEAD} flex items-center justify-between`}>
                    <div>
                      <h2 className={TITLE}>{editingCat ? "Edit Category" : "New Category"}</h2>
                      <p className={SUB}>Organise your articles</p>
                    </div>
                    {editingCat && <button onClick={resetCatForm} className={`${MUTED} hover:text-slate-900 dark:hover:text-white text-xs font-medium`}>Cancel</button>}
                  </div>
                  <form onSubmit={submitCategory} className="p-5 space-y-4">
                    <div><label className={labelCls}>Category Name *</label><input type="text" placeholder="e.g. Technology" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className={inputCls} required /></div>
                    <div><label className={labelCls}>Icon (emoji)</label><input type="text" placeholder="Optional" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} className={inputCls} /></div>
                    <div><label className={labelCls}>Description</label><input type="text" placeholder="Optional" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className={inputCls} /></div>
                    <button type="submit" disabled={submitting} className={`w-full py-3 ${BTN}`}>{submitting ? "Saving…" : editingCat ? "Save Changes" : "Create Category"}</button>
                  </form>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className={`${CARD} overflow-hidden`}>
                  <div className={CARD_HEAD}>
                    <h2 className={TITLE}>All Categories</h2>
                    <p className={SUB}>{categories.length} categories</p>
                  </div>
                  <div className={DIVIDE}>
                    {categories.map((cat) => (
                      <div key={cat.id} className={`px-6 py-4 flex items-center justify-between ${ROW} group`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center text-sm">{cat.icon || <Icon name="tag" className="w-4 h-4 text-slate-400 dark:text-gray-500" />}</div>
                          <div>
                            <p className="text-slate-900 dark:text-white font-medium text-sm">{cat.name}</p>
                            <p className={`${FAINT} text-xs`}>/{cat.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={CHIP}>{cat.article_count ?? 0} articles</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => editCategory(cat)} title="Edit" aria-label="Edit" className="p-1.5 rounded-md text-amber-500 hover:bg-amber-500/10 transition-colors"><Icon name="pencil" className="w-4 h-4" /></button>
                            <button onClick={() => deleteItem("categories", cat.id, "category")} title="Delete" aria-label="Delete" className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"><Icon name="trash" className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {categories.length === 0 && <div className={`px-6 py-16 text-center ${FAINT} text-sm`}>No categories yet.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SOURCES ── */}
          {section === "sources" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className={`${CARD} overflow-hidden`}>
                  <div className={CARD_HEAD}>
                    <h2 className={TITLE}>New Source</h2>
                    <p className={SUB}>External / public-API providers</p>
                  </div>
                  <form onSubmit={submitSource} className="p-5 space-y-4">
                    <div><label className={labelCls}>Source Name *</label><input type="text" placeholder="e.g. BBC, GNews API" value={sourceForm.name} onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })} className={inputCls} required /></div>
                    <div><label className={labelCls}>Website</label><input type="url" placeholder="https://…" value={sourceForm.website} onChange={(e) => setSourceForm({ ...sourceForm, website: e.target.value })} className={inputCls} /></div>
                    <div><label className={labelCls}>Feed / API URL</label><input type="url" placeholder="https://…/rss.xml" value={sourceForm.api_endpoint} onChange={(e) => setSourceForm({ ...sourceForm, api_endpoint: e.target.value })} className={inputCls} /></div>
                    <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-gray-300"><input type="checkbox" checked={sourceForm.is_external} onChange={(e) => setSourceForm({ ...sourceForm, is_external: e.target.checked })} className="accent-red-600 w-4 h-4" />External source (imported via feed)</label>
                    <button type="submit" disabled={submitting} className={`w-full py-3 ${BTN}`}>{submitting ? "Saving…" : "Add Source"}</button>
                  </form>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className={`${CARD} overflow-hidden`}>
                  <div className={`${CARD_HEAD} flex items-center justify-between gap-3`}>
                    <div>
                      <h2 className={TITLE}>All Sources</h2>
                      <p className={SUB}>{sources.length} sources</p>
                    </div>
                    <button onClick={runImport} disabled={importing} className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs ${BTN}`}>
                      {importing ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importing…</> : <><Icon name="download" className="w-4 h-4" />Import News</>}
                    </button>
                  </div>
                  <div className={DIVIDE}>
                    {sources.map((s) => (
                      <div key={s.id} className={`px-6 py-4 flex items-center justify-between ${ROW} group`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center shrink-0"><Icon name="globe" className="w-4 h-4 text-slate-400 dark:text-gray-400" /></div>
                          <div className="min-w-0">
                            <p className="text-slate-900 dark:text-white font-medium text-sm truncate">{s.name}</p>
                            <p className={`${FAINT} text-xs truncate`}>{s.website || s.api_endpoint || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className={CHIP}>{s.article_count ?? 0} articles</span>
                          <button onClick={() => toggleSourceActive(s)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.is_active ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-500"}`}>{s.is_active ? "Active" : "Inactive"}</button>
                          <button onClick={() => deleteItem("sources", s.id, "source")} title="Delete" aria-label="Delete" className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"><Icon name="trash" className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                    {sources.length === 0 && <div className={`px-6 py-16 text-center ${FAINT} text-sm`}>No sources yet.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {section === "users" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className={`${CARD} overflow-hidden`}>
                  <div className={CARD_HEAD}>
                    <h2 className={TITLE}>New Reporter / Admin</h2>
                    <p className={SUB}>Staff accounts can manage news</p>
                  </div>
                  <form onSubmit={submitUser} className="p-5 space-y-4">
                    <div><label className={labelCls}>Username *</label><input type="text" placeholder="reporter_name" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} className={inputCls} required /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelCls}>First Name</label><input type="text" value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} className={inputCls} /></div>
                      <div><label className={labelCls}>Last Name</label><input type="text" value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} className={inputCls} /></div>
                    </div>
                    <div><label className={labelCls}>Email</label><input type="email" placeholder="name@example.com" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className={inputCls} /></div>
                    <div><label className={labelCls}>Password *</label><input type="password" placeholder="Min. 8 characters" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className={inputCls} required minLength={8} /></div>
                    <div>
                      <label className={labelCls}>Role</label>
                      <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className={inputCls}>
                        <option value="reporter">Reporter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button type="submit" disabled={submitting} className={`w-full py-3 ${BTN}`}>{submitting ? "Creating…" : "Create Account"}</button>
                  </form>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className={`${CARD} overflow-hidden`}>
                  <div className={CARD_HEAD}>
                    <h2 className={TITLE}>All Users</h2>
                    <p className={SUB}>{users.length} accounts</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-gray-800">
                          <th className={`${TH} px-5`}>User</th>
                          <th className={`${TH} px-5`}>Role</th>
                          <th className={`${TH} px-5`}>Articles</th>
                          <th className={`${TH} px-5 text-right`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className={DIVIDE}>
                        {users.map((u) => (
                          <tr key={u.id} className={ROW}>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center shrink-0 uppercase">{(u.username || "?")[0]}</span>
                                <div>
                                  <p className="text-sm text-slate-900 dark:text-white font-medium">{u.username}{!u.is_active && <span className="ml-2 text-[10px] text-red-500">(inactive)</span>}</p>
                                  <p className={`text-[11px] ${FAINT}`}>{u.email || "no email"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <select value={u.role || "reader"} onChange={(e) => changeUserRole(u, e.target.value)} className={`text-xs font-semibold px-2 py-1 rounded-md outline-none cursor-pointer ${ROLE_STYLES[u.role] || ROLE_STYLES.reader}`}>
                                <option value="reader">Reader</option>
                                <option value="reporter">Reporter</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className={`px-5 py-3.5 text-xs ${MUTED} tabular-nums`}>{u.article_count ?? 0}</td>
                            <td className="px-5 py-3.5 text-right"><button onClick={() => deleteItem("admin/users", u.id, "user")} title="Delete" aria-label="Delete" className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"><Icon name="trash" className="w-4 h-4" /></button></td>
                          </tr>
                        ))}
                        {users.length === 0 && <tr><td colSpan={4} className={`px-6 py-16 text-center ${FAINT} text-sm`}>No users found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <AdminFooter />
      </div>

      <Toast toast={toast} />
    </div>
  );
}
