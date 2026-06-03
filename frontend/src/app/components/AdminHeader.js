"use client";

import { memo } from "react";
import { cn } from "../lib/utils";
import { useTheme } from "./ThemeProvider";

function MenuIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 transition-colors hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white"
    >
      {theme === "dark" ? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
      )}
    </button>
  );
}

function AdminHeader({ title, subtitle, onMenuClick, rightSlot }) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3.5">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="rounded-lg p-1.5 text-slate-500 dark:text-gray-400 transition-colors hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white md:hidden"
          >
            <MenuIcon />
          </button>
        )}
        <div>
          <h1 className="text-base font-bold capitalize text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="hidden text-xs text-slate-400 dark:text-gray-600 sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {rightSlot}
        <ThemeToggle />
        <span className={cn("rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-500 dark:text-red-400")}>
          Admin
        </span>
      </div>
    </header>
  );
}

export default memo(AdminHeader);
