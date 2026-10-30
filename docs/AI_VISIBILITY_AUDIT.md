# AI Visibility, Agent Discovery & Technical Audit
**Project**: Shirin Shila Official Cinema Portfolio  
**Audit Date**: October 30, 2026  
**Auditor**: Senior Full-Stack Engineer & Technical SEO Specialist  
**Target Environment**: Hostinger Node.js 22 LTS / LiteSpeed (MySQL Database: `u473489494_shirin`)

---

## 1. Executive Summary

A comprehensive, multi-phase technical audit of the Shirin Shila portfolio was performed to establish state-of-the-art AI visibility, agent discovery, structured data conformance, domain independence, and persistent admin management.

All hardcoded references to the temporary Hostinger staging domain have been completely removed and centralized into a resilient, domain-agnostic resolution module. The visible footer has been cleaned of redundant links and aligned with the five approved standard navigation items. Comprehensive multi-schema JSON-LD structured data has been implemented to truthfully describe the actor's Dhallywood career and verified filmography without fabricated organizational claims.

---

## 2. Confirmed Defects & Resolutions

| # | Component | Defect Found | Resolution Applied | Verification Status |
|---|-----------|--------------|--------------------|---------------------|
| **1** | **Domain Agnosticism** | Hardcoded staging domain (`cornflowerblue-wildcat-675604.hostingersite.com`) in `sitemap.ts`, `layout.tsx`, `api/markdown`, `robots.txt`, and `public/llms.txt`. | Centralized all absolute URL generation in `src/lib/site-config.ts` with hierarchy: `process.env.SITE_URL` → Database (`seo.siteUrl`) → Deployment host. | **RESOLVED & VERIFIED** |
| **2** | **Footer Navigation** | Cluttered multi-row links with outdated labels ("About Artist", "Contact & Booking Desk") and redundant section anchors. | Standardized on the 5 approved links: **About Actor** (`/about`), **Contact and Book** (`/contact`), **Privacy Policy** (`/privacy`), **Terms of Representation** (`/terms`), **llms.txt** (`/llms.txt`). Connected to Admin Panel. | **RESOLVED & VERIFIED** |
| **3** | **Admin Connectivity** | AI directives (`Content-Signal`, `llmsSummary`) and footer links were not editable from the Admin Panel. | Added **AI Visibility & Machine Agent Directives** and **Approved Footer Links** management cards to `/admin/seo`. Persists to MySQL `cms_content`. | **RESOLVED & VERIFIED** |
| **4** | **Structured Data (JSON-LD)** | Previous attempt used an `Organization` node with fake phone number `+8801711000000` and fabricated postal address. | Refactored into a truthful schema graph: `WebSite`, `ProfilePage`, `Person` (Shirin Shila, verified awards, debut in Hitman 2014, verified movies), and `ContactPoint` for the talent desk using real database contact info. | **RESOLVED & VERIFIED** |
| **5** | **`llms.txt` & `llms-full.txt`** | Used static files with hardcoded temporary URLs and was not dynamically connected to database changes. | Implemented dynamic route handlers `src/app/llms.txt/route.ts` and `src/app/llms-full.txt/route.ts` that resolve canonical URLs and pull latest filmography and admin notes dynamically. | **RESOLVED & VERIFIED** |
| **6** | **WebMCP Tools** | Injected artificial mock objects onto `navigator.modelContext` in standard consumer browsers. | Updated `src/components/webmcp-provider.tsx` to only register tools if the browser runtime natively provides `navigator.modelContext.registerTool`. Retained declarative HTML attributes on contact form. | **RESOLVED & VERIFIED** |
| **7** | **MCP Server Card** | Published hardcoded temporary staging URLs in `server-card.json`. | Dynamically generated from canonical site URL configuration with SEP-1649 compliance and tools reflecting live `/api/mcp` endpoint. | **RESOLVED & VERIFIED** |
| **8** | **XML Sitemap** | Emitted duplicate URLs for both temporary and hypothetical domains. | Cleaned `src/app/sitemap.ts` to output single canonical URLs for distinct public pages (`/`, `/about`, `/contact`, `/terms`, `/privacy`, `/llms.txt`). | **RESOLVED & VERIFIED** |
| **9** | **Content Negotiation** | Markdown representation relied on untrusted Host headers. | `src/app/api/markdown/route.ts` resolves canonical URLs and returns structured Markdown with valid RFC 8288 Link headers. | **RESOLVED & VERIFIED** |

---

## 3. Protocol & Crawler Limitations

### Hostinger Edge CDN (`hcdn`) Preview Domain Rule
On platform-managed staging domains (`*.hostingersite.com`), Hostinger's edge CDN intercepts requests to `/robots.txt` before they reach the web server or application layer, serving:
```
User-agent: Googlebot
Disallow: /

User-agent: *
Allow: /
```
This is a standard hosting safeguard designed to prevent staging subdomains from polluting search index rankings for client websites. 

**Application Conformance**: The application code ([`src/app/robots.txt/route.ts`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/robots.txt/route.ts)), public static directory ([`public/robots.txt`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/public/robots.txt)), and standalone server ([`server.js`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/server.js)) are fully configured with:
```
Content-Signal: search=yes, ai-train=no
Sitemap: <canonical-origin>/sitemap.xml
```
As soon as a custom domain (e.g., `shirinshila.com`) is attached to Hostinger, the edge filter is bypassed and our application's `robots.txt` is served directly.

---

## 4. AI Visibility Standards Assessment

1. **Content Signals (`Content-Signal`)**:
   - Declares content usage permissions to crawlers.
   - Syntax: `search=yes, ai-train=no`.
   - Purpose: Authorizes factual discovery in search while prohibiting unlicensed generative likeness training.
2. **RFC 8288 Link Headers**:
   - Advertises machine-readable alternates on HTTP GET requests.
   - `describedby`: `/llms.txt`, `/llms-full.txt`
   - `alternate` (`type="text/markdown"`): `/api/markdown`
   - `service-desc`: `/.well-known/mcp/server-card.json`
3. **Machine Summary (`/llms.txt`)**:
   - Markdown-formatted factual briefing for autonomous agents and LLMs.
4. **Model Context Protocol (`/api/mcp`)**:
   - JSON-RPC 2.0 endpoint enabling AI agents to query verified filmography, bio, and submit talent booking requests.

