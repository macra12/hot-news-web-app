import { API_BASE } from "@/config/api";

// Backend origin (strip the trailing "/api") used to resolve relative media paths.
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

/**
 * Resolve an article image into a valid absolute URL for next/image.
 *
 * Handles three cases:
 *  - empty / null            → returns null (caller should skip rendering)
 *  - already absolute        → "http(s)://..." or protocol-relative "//..." returned as-is
 *  - backend-relative        → "/media/foo.jpg" gets the backend origin prepended
 */
export function resolveImageUrl(image) {
  if (!image || typeof image !== "string") return null;

  const src = image.trim();
  if (!src) return null;

  if (/^(https?:)?\/\//i.test(src)) return src;

  return `${BACKEND_ORIGIN}/${src.replace(/^\/+/, "")}`;
}
