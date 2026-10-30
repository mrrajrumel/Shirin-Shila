# Admin Content Persistence Specification

> **Application**: Shirin Shila Portfolio CMS  
> **Database Engine**: Hostinger MySQL (`u473489494_shirin`)  
> **Target Production URL**: `https://cornflowerblue-wildcat-675604.hostingersite.com/`

---

## 1. Editable Field Inventory & Persistence Paths

| # | CMS Module | Admin Component | API Endpoint | MySQL Storage Location | Public Presentation Component | Caching Strategy |
|---|---|---|---|---|---|---|
| 1 | **Hero Profile** | [`admin/hero/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/hero/page.tsx) | `POST /api/hero` | `cms_content` (`key='hero'`) | [`hero-motion.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/components/hero-motion.tsx) | Dynamic SSR (`force-dynamic`), `revalidate: 0` |
| 2 | **About & Bio** | [`admin/about/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/about/page.tsx) | `POST /api/about` | `cms_content` (`key='about'`) | [`one-page-about.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/components/one-page-about.tsx) | Dynamic SSR (`force-dynamic`), `revalidate: 0` |
| 3 | **Works & Films** | [`admin/works/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/works/page.tsx) | `POST /api/works` | `cms_content` (`key='filmography'`) | [`one-page-filmography.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/components/one-page-filmography.tsx) | Dynamic SSR (`force-dynamic`), `revalidate: 0` |
| 4 | **Showreels** | [`admin/showreel/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/showreel/page.tsx) | `POST /api/showreels` | `cms_content` (`key='showreels'`) | [`showreel-section.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/components/showreel-section.tsx) | Dynamic SSR (`force-dynamic`), `revalidate: 0` |
| 5 | **3D Gallery** | [`admin/gallery/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/gallery/page.tsx) | `POST /api/gallery` | `cms_content` (`key='gallery'`) | [`3d-parallax-gallery.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/components/3d-parallax-gallery.tsx) | Dynamic SSR (`force-dynamic`), `revalidate: 0` |
| 6 | **Timeline** | [`admin/timeline/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/timeline/page.tsx) | `POST /api/timeline` | `cms_content` (`key='timeline'`) | [`career-journey-timeline.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/components/career-journey-timeline.tsx) | Dynamic SSR (`force-dynamic`), `revalidate: 0` |
| 7 | **Press** | [`admin/press/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/press/page.tsx) | `POST /api/press` | `cms_content` (`key='press'`) | [`one-page-press.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/components/one-page-press.tsx) | Dynamic SSR (`force-dynamic`), `revalidate: 0` |
| 8 | **Media Partners**| [`admin/media-partners/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/media-partners/page.tsx) | `POST /api/media-partners` | `cms_content` (`key='mediaPartners'`) | [`media-ticker-section.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/components/media-ticker-section.tsx) | Dynamic SSR (`force-dynamic`), `revalidate: 0` |
| 9 | **Contact Profile**| [`admin/contact/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/contact/page.tsx) | `POST /api/contact` | `cms_content` (`key='contactInfo'`) | [`one-page-contact.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/components/one-page-contact.tsx) & `footer.tsx` | Dynamic SSR (`force-dynamic`), `revalidate: 0` |
| 10 | **SEO & Head** | [`admin/seo/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/seo/page.tsx) | `POST /api/seo` | `cms_content` (`key='seo'`) | [`layout.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/layout.tsx) (`generateMetadata`) | Dynamic SSR (`force-dynamic`), `revalidate: 0` |
| 11 | **Inquiries** | [`admin/inquiries/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/inquiries/page.tsx) | `PATCH /api/inquiries` | `inquiries` + `cms_content` | Admin Only | Rate-limited submission, real-time fetch |
| 12 | **Media Assets** | [`admin/media/page.tsx`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/media/page.tsx) | `POST /api/upload` | `media_assets` + persistent uploads | Dynamic `/uploads/[...slug]` | Immutable 1-year cache |

---

## 2. Revalidation & Real-Time Sync Strategy

1. **Instant On-Demand SSR**: Public visitors hitting `GET /` trigger the server component to query Hostinger MySQL in real-time, completely bypassing static build artifacts.
2. **Cross-Tab Storage Signals**: Every mutation saves to MySQL, dispatches an intra-window event (`shirin_shila_*_updated`), and writes a timestamp to `localStorage` (`shirin_shila_sync_*`). This causes all open tabs across the browser to immediately revalidate without requiring a page refresh.
3. **No-Store HTTP Directives**: All dynamic API routes output `Cache-Control: no-store, no-cache, must-revalidate`.

