// Server-side news API route — no CORS, with BBC RSS fallback if NewsData quota runs out

const ND_KEY = "pub_bf6246cd383a42e5b6f8cf0fe393bcf1";

// NewsData.io category slugs
const ND_CATEGORY = {
  world:         "world",
  asia:          "world",
  sports:        "sports",
  technology:    "technology",
  entertainment: "entertainment",
  politics:      "politics",
  education:     "top",
  general:       "top",
};

// BBC RSS fallback feeds — parsed server-side so no CORS
const BBC_RSS = {
  world:         "https://feeds.bbci.co.uk/news/world/rss.xml",
  asia:          "https://feeds.bbci.co.uk/news/world/asia/rss.xml",
  sports:        "https://feeds.bbci.co.uk/sport/rss.xml",
  technology:    "https://feeds.bbci.co.uk/news/technology/rss.xml",
  entertainment: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
  politics:      "https://feeds.bbci.co.uk/news/politics/rss.xml",
  education:     "https://feeds.bbci.co.uk/news/education/rss.xml",
  general:       "https://feeds.bbci.co.uk/news/world/rss.xml",
};

// ── NewsData.io fetch ───────────────────────────────────────────────────────
async function fetchFromNewsData(category) {
  const ndCat = ND_CATEGORY[category] || "top";
  const params = new URLSearchParams({
    apikey:   ND_KEY,
    language: "en",
    category: ndCat,
    size:     "10",
  });
  if (category === "asia") params.set("country", "kh,sg,th,ph,vn,my,id,in");

  const res = await fetch(`https://newsdata.io/api/1/news?${params}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== "success" || !Array.isArray(data.results)) return null;

  return data.results.map((item, i) => ({
    article_id:   item.article_id || `nd-${i}`,
    title:        item.title || "Untitled",
    image:        item.image_url || null,
    summary:      item.description || "Click to read the full story.",
    author:       Array.isArray(item.creator) ? item.creator[0] : (item.source_name || "News Desk"),
    category:     { name: friendlyName(category) },
    published_at: item.pubDate || new Date().toISOString(),
    isExternal:   true,
    externalUrl:  item.link,
    source:       item.source_name || "NewsData",
  }));
}

// ── BBC RSS fallback ────────────────────────────────────────────────────────
function extractTag(xml, tag) {
  const m = xml.match(
    new RegExp(`<${tag}[^>]*?>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`)
  );
  return m ? m[1].trim() : "";
}

function stripHtml(s) {
  return s.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim().slice(0, 260);
}

async function fetchFromBbcRss(category) {
  const url = BBC_RSS[category] || BBC_RSS.world;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const xml  = await res.text();
  const raw  = xml.split("<item>").slice(1);
  const name = friendlyName(category);

  return raw.slice(0, 10).map((chunk, i) => {
    const img =
      chunk.match(/url="([^"]+\.(?:jpg|jpeg|png|webp))"/i)?.[1] ||
      chunk.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1] ||
      null;

    return {
      article_id:   extractTag(chunk, "guid") || `bbc-${i}`,
      title:        stripHtml(extractTag(chunk, "title")),
      image:        img,
      summary:      stripHtml(extractTag(chunk, "description")),
      author:       "BBC News",
      category:     { name },
      published_at: extractTag(chunk, "pubDate"),
      isExternal:   true,
      externalUrl:  extractTag(chunk, "link") || extractTag(chunk, "guid"),
      source:       "BBC News",
    };
  }).filter((a) => a.title && a.externalUrl);
}

function friendlyName(key) {
  const map = {
    world: "World", asia: "Asia", sports: "Sports",
    technology: "Technology", entertainment: "Entertainment",
    politics: "Politics", education: "Education", general: "Top News",
  };
  return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

// ── Route handler ───────────────────────────────────────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "world";

  try {
    // Try NewsData.io first
    const nd = await fetchFromNewsData(category);
    if (nd && nd.length > 0) {
      return Response.json({ articles: nd, source: "newsdata" });
    }

    // Fallback: BBC RSS parsed server-side
    const bbc = await fetchFromBbcRss(category);
    return Response.json({ articles: bbc, source: "bbc-rss" });
  } catch {
    return Response.json({ articles: [], source: "error" });
  }
}
