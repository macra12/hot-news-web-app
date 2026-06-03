"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import ThemeProvider from "./ThemeProvider";
import LanguageProvider from "./LanguageProvider";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isAuth = pathname === "/login" || pathname === "/register";

  let content;
  if (isAdmin) {
    // Admin console — now theme-aware (light/dark) via ThemeProvider.
    content = <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white">{children}</div>;
  } else if (isAuth) {
    // Full-screen auth pages — no site chrome.
    content = children;
  } else {
    content = (
      <>
        <Header />
        <main className="min-h-screen" style={{ paddingTop: "var(--header-h, 120px)" }}>
          {children}
        </main>
        <Footer />
      </>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>{content}</LanguageProvider>
    </ThemeProvider>
  );
}
