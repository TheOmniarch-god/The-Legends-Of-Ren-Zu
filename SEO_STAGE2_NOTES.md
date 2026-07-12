# Stage 2 SEO Expansion Notes

This overlay extends the Stage 1 search layer without touching the fragile reader logic.

## New pages added
- /about/
- /guides/
- /guides/reading-order/
- /characters/
- /characters/ren-zu/
- /themes/
- /themes/hope-gu/
- /themes/fate-and-freedom/
- /themes/wisdom-strength-and-self/
- /faq/

## What Stage 2 improves
- More original supporting content for related searches
- Better internal linking between chapters and guide pages
- Stronger topical structure around Ren Zu, Hope Gu, Fate, Freedom, Wisdom, Strength, and Self
- Expanded sitemap including guide pages

## Regenerate later
From the repo root:

```bash
node scripts/generate-seo-pages.mjs
```

## Safe deployment idea
Overlay these files into the existing repo, commit, then push main.
