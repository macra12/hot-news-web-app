"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ENDPOINTS } from "@/config/api";
import { saveUserSession } from "@/hooks/useAuth";
import logoSrc from "@/assets/images/logo.png";
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

export default function RegisterView() {
  const router = useRouter();
  const [form,    setForm]    = useState({ name: "", username: "", email: "", password: "", confirm: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setFieldErrors((p) => ({ ...p, [k]: "" })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setFieldErrors({});

    if (!form.name.trim())     return setError("Full name is required.");
    if (!form.username.trim()) return setError("Username is required.");
    if (!form.email.trim())    return setError("Email address is required.");
    if (!form.password)        return setError("Password is required.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const [firstName, ...rest] = form.name.trim().split(" ");
      const res  = await fetch(ENDPOINTS.auth.register, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username:   form.username.trim(),
          email:      form.email.trim(),
          password:   form.password,
          first_name: firstName,
          last_name:  rest.join(" "),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Surface field-level errors from DRF
        if (typeof data === "object" && !data.detail) {
          setFieldErrors(data);
          setError("Please fix the errors below.");
        } else {
          setError(data.detail || "Registration failed. Please try again.");
        }
        return;
      }

      // Auto sign-in after registration
      const loginRes = await fetch(ENDPOINTS.auth.token, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: form.username.trim(), password: form.password }),
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        saveUserSession(loginData.access, form.username.trim());
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
      } else {
        setSuccess(true); // Registration worked; sign in separately
      }
    } catch {
      setError("Network error — make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (key) =>
    `w-full rounded-xl border ${fieldErrors[key] ? "border-red-400 dark:border-red-600" : "border-slate-200 dark:border-gray-700"} bg-white dark:bg-gray-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`;

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-gray-950 flex">
      <ThemeToggle />

      {/* Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-950 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle at 1px 1px,white 1px,transparent 0)",backgroundSize:"32px 32px"}}/>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl"/>

        <Link href="/" className="relative z-10 inline-block">
          <div className="relative h-9 w-44">
            <Image src={logoSrc} alt="GenZ Flash News" fill sizes="176px" className="object-cover invert" style={{ objectPosition: "center 48%" }} priority />
          </div>
        </Link>

        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight mb-4">Join the next<br/>generation of<br/>readers.</h1>
          <p className="text-gray-400 leading-relaxed max-w-sm mb-8">Create your free GenZFlash account to personalise your news feed and stay ahead of every story.</p>
          <div className="space-y-3">
            {["Personalised news feed","Save articles for later","Breaking alerts by category","Cambodia-focused coverage","No ads — ever"].map((f)=>(
              <div key={f} className="flex items-center gap-3 text-sm text-gray-300">
                <span className="w-5 h-5 rounded-full bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-bold flex items-center justify-center shrink-0">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-gray-700">&copy; {new Date().getFullYear()} GenZFlash News &mdash; RUPP Capstone</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="lg:hidden mb-10">
          <Link href="/" className="inline-block">
            <div className="relative h-8 w-40">
              <Image src={logoSrc} alt="GenZ Flash News" fill sizes="160px" className="object-cover dark:invert" style={{ objectPosition: "center 48%" }} />
            </div>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Create your account</h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">
            Already have an account?{" "}
            <Link href="/login" className="text-red-500 hover:text-red-600 font-semibold transition-colors">Sign in</Link>
          </p>

          {success ? (
            <div className="rounded-2xl border border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-900/20 p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-700 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Account created!</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm mb-2">Welcome, <strong className="text-slate-700 dark:text-white">{form.name}</strong>.</p>
              <p className="text-slate-400 dark:text-gray-500 text-xs">Redirecting to homepage…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="name">Full Name</label>
                <input id="name" type="text" autoComplete="name" value={form.name} onChange={set("name")} placeholder="Dara Chan" className={inputClass("name")}/>
                {fieldErrors.first_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="username">Username</label>
                <input id="username" type="text" autoComplete="username" value={form.username} onChange={set("username")} placeholder="dara_chan" className={inputClass("username")}/>
                {fieldErrors.username && <p className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="email">Email Address</label>
                <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} placeholder="dara@example.com" className={inputClass("email")}/>
                {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="password">Password</label>
                <div className="relative">
                  <input id="password" type={showPw ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={set("password")} placeholder="Min. 8 characters" className={inputClass("password") + " pr-11"}/>
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors" aria-label="Toggle password"><EyeIcon open={showPw}/></button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
              </div>

              {/* Confirm */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="confirm">Confirm Password</label>
                <div className="relative">
                  <input id="confirm" type={showCfm ? "text" : "password"} autoComplete="new-password" value={form.confirm} onChange={set("confirm")} placeholder="Re-enter password" className={inputClass("confirm") + " pr-11"}/>
                  <button type="button" onClick={() => setShowCfm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors" aria-label="Toggle confirm"><EyeIcon open={showCfm}/></button>
                </div>
              </div>

              <p className="text-xs text-slate-400 dark:text-gray-600 leading-relaxed">
                By creating an account you agree to our <Link href="/terms" className="underline hover:text-slate-600 dark:hover:text-gray-400 transition-colors">Terms of Use</Link> and <Link href="/privacy" className="underline hover:text-slate-600 dark:hover:text-gray-400 transition-colors">Privacy Policy</Link>.
              </p>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors mt-2">
                {loading
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account…</>
                  : "Create Account"
                }
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/admin/login" className="text-xs text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400 transition-colors">
              Admin sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
