# SKILL: Next.js SEO & AI Visibility (GEO)

## When to use this skill
Trigger this whenever the task involves:
- Making a Next.js (App Router) site rank better on Google
- Making a site discoverable/citable by AI systems (ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews)
- Auditing or fixing metadata, structured data, sitemaps, robots.txt, or crawlability
- Writing or restructuring content for search/AI extraction

## Goal
Two audiences, one job: make every page maximally understandable to (1) traditional search crawlers and (2) LLM-based crawlers/answer engines that mostly can't run JavaScript. Optimize for both simultaneously — they overlap ~90%.

---

## Step 1 — Rendering & crawlability audit (do this first, always)
AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) generally do NOT execute client-side JS. If content only appears after a `useEffect` fetch, it is invisible to them.

- [ ] Identify every content-bearing page. Confirm it is Server Component / SSG / ISR rendered, not client-only.
- [ ] Verify with: `curl -A "GPTBot" <url>` and `curl -A "ClaudeBot" <url>` — the actual text content must appear in the raw HTML response.
- [ ] Flag any page relying purely on client fetch for primary content as high-priority fix.

## Step 2 — Metadata (per page, not just root layout)
Use the Metadata API. For dynamic routes, implement `generateMetadata()` — never leave dynamic pages sharing one static title/description.

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await getData(params.slug);
  return {
    title: `${data.title} | Brand`,
    description: data.summary.slice(0, 160),
    alternates: { canonical: `https://site.com/${params.slug}` },
    openGraph: { title: data.title, description: data.summary, images: [data.image] },
    twitter: { card: "summary_large_image" },
  };
}
```
Checklist:
- [ ] Every page has a unique title (50-60 chars) and description (150-160 chars)
- [ ] Canonical URL set on every page
- [ ] OG + Twitter card tags present
- [ ] No duplicate metadata across dynamic routes

## Step 3 — Structured data (JSON-LD) — highest leverage for AI
LLM answer engines lean heavily on structured data to extract entities/facts reliably. Add relevant schema.org types via a `<script type="application/ld+json">` in each page (or a shared component):

- `Organization` / `WebSite` — root layout
- `Article` / `BlogPosting` — blog/content pages
- `Product` / `Offer` — ecommerce
- `FAQPage` — any page with Q&A content
- `BreadcrumbList` — for nav hierarchy

Checklist:
- [ ] Validate every page with Google's Rich Results Test
- [ ] No schema type mismatches (e.g., don't mark a listicle as `Article` if it's really `ItemList`)

## Step 4 — Sitemap & robots
```ts
// app/sitemap.ts
export default function sitemap() {
  return pages.map(p => ({ url: `https://site.com/${p.slug}`, lastModified: p.updatedAt }));
}
```
```ts
// app/robots.ts
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://site.com/sitemap.xml",
  };
}
```
Checklist:
- [ ] robots.txt does NOT block GPTBot, ClaudeBot, PerplexityBot, Google-Extended (unless deliberately opting out)
- [ ] sitemap.xml lists all indexable pages with accurate `lastModified`
- [ ] Submit sitemap to Google Search Console + Bing Webmaster Tools

## Step 5 — llms.txt (emerging convention, cheap to add)
Create `/public/llms.txt` (served at site root) — a plain markdown summary of the site: what it is, key pages, and a short description of each, written for an LLM to parse quickly. Not universally adopted yet, but low cost / no downside.

## Step 6 — Content structuring for extraction
AI answer engines quote/paraphrase content that reads well in isolation. Rewrite key pages so:
- [ ] Headers are phrased as questions or clear topic statements (matches how people prompt AI)
- [ ] The first 1-2 sentences under each header directly answer it (don't bury the answer)
- [ ] Use bullet lists / tables for comparable data — easier for both crawlers and AI to parse than prose paragraphs
- [ ] Avoid content that only makes sense with surrounding context (AI often extracts single paragraphs)

## Step 7 — Performance (Core Web Vitals — still a Google ranking factor)
- [ ] Use `next/image` for all images (auto WebP/AVIF, lazy loading)
- [ ] Use `next/font` to avoid layout shift from web fonts
- [ ] Run Lighthouse / PageSpeed Insights — target LCP < 2.5s, CLS < 0.1

## Step 8 — Off-site signals (matters more for AI than classic SEO)
AI systems often weight third-party mentions (Reddit, review sites, industry directories) as heavily as your own site. This isn't fixable in-repo, but flag it as a to-do outside the codebase: getting cited/reviewed elsewhere improves how often AI tools surface you.

---

## Verification checklist (run after any SEO pass)
- [ ] `curl -A "GPTBot"` returns full content for key pages
- [ ] Google Rich Results Test passes for all structured data
- [ ] Search Console: sitemap submitted, no crawl errors
- [ ] Social link preview renders correctly (OG tags)
- [ ] Lighthouse SEO score ≥ 95