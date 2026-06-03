"use client";
import { useState, useEffect, useCallback } from "react";

// Token storage keys — single source of truth
export const TOKEN_KEYS = {
  user:     "gzf-user-token",
  admin:    "gzf-admin-token",
  username: "gzf-username",
  isAdmin:  "gzf-is-admin",
};

export function saveUserSession(accessToken, username) {
  localStorage.setItem(TOKEN_KEYS.user,     accessToken);
  localStorage.setItem(TOKEN_KEYS.username, username);
  localStorage.setItem(TOKEN_KEYS.isAdmin,  "false");
  // Remove any stale admin session
  localStorage.removeItem(TOKEN_KEYS.admin);
}

export function saveAdminSession(accessToken, username) {
  localStorage.setItem(TOKEN_KEYS.admin,    accessToken);
  localStorage.setItem(TOKEN_KEYS.username, username);
  localStorage.setItem(TOKEN_KEYS.isAdmin,  "true");
  // Also write the legacy "token" key that the admin panel currently reads
  localStorage.setItem("token", accessToken);
}

export function clearSession() {
  Object.values(TOKEN_KEYS).forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem("token"); // legacy admin key
}

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEYS.admin) || localStorage.getItem("token") || null;
}

/** React hook — reads session from localStorage, reacts to sign-out. */
export function useAuth() {
  const [user,    setUser]    = useState(null);  // { username, isAdmin }
  const [ready,   setReady]   = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem(TOKEN_KEYS.admin) || localStorage.getItem("token");
    const userToken  = localStorage.getItem(TOKEN_KEYS.user);
    const username   = localStorage.getItem(TOKEN_KEYS.username);
    const isAdmin    = localStorage.getItem(TOKEN_KEYS.isAdmin) === "true";

    if ((adminToken || userToken) && username) {
      setUser({ username, isAdmin });
    }
    setReady(true);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
    window.location.href = "/";
  }, []);

  return { user, ready, signOut };
}
