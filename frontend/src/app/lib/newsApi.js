// Client-side news API utility
// All actual fetching happens in /api/news (server-side) to avoid CORS issues

export const NEWS_FEEDS = {
  world:         { label: "BBC World / NewsData",         icon: "🌍" },
  asia:          { label: "BBC Asia / NewsData",          icon: "🌏" },
  sports:        { label: "BBC Sport / NewsData",         icon: "⚽" },
  technology:    { label: "BBC Tech / NewsData",          icon: "💻" },
  entertainment: { label: "BBC Entertainment / NewsData", icon: "🎬" },
  politics:      { label: "BBC Politics / NewsData",      icon: "🏛️" },
  education:     { label: "BBC Education / NewsData",     icon: "📚" },
};

// Fetch news for a specific category key (sports, technology, etc.)
export async function fetchRssFeed(feedKey, count = 10) {
  try {
    const res = await fetch(`/api/news?category=${feedKey}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).slice(0, count);
  } catch {
    return [];
  }
}

// Fetch world + Asia in parallel and merge
export async function fetchGeneralNews(count = 12) {
  const [world, asia] = await Promise.allSettled([
    fetchRssFeed("world", Math.ceil(count * 0.6)),
    fetchRssFeed("asia",  Math.ceil(count * 0.4)),
  ]);

  const articles = [
    ...(world.status === "fulfilled" ? world.value : []),
    ...(asia.status  === "fulfilled" ? asia.value  : []),
  ];

  // Sort newest first and deduplicate by title
  const seen = new Set();
  return articles
    .filter((a) => {
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    })
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, count);
}
