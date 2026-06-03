"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ENDPOINTS } from "@/config/api";
import logoSrc from "@/assets/images/logo.png";
import { saveUserSession } from "@/hooks/useAuth";
import { useTheme } from "@/app/components/ThemeProvider";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="fixed top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition"
    >
      {theme === "dark" ? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
      )}
    </button>
  );
}

function EyeIcon({ open }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      {open
        ? <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
        : <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
      }
    </svg>
  );
}

export default function LoginView() {
  const router = useRouter();
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(ENDPOINTS.auth.token, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Invalid credentials. Please try again.");
        return;
      }
      saveUserSession(data.access, form.username);
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error — make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-gray-950 flex">
      <ThemeToggle />

      {/* Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-950 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle at 1px 1px,white 1px,transparent 0)",backgroundSize:"32px 32px"}}/>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl"/>
        <div className="absolute top-20 left-0 w-72 h-72 bg-red-900/10 rounded-full blur-3xl"/>

        <Link href="/" className="relative z-10 inline-block">
          <div className="relative h-9 w-44">
            <Image src={logoSrc} alt="GenZ Flash News" fill sizes="176px" className="object-cover invert" style={{ objectPosition: "center 48%" }} priority />
          </div>
        </Link>

        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Welcome back<br/>to GenZFlash.
          </h1>
          <p className="text-gray-400 leading-relaxed max-w-sm mb-8">
            Sign in to access your personalised news feed and saved articles.
          </p>
          <div className="space-y-3">
            {["Real-time breaking news","Personalised category feed","Save articles for later","Cambodia-focused coverage"].map((f)=>(
              <div key={f} className="flex items-center gap-3 text-sm text-gray-300">
                <span className="w-5 h-5 rounded-full bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-bold flex items-center justify-center shrink-0">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-700">&copy; {new Date().getFullYear()} GenZFlash News</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/" className="inline-block">
            <div className="relative h-8 w-40">
              <Image src={logoSrc} alt="GenZ Flash News" fill sizes="160px" className="object-cover dark:invert" style={{ objectPosition: "center 48%" }} />
            </div>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Sign in to your account</h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">
            New to GenZFlash?{" "}
            <Link href="/register" className="text-red-500 hover:text-red-600 font-semibold transition-colors">Create a free account</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="username">
                Username
              </label>
              <input id="username" type="text" autoComplete="username" value={form.username} onChange={set("username")}
                placeholder="Enter your username"
                className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"/>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <input id="password" type={showPw ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={set("password")}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"/>
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  <EyeIcon open={showPw}/>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors mt-2">
              {loading
                ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in…</>
                : "Sign In"
              }
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 dark:text-gray-600">
            <Link href="/" className="hover:text-slate-700 dark:hover:text-gray-400 transition-colors">← Back to site</Link>
            <Link href="/admin/login" className="hover:text-slate-700 dark:hover:text-gray-400 transition-colors">Admin sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
