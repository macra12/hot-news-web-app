// Central API configuration — change NEXT_PUBLIC_API_BASE in .env to point at production.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

export const ENDPOINTS = Object.freeze({
  news: {
    list:          `${API_BASE}/news/`,
    latest:        `${API_BASE}/news/latest/`,
    trending:      `${API_BASE}/news/trending/`,
    // Backend uses slug as the URL identifier (lookup_field = "slug")
    detail:        (slug) => `${API_BASE}/news/${slug}/`,
    update:        (slug) => `${API_BASE}/news/${slug}/`,
    delete:        (slug) => `${API_BASE}/news/${slug}/`,
    incrementView: (slug) => `${API_BASE}/news/${slug}/increment_view/`,
    byCategory:    (categorySlug) => `${API_BASE}/news/?category__slug=${categorySlug}`,
    paginated:     (page) => `${API_BASE}/news/?page=${page}`,
  },
  categories: {
    list:   `${API_BASE}/categories/`,
    detail: (id) => `${API_BASE}/categories/${id}/`,
  },
  auth: {
    login:    `${API_BASE}/auth/login/`,
    token:    `${API_BASE}/auth/login/`,   // alias kept for backward compat
    register: `${API_BASE}/auth/register/`,
    admin:    `${API_BASE}/auth/admin/login/`,
    refresh:  `${API_BASE}/auth/refresh/`,
  },
});

export const FETCH_DEFAULTS = {
  headers: { "Content-Type": "application/json" },
};
