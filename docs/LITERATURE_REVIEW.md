# Literature Review & Discussion

> Draft for the GenZ Flash capstone report. Citations are marked `[n]` — replace
> with your reference list. Verify each platform's claims against its live site
> before submission, as features change over time.

## 1. Introduction

The growth of internet and smartphone use in Cambodia has shifted news
consumption from print and television to online platforms. DataReportal's
*Digital 2025: Cambodia* report records **10.8 million internet users (60.7 %
penetration)** and **12.9 million social-media identities (72.4 % of the
population)** [1]. This creates strong demand for fast, organised, mobile-friendly
access to news. Several Cambodian platforms already serve this need; this review
examines the most relevant ones, identifies their limitations, and positions the
proposed system (**GenZ Flash**) against them.

## 2. Review of Existing Systems

### 2.1 Fresh News
Fresh News (freshnewsasia.com) is one of Cambodia's largest and fastest news
portals, publishing primarily in Khmer with a high volume of breaking-news
updates and a companion mobile app [2].
- **Strengths:** very fast breaking coverage, large audience, strong local reach.
- **Limitations:** Khmer-only (limited access for non-Khmer readers), an
  advertisement-heavy and cluttered interface, little category organisation or
  search, and no personalisation.

### 2.2 Khmer Times
Khmer Times (khmertimeskh.com) is an established English-language (with some
Khmer) daily covering politics, business, and national affairs [3].
- **Strengths:** credible, professionally edited English content; a cleaner,
  more modern layout than most local outlets.
- **Limitations:** a **single editorial source** — it publishes only its own
  reporting and does not aggregate other outlets; a fairly traditional layout
  with limited interactivity and no integrated multi-source view.

### 2.3 CamboJA News
CamboJA News (cambojanews.com), run by the Cambodian Journalists Alliance,
focuses on independent and investigative journalism in English and Khmer with a
responsive design [4].
- **Strengths:** high-quality independent reporting; clean, responsive layout.
- **Limitations:** lower publishing volume and a niche focus; again a **single
  source**, so it is not a real-time aggregator of breaking news.

### 2.4 International aggregators (for context)
Global aggregators such as Google News combine many sources with personalisation,
but they are **not Cambodia-focused**, provide no local editorial control, and
mix Cambodian stories into a global stream rather than surfacing them first.

## 3. Comparative Analysis

| Feature | Fresh News | Khmer Times | CamboJA News | **GenZ Flash (Proposed)** |
|---|:---:|:---:|:---:|:---:|
| Cambodia-focused | ✅ | ✅ | ✅ | ✅ |
| **Multi-source aggregation** (local + international) | ❌ | ❌ | ❌ | ✅ |
| Clear category navigation | Partial | ✅ | ✅ | ✅ |
| **Full-text search** (ranked) | Basic | Basic | Basic | ✅ |
| **Trending / "hot" ranking** | ❌ | ❌ | ❌ | ✅ |
| **Bilingual UI toggle (EN / ខ្មែរ)** | ❌ | Partial | Partial | ✅ |
| Dark mode | ❌ | ❌ | ❌ | ✅ |
| Responsive web design | Partial | ✅ | ✅ | ✅ |
| **Admin CMS** (publish & manage) | ✅ (internal) | ✅ (internal) | ✅ (internal) | ✅ (in-app) |
| **Admin analytics + content classification** | ❌ | ❌ | ❌ | ✅ |
| Open / documented API | ❌ | ❌ | ❌ | ✅ (REST + Swagger) |

*Legend: ✅ present · Partial limited · ❌ absent.*

## 4. Identified Gap

No reviewed platform combines, in a single lightweight web application:
1. **aggregation of multiple sources** (local *and* international) into one
   Cambodia-focused feed;
2. a **modern, categorised, bilingual** reading experience;
3. **fast, ranked search** and a **trending/"hot"** view; and
4. an **admin content-management system** with management analytics.

Existing platforms are each strong on one axis (Fresh News on speed, Khmer Times
on credible English reporting, CamboJA on independent quality) but none unifies
aggregation, organisation, search, and management for the modern Cambodian reader.

## 5. Discussion — How GenZ Flash Addresses the Gap

GenZ Flash was designed to close this gap, and the implemented system
demonstrates each capability:

- **Centralised multi-source aggregation.** A backend importer pulls articles
  from several public sources (e.g. BBC, Al Jazeera, The Guardian, Khmer Times)
  via RSS/public APIs, de-duplicates them, applies a freshness filter, and
  stores them in a single PostgreSQL database. The whole site reads from this one
  source of truth, so local and international news appear together, correctly
  categorised.
- **Organisation and discovery.** Articles are grouped into clear categories
  (Cambodia, World, Politics, Technology, Sports, Entertainment, Business,
  Education). A **PostgreSQL full-text index** powers ranked search with a
  typeahead, and a **time-decayed "hot" score** surfaces trending stories.
- **Accessibility for a young, bilingual audience.** The interface supports an
  **English/Khmer language toggle** (with the Hanuman Khmer font) and
  **light/dark theme**, and is fully responsive for desktop and mobile browsers —
  directly serving the Gen-Z audience the project targets.
- **Editorial management and oversight.** A secure (JWT-protected) **admin
  dashboard** lets staff create, edit, publish, archive, and delete articles and
  categories, manage sources and users, and view **analytics** — distribution by
  category/source, freshness, and an automated **content-type and
  sensitivity classification** that flags graphic content for review.
- **Engineering quality.** The system exposes a documented REST API
  (Swagger/OpenAPI), applies request throttling and security hardening, and
  caches expensive analytics — concerns the surveyed consumer platforms do not
  expose or document.

## 6. Limitations (Honest Positioning)

Consistent with the project scope, GenZ Flash does **not** yet provide: a native
mobile application; AI/ML-based *personalised* recommendations (the classifier is
a transparent keyword model, not a trained recommender); live video; or a
user-comment system. Aggregated content is also bounded by what the upstream
sources publish in their feeds. These are documented as future work.

## 7. Summary

The reviewed Cambodian platforms each excel on a single dimension but leave a
clear gap: none unifies **multi-source aggregation, modern bilingual
organisation, ranked search and trending, and admin management** in one
web application. GenZ Flash targets exactly this gap, and the implemented
features above substantiate that contribution.

## References (to complete)
- [1] DataReportal. *Digital 2025: Cambodia.*
- [2] Fresh News — https://www.freshnewsasia.com
- [3] Khmer Times — https://www.khmertimeskh.com
- [4] CamboJA News — https://cambojanews.com
