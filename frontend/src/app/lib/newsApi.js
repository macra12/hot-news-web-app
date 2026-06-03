// Backward-compat barrel — re-exports from canonical modules
export { NEWS_FEEDS, CATEGORY_META } from "@/config/feeds";
export { fetchCategoryNews as fetchRssFeed, fetchWorldNews as fetchGeneralNews } from "@/services/newsService";
