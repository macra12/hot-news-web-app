// News feed / category configuration — used by services and UI

export const NEWS_FEEDS = Object.freeze({
  world:         { label: "BBC World / NewsData",         icon: "🌍" },
  asia:          { label: "BBC Asia / NewsData",          icon: "🌏" },
  cambodia:      { label: "Khmer Times / verified Cambodia feeds", icon: "🇰🇭" },
  sports:        { label: "BBC Sport / NewsData",         icon: "⚽" },
  technology:    { label: "BBC Tech / NewsData",          icon: "💻" },
  entertainment: { label: "BBC Entertainment / NewsData", icon: "🎬" },
  politics:      { label: "BBC Politics / NewsData",      icon: "🏛️" },
  education:     { label: "BBC Education / NewsData",     icon: "📚" },
});

export const CATEGORY_META = Object.freeze({
  sports:        { label: "Sports",        feedKey: "sports" },
  entertainment: { label: "Entertainment", feedKey: "entertainment" },
  technology:    { label: "Technology",    feedKey: "technology" },
  politics:      { label: "Politics",      feedKey: "politics" },
  education:     { label: "Education",     feedKey: "education" },
  cambodia:      { label: "Cambodia",      feedKey: "cambodia" },
});

export const HOME_TOPIC_BLOCKS = Object.freeze([
  { key: "technology",    label: "Technology" },
  { key: "politics",      label: "Politics"   },
  { key: "sports",        label: "Sports"     },
  { key: "entertainment", label: "Entertainment" },
]);

export const NEWS_PAGE_TABS = Object.freeze([
  { key: "world",         label: "World",         feedKey: "world"         },
  { key: "asia",          label: "Asia",           feedKey: "asia"          },
  { key: "sports",        label: "Sports",         feedKey: "sports"        },
  { key: "technology",    label: "Technology",     feedKey: "technology"    },
  { key: "entertainment", label: "Entertainment",  feedKey: "entertainment" },
  { key: "politics",      label: "Politics",       feedKey: "politics"      },
  { key: "education",     label: "Education",      feedKey: "education"     },
  { key: "local",         label: "Local CMS",      feedKey: null            },
]);
