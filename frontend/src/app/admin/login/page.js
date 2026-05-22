"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = "http://localhost:8000/api";

export default function AdminLogin() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.access);
        router.push("/admin");
      } else {
        setError(data.detail || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Network error. Make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 border-r border-gray-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(220,38,38,0.15)_0%,transparent_60%)]" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-700 via-red-500 to-red-700" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-red-600 text-white font-black text-3xl px-4 py-2 rounded-xl shadow-lg shadow-red-900/50">
              GEN<span className="text-yellow-300">Z</span>
            </div>
            <span className="text-white font-black text-3xl">
              Flash<span className="text-red-500">News</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Content Management System
          </h2>
          <p className="text-gray-500 mb-10 leading-relaxed">
            Manage your news articles, categories, and keep Cambodia informed.
          </p>

          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: "📰", label: "Publish Articles" },
              { icon: "🏷️", label: "Manage Categories" },
              { icon: "📊", label: "Track View Counts" },
              { icon: "🔐", label: "JWT Secured Auth" },
              { icon: "✅", label: "Draft & Publish" },
              { icon: "🗑️", label: "Soft Delete" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2.5 bg-gray-800/60 rounded-lg px-3 py-2.5"
              >
                <span className="text-base">{f.icon}</span>
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
          <div className="flex items-center justify-center gap-2.5 mb-10 lg:hidden">
            <div className="bg-red-600 text-white font-black text-xl px-3 py-1.5 rounded-lg">
              GEN<span className="text-yellow-300">Z</span>
            </div>
            <span className="text-white font-bold text-2xl">
              Flash<span className="text-red-500">News</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-white">Welcome back</h1>
            <p className="text-gray-500 mt-1.5 text-sm">
              Sign in to your admin account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-950/60 border border-red-800/60 rounded-xl">
                <span className="text-red-400 shrink-0 mt-0.5">⚠️</span>
                <p className="text-red-300 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full bg-gray-900 border border-gray-700 hover:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white placeholder-gray-600 px-4 py-3 rounded-xl text-sm transition-all outline-none"
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-gray-700 hover:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white placeholder-gray-600 px-4 py-3 pr-14 rounded-xl text-sm transition-all outline-none"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs font-medium transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all mt-2 shadow-lg shadow-red-900/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In to Admin"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between text-sm">
            <Link
              href="/"
              className="text-gray-600 hover:text-white transition-colors flex items-center gap-1.5"
            >
              ← Back to site
            </Link>
            <a
              href="http://localhost:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-red-400 transition-colors"
            >
              Django Admin ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
