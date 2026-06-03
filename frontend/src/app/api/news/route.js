// Server-side news API route — no CORS, with RSS fallback if NewsData quota runs out.

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ND_KEY = process.env.NEWSDATA_KEY || "";
const LIVE_FETCH_OPTIONS = { cache: "no-store" };
const RESPONSE_INIT = { headers: { "Cache-Control": "no-store" } };

// NewsData.io category mapping
const ND_CATEGORY = {
  world:         "world",
  asia:          "world",
  cambodia:      "top",
  sports:        "sports",
  technology:    "technology",
  entertainment: "entertainment",
  politics:      "politics",
  business:      "business",
  education:     "top",
  general:       "top",
};

// Per-category NewsData country filters
const ND_COUNTRY = {
  asia:     "kh,sg,th,ph,vn,my,id,in",
  cambodia: "kh",
};

// RSS fallback feeds (with source attribution) — parsed server-side so no CORS
const RSS_FALLBACKS = {
  world:         { url: "https://feeds.bbci.co.uk/news/world/rss.xml",                 source: "BBC News" },
  asia:          { url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml",            source: "BBC News" },
  cambodia:      { url: "https://www.khmertimeskh.com/feed/",                          source: "Khmer Times" },
  sports:        { url: "https://feeds.bbci.co.uk/sport/rss.xml",                      source: "BBC News" },
  technology:    { url: "https://feeds.bbci.co.uk/news/technology/rss.xml",            source: "BBC News" },
  entertainment: { url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", source: "BBC News" },
  politics:      { url: "https://feeds.bbci.co.uk/news/politics/rss.xml",              source: "BBC News" },
  business:      { url: "https://feeds.bbci.co.uk/news/business/rss.xml",              source: "BBC News" },
  education:     { url: "https://feeds.bbci.co.uk/news/education/rss.xml",             source: "BBC News" },
  general:       { url: "https://feeds.bbci.co.uk/news/world/rss.xml",                 source: "BBC News" },
};

const FRIENDLY = {
  world:         "World",
  asia:          "Asia",
  cambodia:      "Cambodia",
  sports:        "Sports",
  technology:    "Technology",
  entertainment: "Entertainment",
  politics:      "Politics",
  business:      "Business",
  education:     "Education",
  general:       "Top News",
};

function friendlyName(key) {
  return FRIENDLY[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

const CAMBODIA_TERMS = [
  "cambodia", "cambodian", "khmer", "phnom penh", "siem reap", "battambang",
  "kampot", "kep", "sihanoukville", "preah sihanouk", "bavet", "poipet",
  "svay rieng", "takeo", "kampong", "kandal", "pursat", "mondulkiri",
  "ratanakiri", "prey veng", "oddar meanchey", "hun manet", "hun sen",
  "senate", "national assembly", "ministry", "khmertimeskh.com",
  "phnompenhpost.com", "cambodianess.com", "cambojanews.com", "freshnewsasia.com",
];

const BAD_IMAGE_TERMS = [
  "logo", "favicon", "icon", "placeholder", "default-image", "default_img",
  "blank", "avatar", "profile",
];

const CP1252_REVERSE = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

function repairMojibake(value) {
  if (!value || !/[\u00c3\u00c2\u00e2\u00e1]/.test(value)) return value || "";

  const bytes = [];
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code <= 0xff) {
      bytes.push(code);
    } else if (CP1252_REVERSE[code]) {
      bytes.push(CP1252_REVERSE[code]);
    } else {
      return value;
    }
  }

  try {
    const fixed = new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
    return fixed.replace(/\u0000/g, "").trim() || value;
  } catch {
    return value;
  }
}

function decodeEntities(value) {
  return (value || "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const isHex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    return {
      amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"',
      rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', ndash: "-", mdash: "-",
    }[entity.toLowerCase()] || " ";
  });
}

function cleanText(value) {
  return repairMojibake(decodeEntities(value))
    .replace(/\s+/g, " ")
    .trim();
}

function cleanUrl(value) {
  return decodeEntities(repairMojibake(value || "")).trim();
}

function cleanImageUrl(value) {
  const url = cleanUrl(value);
  if (!url) return "";
  const lower = url.toLowerCase();
  return BAD_IMAGE_TERMS.some((term) => lower.includes(term)) ? "" : url;
}

function hasKhmerScript(value) {
  return /[\u1780-\u17ff]/.test(value || "");
}

function isUsefulArticle(article) {
  const text = `${article.title || ""} ${article.summary || ""} ${article.content || ""}`.trim();
  return Boolean(article.title && article.externalUrl && (text.length >= 60 || article.image));
}

function isCambodiaArticle(article) {
  const haystack = [
    article.title, article.summary, article.content, article.source, article.externalUrl,
  ].filter(Boolean).join(" ").toLowerCase();

  return hasKhmerScript(haystack) || CAMBODIA_TERMS.some((term) => haystack.includes(term));
}

// ── NewsData.io fetch ───────────────────────────────────────────────────────
async function fetchFromNewsData(category) {
  if (!ND_KEY) return null;

  const ndCat = ND_CATEGORY[category] || "top";
  const params = new URLSearchParams({
    apikey:   ND_KEY,
    language: "en",
    category: ndCat,
    size:     "10",
  });
  const country = ND_COUNTRY[category];
  if (country) params.set("country", country);

  const res = await fetch(`https://newsdata.io/api/1/news?${params}`, LIVE_FETCH_OPTIONS);
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== "success" || !Array.isArray(data.results)) return null;

  const articles = data.results.map((item, i) => ({
    article_id:   item.article_id || `nd-${i}`,
    title:        cleanText(item.title || "Untitled"),
    image:        cleanImageUrl(item.image_url || "") || null,
    summary:      cleanText(item.description || "").slice(0, 400) || "Click to read the full story.",
    content:      stripHtml(item.content || item.full_description || item.description || ""),
    author:       cleanText(Array.isArray(item.creator) ? item.creator[0] : (item.source_name || "News Desk")),
    category:     { name: friendlyName(category) },
    published_at: item.pubDate || new Date().toISOString(),
    isExternal:   true,
    externalUrl:  cleanUrl(item.link || ""),
    source:       cleanText(item.source_name || "NewsData"),
    feedKey:      category,
  })).filter(isUsefulArticle);

  return category === "cambodia" ? articles.filter(isCambodiaArticle) : articles;
}

// ── RSS fallback ────────────────────────────────────────────────────────────
function extractTag(xml, tag) {
  const m = xml.match(
    new RegExp(`<${tag}[^>]*?>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`)
  );
  return m ? m[1].trim() : "";
}

function stripHtml(s) {
  return cleanText((s || "").replace(/<[^>]*>/g, " "));
}

function extractImage(chunk) {
  return cleanImageUrl(
    chunk.match(/url="([^"]+\.(?:jpg|jpeg|png|webp))"/i)?.[1] ||
    chunk.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1] ||
    chunk.match(/<media:content[^>]+url="([^"]+)"/i)?.[1] ||
    chunk.match(/<enclosure[^>]+url="([^"]+\.(?:jpg|jpeg|png|webp))"/i)?.[1] ||
    chunk.match(/<img[^>]+src="([^"]+)"/i)?.[1] ||
    ""
  ) || null;
}

async function fetchFromRss(category) {
  const entry = RSS_FALLBACKS[category] || RSS_FALLBACKS.world;
  let res;
  try {
    res = await fetch(entry.url, LIVE_FETCH_OPTIONS);
  } catch {
    return [];
  }
  if (!res.ok) return [];

  const xml  = await res.text();
  const raw  = xml.split("<item>").slice(1);
  const name = friendlyName(category);

  const articles = raw
    .slice(0, 12)
    .map((chunk, i) => {
      const description = stripHtml(extractTag(chunk, "description"));
      // content:encoded carries the fuller body when the publisher provides it.
      const encoded = stripHtml(extractTag(chunk, "content:encoded"));
      const body = encoded.length > description.length ? encoded : description;
      return {
        article_id:   cleanText(extractTag(chunk, "guid")) || `rss-${category}-${i}`,
        title:        stripHtml(extractTag(chunk, "title")),
        image:        extractImage(chunk),
        summary:      description.slice(0, 400),
        content:      body,
        author:       stripHtml(extractTag(chunk, "dc:creator")) || entry.source,
        category:     { name },
        published_at: extractTag(chunk, "pubDate"),
        isExternal:   true,
        externalUrl:  cleanUrl(extractTag(chunk, "link") || extractTag(chunk, "guid")),
        source:       entry.source,
        feedKey:      category,
      };
    })
    .filter(isUsefulArticle);

  return category === "cambodia" ? articles.filter(isCambodiaArticle) : articles;
}

// ── Route handler ───────────────────────────────────────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "world";

  try {
    if (category === "cambodia") {
      const rss = await fetchFromRss(category);
      if (rss.length > 0) {
        return Response.json({ articles: rss, source: "rss" }, RESPONSE_INIT);
      }
    }

    const nd = await fetchFromNewsData(category);
    if (nd && nd.length > 0) {
      return Response.json({ articles: nd, source: "newsdata" }, RESPONSE_INIT);
    }

    const rss = await fetchFromRss(category);
    return Response.json({ articles: rss, source: "rss" }, RESPONSE_INIT);
  } catch {
    return Response.json({ articles: [], source: "error" }, RESPONSE_INIT);
  }
}
