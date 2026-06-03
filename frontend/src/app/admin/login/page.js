"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ENDPOINTS } from "@/config/api";
import { saveAdminSession } from "@/hooks/useAuth";
import logoSrc from "@/assets/images/logo.png";

export default function AdminLogin() {
  const router = useRouter();
  const [form,     setForm]     = useState({ username: "", password: "" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPw,   setShowPw]   = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch(ENDPOINTS.auth.admin, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        const username = data.user?.username || form.username;
        saveAdminSession(data.access, username);
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.detail || "Access denied. Superadmin credentials required.");
      }
    } catch {
      setError("Network error — make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-gray-950">

      {/* Left branding panel (always dark hero) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 border-r border-gray-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(220,38,38,0.12)_0%,transparent_60%)]" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-red-700 via-red-500 to-red-700" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="relative h-9 w-44">
              <Image src={logoSrc} alt="GenZ Flash News" fill sizes="176px" className="object-cover invert" style={{ objectPosition: "center 48%" }} priority />
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.25em] font-semibold">Admin CMS</span>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Content Management System</h2>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed">
            Manage articles, categories and keep Cambodia informed.
          </p>

          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { label: "Publish Articles" },
              { label: "Manage Categories" },
              { label: "Track View Counts" },
              { label: "JWT Secured Auth" },
              { label: "Draft & Publish" },
              { label: "Soft Delete" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2.5 bg-gray-800/60 rounded-lg px-3 py-2.5">
                <span className="w-4 h-4 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                </span>
                <span className="text-gray-300 text-xs font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-2 mb-10 lg:hidden">
            <div className="relative h-8 w-40">
              <Image src={logoSrc} alt="GenZ Flash News" fill sizes="160px" className="object-cover dark:invert" style={{ objectPosition: "center 48%" }} priority />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] font-semibold">Admin</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Admin Sign In</h1>
            <p className="text-slate-500 dark:text-gray-500 mt-1.5 text-sm">Superadmin credentials required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-950/60 border border-red-800/60 rounded-xl">
                <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <p className="text-red-300 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2" htmlFor="username">Username</label>
              <input id="username" type="text" autoComplete="username"
                value={form.username} onChange={set("username")}
                placeholder="Admin username"
                className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 px-4 py-3 rounded-xl text-sm transition-all outline-none"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPw ? "text" : "password"} autoComplete="current-password"
                  value={form.password} onChange={set("password")}
                  placeholder="Admin password"
                  className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 px-4 py-3 pr-14 rounded-xl text-sm transition-all outline-none"/>
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 text-xs font-medium transition-colors">
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all mt-2 shadow-lg shadow-red-900/30">
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Signing in…
                </span>
              ) : "Sign In to Admin"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-sm text-slate-400 dark:text-gray-600">
            <Link href="/" className="hover:text-slate-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1">← Back to site</Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-slate-600 dark:hover:text-gray-400 transition-colors">User login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
