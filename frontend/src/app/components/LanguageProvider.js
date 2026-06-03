"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import en from "@/i18n/en";
import km from "@/i18n/km";

const MESSAGES = { en, km };

const LangCtx = createContext({ lang: "en", setLang: () => {}, toggle: () => {}, t: (k) => k });
export const useLanguage = () => useContext(LangCtx);

export default function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("gzf-lang");
    if (stored === "en" || stored === "km") {
      setLangState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLang = useCallback((next) => {
    setLangState(next);
    localStorage.setItem("gzf-lang", next);
    document.documentElement.lang = next;
  }, []);

  const toggle = useCallback(() => setLang(lang === "en" ? "km" : "en"), [lang, setLang]);

  // Falls back to English, then the raw key, so missing translations never break the UI.
  const t = useCallback(
    (key) => (MESSAGES[lang] && MESSAGES[lang][key]) || MESSAGES.en[key] || key,
    [lang]
  );

  return <LangCtx.Provider value={{ lang, setLang, toggle, t }}>{children}</LangCtx.Provider>;
}
