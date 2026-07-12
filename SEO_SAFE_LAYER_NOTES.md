# Safe SEO Layer Notes

This patch adds a search-friendly layer around the current reader without rewriting the fragile JavaScript app.

## What was changed

### 1) Root page metadata improved
- Better `<title>`
- Better meta description
- `robots` meta tag
- canonical URL
- Open Graph / Twitter improvements
- JSON-LD structured data for `WebSite` and `Book`
- `noscript` fallback pointing to the chapter archive

### 2) New crawlable chapter archive
- `chapters/index.html`
- 42 static chapter entry pages under `chapters/<slug>/index.html`
- Each page has:
  - unique title
  - unique meta description
  - canonical URL
  - Open Graph / Twitter tags
  - JSON-LD structured data
  - internal navigation
  - link back to the immersive reader

### 3) Search engine essentials added
- `robots.txt`
- `sitemap.xml`

### 4) Regeneration script added
- `scripts/generate-seo-pages.mjs`

This script reads the existing `window.__CHAPTERS__` data from `index.html` and regenerates:
- chapter archive
- chapter pages
- sitemap
- robots file

## How to regenerate after editing chapters

From the repo root:

```bash
node scripts/generate-seo-pages.mjs
```

## Why this is safer than a rewrite

It does **not** alter the fragile reader logic.
It adds a parallel static SEO layer that search engines can crawl while users still keep the current app experience.

## Recommended next steps after deploy

1. Deploy the updated repo.
2. Visit:
   - `/robots.txt`
   - `/sitemap.xml`
   - `/chapters/`
   - one sample chapter page
3. Add the site to Google Search Console.
4. Submit `https://thelegendsofrenzu.theomniarch.com.ng/sitemap.xml`.
5. Request indexing for:
   - `/`
   - `/chapters/`
   - first 5 chapter pages

## Important note

If you add or rename chapters in `window.__CHAPTERS__`, run the generator again before deploying.
