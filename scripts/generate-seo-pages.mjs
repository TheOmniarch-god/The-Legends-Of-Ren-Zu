import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SITE_URL = 'https://thelegendsofrenzu.theomniarch.com.ng';
const SITE_NAME = 'The Legends of Ren Zu';
const AUTHOR = 'Gu Zhen Ren';
const BRAND = 'The Omniarch';
const HERO_IMAGE = `${SITE_URL}/icons/icon-512.png`;
const TODAY = new Date().toISOString().slice(0, 10);

function extractChapters(indexHtml) {
  const key = 'window.__CHAPTERS__ = [';
  const start = indexHtml.indexOf(key);
  if (start === -1) throw new Error('Could not find chapter data in index.html');

  let i = start + key.length - 1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let quote = '';

  for (; i < indexHtml.length; i += 1) {
    const ch = indexHtml[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        inString = false;
        quote = '';
      }
      continue;
    }

    if (ch === '"' || ch === '\'' || ch === '`') {
      inString = true;
      quote = ch;
      continue;
    }

    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) break;
    }
  }

  const arraySource = indexHtml.slice(start + 'window.__CHAPTERS__ = '.length, i + 1);
  const chapters = eval(arraySource); // trusted local source from the repository
  if (!Array.isArray(chapters) || chapters.length === 0) throw new Error('Chapter array was empty');
  return chapters;
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function chapterNumberForSlug(num) {
  return slugify(String(num).replace(/\s*&\s*/g, ' '));
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanWhitespace(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function paragraphize(body) {
  return body
    .split(/\n\s*\n+/)
    .map((p) => cleanWhitespace(p))
    .filter(Boolean);
}

function teaser(body, max = 160) {
  const first = paragraphize(body)[0] || cleanWhitespace(body);
  if (first.length <= max) return first;
  return `${first.slice(0, max - 1).trimEnd()}…`;
}

function descriptionForChapter(chapter) {
  return cleanWhitespace(`Read Part ${chapter.num} of ${SITE_NAME}: ${chapter.title}. ${teaser(chapter.body, 110)}`);
}

function chapterSlug(chapter) {
  return `part-${chapterNumberForSlug(chapter.num)}-${slugify(chapter.title)}`;
}

function css() {
  return `
    :root {
      --bg: #0e0a09;
      --panel: #17110f;
      --soft: #221916;
      --text: #efe6d7;
      --muted: #cbbda8;
      --accent: #d7b374;
      --border: rgba(215, 179, 116, 0.22);
      --shadow: 0 18px 50px rgba(0,0,0,0.35);
      --max: 940px;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.75;
      color: var(--text);
      background:
        radial-gradient(circle at top, rgba(104,67,22,0.22), transparent 36%),
        linear-gradient(180deg, #140f0d 0%, #090605 100%);
      min-height: 100vh;
    }
    a { color: #f0c983; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .wrap { width: min(calc(100% - 32px), var(--max)); margin: 0 auto; }
    .hero {
      padding: 48px 0 24px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
    }
    .eyebrow {
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-size: 0.8rem;
      color: var(--accent);
      margin-bottom: 12px;
    }
    h1, h2, h3 { line-height: 1.15; margin: 0 0 16px; }
    h1 { font-size: clamp(2.1rem, 5vw, 3.4rem); }
    h2 { font-size: clamp(1.5rem, 3vw, 2.1rem); margin-top: 40px; }
    p.lead {
      font-size: 1.08rem;
      color: var(--muted);
      max-width: 70ch;
      margin: 0 0 22px;
    }
    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 22px;
    }
    .button {
      display: inline-block;
      padding: 12px 18px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: rgba(215, 179, 116, 0.08);
      color: var(--text);
      font-weight: 600;
      box-shadow: var(--shadow);
    }
    .button.primary {
      background: linear-gradient(180deg, rgba(215,179,116,0.25), rgba(215,179,116,0.12));
    }
    main { padding: 30px 0 70px; }
    .card {
      background: rgba(23,17,15,0.9);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      box-shadow: var(--shadow);
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 18px;
      color: var(--muted);
      font-size: 0.96rem;
      margin: 8px 0 18px;
    }
    .breadcrumbs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 0.95rem;
      color: var(--muted);
      margin-bottom: 18px;
    }
    .chapter-body p { margin: 0 0 1.1rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 26px;
    }
    .chapter-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 18px;
    }
    .chapter-card h3 { font-size: 1.2rem; margin-bottom: 10px; }
    .chapter-card p { margin: 0 0 12px; color: var(--muted); }
    .pager {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 28px;
      flex-wrap: wrap;
    }
    .small { color: var(--muted); font-size: 0.92rem; }
    footer {
      padding: 26px 0 60px;
      color: var(--muted);
      border-top: 1px solid var(--border);
    }
  `;
}

function baseHead({ title, description, canonicalUrl, type = 'website' }) {
  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${htmlEscape(title)}</title>
    <meta name="description" content="${htmlEscape(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
    <link rel="canonical" href="${htmlEscape(canonicalUrl)}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${htmlEscape(title)}" />
    <meta property="og:description" content="${htmlEscape(description)}" />
    <meta property="og:url" content="${htmlEscape(canonicalUrl)}" />
    <meta property="og:image" content="${HERO_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${htmlEscape(title)}" />
    <meta name="twitter:description" content="${htmlEscape(description)}" />
    <meta name="twitter:image" content="${HERO_IMAGE}" />
    <link rel="icon" href="/icons/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <style>${css()}</style>
  `;
}

function bookSchema(extra = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: SITE_NAME,
    author: { '@type': 'Person', name: AUTHOR },
    publisher: { '@type': 'Organization', name: BRAND },
    inLanguage: 'en',
    image: HERO_IMAGE,
    ...extra,
  };
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function homePage() {
  const url = `${SITE_URL}/chapters/`;
  const title = `${SITE_NAME} Chapters | Archive, Reader, and Lore Guide`;
  const description = `Browse every available chapter entry from ${SITE_NAME}, then open the immersive reader, audio mode, annotations, and discussion experience on ${BRAND}.`;
  const head = baseHead({ title, description, canonicalUrl: url });
  const schema = [
    bookSchema({ url, description, numberOfPages: undefined }),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${SITE_NAME} Chapters`,
      url,
      description,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    },
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Chapters', url },
    ]),
  ];

  const cards = chapters.map((chapter) => `
    <article class="chapter-card">
      <div class="eyebrow">Part ${htmlEscape(chapter.num)}</div>
      <h3><a href="/chapters/${chapter.slug}/">${htmlEscape(chapter.title)}</a></h3>
      <p>${htmlEscape(teaser(chapter.body, 180))}</p>
      <a href="/chapters/${chapter.slug}/">Read chapter page</a>
    </article>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <div class="eyebrow">${SITE_NAME} · Chapter Archive</div>
      <h1>${SITE_NAME} Chapters</h1>
      <p class="lead">Explore the available entries, open any chapter on its own search-friendly page, or jump into the full immersive reader on ${BRAND}.</p>
      <div class="actions">
        <a class="button primary" href="/">Open immersive reader</a>
        <a class="button" href="https://theomniarch.com.ng/" rel="noopener noreferrer">Visit ${BRAND}</a>
      </div>
    </div>
  </header>
  <main class="wrap">
    <section class="card">
      <div class="meta">
        <span>${chapters.length} indexed entries</span>
        <span>Original work reference: Reverend Insanity</span>
        <span>Author: ${AUTHOR}</span>
      </div>
      <p class="small">Each chapter page includes its own title tag, description, canonical URL, structured data, and internal navigation. That gives search engines real pages to index without touching the fragile main reader experience.</p>
      <div class="grid">${cards}</div>
    </section>
  </main>
  <footer>
    <div class="wrap">
      <div>${SITE_NAME} · ${BRAND}</div>
    </div>
  </footer>
</body>
</html>`;
}

function chapterPage(chapter, index) {
  const url = `${SITE_URL}/chapters/${chapter.slug}/`;
  const title = `Part ${chapter.num}: ${chapter.title} | ${SITE_NAME}`;
  const description = descriptionForChapter(chapter);
  const head = baseHead({ title, description, canonicalUrl: url, type: 'article' });
  const paragraphs = paragraphize(chapter.body).map((p) => `<p>${htmlEscape(p)}</p>`).join('\n');
  const prev = chapters[index - 1];
  const next = chapters[index + 1];

  const schema = [
    bookSchema({ url: `${SITE_URL}/`, description: `${SITE_NAME} by ${AUTHOR}.` }),
    {
      '@context': 'https://schema.org',
      '@type': 'Chapter',
      name: `Part ${chapter.num}: ${chapter.title}`,
      headline: `Part ${chapter.num}: ${chapter.title}`,
      url,
      description,
      isPartOf: {
        '@type': 'Book',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        author: { '@type': 'Person', name: AUTHOR },
      },
      author: { '@type': 'Person', name: AUTHOR },
      inLanguage: 'en',
    },
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Chapters', url: `${SITE_URL}/chapters/` },
      { name: `Part ${chapter.num}: ${chapter.title}`, url },
    ]),
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <div class="eyebrow">${SITE_NAME}</div>
      <h1>Part ${htmlEscape(chapter.num)}: ${htmlEscape(chapter.title)}</h1>
      <p class="lead">${htmlEscape(description)}</p>
      <div class="actions">
        <a class="button primary" href="/#chapter-${encodeURIComponent(chapter.num)}">Open in immersive reader</a>
        <a class="button" href="/chapters/">Browse all chapters</a>
      </div>
    </div>
  </header>
  <main class="wrap">
    <article class="card">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <a href="/chapters/">Chapters</a>
        <span>›</span>
        <span>Part ${htmlEscape(chapter.num)}</span>
      </nav>
      <div class="meta">
        <span>Part ${htmlEscape(chapter.num)}</span>
        <span>${htmlEscape(AUTHOR)}</span>
        <span>${htmlEscape(BRAND)} reader companion</span>
      </div>
      <div class="chapter-body">
        ${paragraphs}
      </div>
      <div class="pager">
        <div>
          ${prev ? `<div class="small">Previous</div><a href="/chapters/${prev.slug}/">Part ${htmlEscape(prev.num)}: ${htmlEscape(prev.title)}</a>` : ''}
        </div>
        <div style="text-align:right">
          ${next ? `<div class="small">Next</div><a href="/chapters/${next.slug}/">Part ${htmlEscape(next.num)}: ${htmlEscape(next.title)}</a>` : ''}
        </div>
      </div>
    </article>
  </main>
  <footer>
    <div class="wrap">
      <div>${SITE_NAME} · Search page layer for the main reader.</div>
    </div>
  </footer>
</body>
</html>`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const rawChapters = extractChapters(indexHtml);
const chapters = rawChapters.map((chapter) => ({
  ...chapter,
  slug: chapterSlug(chapter),
}));

ensureDir(path.join(ROOT, 'chapters'));
fs.writeFileSync(path.join(ROOT, 'chapters', 'index.html'), homePage());

for (const [index, chapter] of chapters.entries()) {
  const dir = path.join(ROOT, 'chapters', chapter.slug);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), chapterPage(chapter, index));
}

const sitemapUrls = [
  `${SITE_URL}/`,
  `${SITE_URL}/chapters/`,
  ...chapters.map((chapter) => `${SITE_URL}/chapters/${chapter.slug}/`),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url><loc>${url}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);

console.log(`Generated ${chapters.length} chapter pages, chapters index, sitemap.xml, and robots.txt.`);
