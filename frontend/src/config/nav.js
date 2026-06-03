// Navigation link configuration — single source of truth for all nav menus

export const NAV_CATEGORIES = Object.freeze([
  { name: "Sports",        slug: "sports"        },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Technology",    slug: "technology"    },
  { name: "Politics",      slug: "politics"      },
  { name: "Education",     slug: "education"     },
  { name: "Cambodia",      slug: "cambodia"      },
]);

export const PRIMARY_NAV = Object.freeze([
  { label: "Home",     href: "/"      },
  { label: "All News", href: "/news"  },
  { label: "About",    href: "/about" },
]);

export const NEWSROOM_LINKS = Object.freeze([
  { label: "About GenZFlash News",   href: "/about"      },
  { label: "Contact Us",             href: "/contact"    },
  { label: "Help & FAQ",             href: "/help"       },
  { label: "Editorial Guidelines",   href: "/guidelines" },
]);

export const POLICY_LINKS = Object.freeze([
  { label: "Terms of Use",    href: "/terms"         },
  { label: "Privacy Policy",  href: "/privacy"       },
  { label: "Cookies",         href: "/cookies"       },
  { label: "Accessibility",   href: "/accessibility" },
]);

export const SOCIAL_LINKS = Object.freeze([
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M22 12a10 10 0 1 0-11.56 9.88v-6.99h-2.54V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z",
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    path: "M23.5 6.2a3 3 0 0 0-2.12-2.12C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.38.48A3 3 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3 3 0 0 0 2.12 2.12C4.5 20.4 12 20.4 12 20.4s7.5 0 9.38-.48a3 3 0 0 0 2.12-2.12C24 15.92 24 12 24 12s0-3.92-.5-5.8ZM9.6 15.6V8.4l6.24 3.6L9.6 15.6Z",
  },
  {
    label: "Telegram",
    href: "https://telegram.org",
    path: "M9.78 18.65 10.06 14.42 17.74 7.5C18.08 7.19 17.67 7.04 17.22 7.31L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42Z",
  },
]);

export const ADMIN_NAV = Object.freeze([
  { id: "dashboard",  label: "Dashboard",  icon: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" },
  { id: "articles",   label: "Articles",   icon: "M4 4h16v3H4V4Zm0 5h16v3H4V9Zm0 5h10v3H4v-3Zm0 5h16v2H4v-2Z" },
  { id: "categories", label: "Categories", icon: "M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z" },
]);
