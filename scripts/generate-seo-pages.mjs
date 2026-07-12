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

function chapterSlug(chapter) {
  return `part-${chapterNumberForSlug(chapter.num)}-${slugify(chapter.title)}`;
}

function chapterTitle(chapter) {
  return `Part ${chapter.num}: ${chapter.title}`;
}

function descriptionForChapter(chapter) {
  return cleanWhitespace(`Read ${chapterTitle(chapter)} from ${SITE_NAME}. ${teaser(chapter.body, 110)}`);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function pathToUrl(urlPath) {
  return `${SITE_URL}${urlPath}`;
}

function outputPathFor(urlPath) {
  if (urlPath === '/') return path.join(ROOT, 'index.html');
  const trimmed = urlPath.replace(/^\//, '').replace(/\/$/, '');
  return path.join(ROOT, trimmed, 'index.html');
}

function writePage(urlPath, html) {
  const filePath = outputPathFor(urlPath);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, html);
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
      --accent-strong: #f0c983;
      --border: rgba(215, 179, 116, 0.22);
      --shadow: 0 18px 50px rgba(0,0,0,0.35);
      --max: 1000px;
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
    a { color: var(--accent-strong); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .wrap { width: min(calc(100% - 32px), var(--max)); margin: 0 auto; }
    .topnav {
      position: sticky;
      top: 0;
      z-index: 10;
      backdrop-filter: blur(10px);
      background: rgba(9, 6, 5, 0.78);
      border-bottom: 1px solid var(--border);
    }
    .topnav-inner {
      width: min(calc(100% - 32px), var(--max));
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 14px 0;
    }
    .brand {
      color: var(--text);
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .navlinks {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      justify-content: flex-end;
      font-size: 0.95rem;
    }
    .hero {
      padding: 54px 0 28px;
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
    h1 { font-size: clamp(2.1rem, 5vw, 3.5rem); }
    h2 { font-size: clamp(1.45rem, 3vw, 2.15rem); margin-top: 0; }
    h3 { font-size: 1.2rem; }
    p { margin: 0 0 1rem; }
    p.lead {
      font-size: 1.08rem;
      color: var(--muted);
      max-width: 72ch;
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
    .stack { display: grid; gap: 20px; }
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
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
    .info-card, .chapter-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 18px;
    }
    .info-card h3, .chapter-card h3 { margin-bottom: 10px; }
    .info-card p, .chapter-card p { color: var(--muted); }
    .list, .link-list {
      margin: 0;
      padding-left: 1.2rem;
    }
    .list li, .link-list li { margin: 0 0 0.55rem; }
    .callout {
      background: rgba(215, 179, 116, 0.08);
      border-left: 4px solid rgba(215, 179, 116, 0.65);
      padding: 16px 18px;
      border-radius: 14px;
      color: var(--muted);
    }
    .quote {
      margin: 0;
      padding: 16px 18px;
      border-radius: 14px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      color: var(--muted);
      font-style: italic;
    }
    .section-title {
      margin-bottom: 10px;
    }
    .small { color: var(--muted); font-size: 0.93rem; }
    .pager {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 28px;
      flex-wrap: wrap;
    }
    footer {
      padding: 26px 0 60px;
      color: var(--muted);
      border-top: 1px solid var(--border);
    }
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 18px;
      margin-top: 10px;
      font-size: 0.95rem;
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

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: 'en',
  };
}

function webPageSchema({ pageType = 'WebPage', name, url, description }) {
  return {
    '@context': 'https://schema.org',
    '@type': pageType,
    name,
    url,
    description,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
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

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const rawChapters = extractChapters(indexHtml);
const chapters = rawChapters.map((chapter) => ({
  ...chapter,
  slug: chapterSlug(chapter),
}));
const chapterByNum = new Map(chapters.map((chapter) => [chapter.num, chapter]));

const pageCatalog = {
  about: {
    href: '/about/',
    label: 'About',
    title: 'About The Legends of Ren Zu Reader | The Omniarch',
    blurb: 'What this site is, why the search-friendly layer exists, and how it connects to the immersive reader.',
  },
  guidesHub: {
    href: '/guides/',
    label: 'Guides',
    title: 'Legends of Ren Zu Guides | Ren Zu, Hope Gu, Fate, and Reading Order',
    blurb: 'A hub for beginner-friendly guides, reading order, character context, and theme explainers.',
  },
  readingOrder: {
    href: '/guides/reading-order/',
    label: 'Reading order',
    title: 'Legends of Ren Zu Reading Order | Chapter Guide and Best Place to Start',
    blurb: 'Where to start, what the combined chapter labels mean, and how to move between the archive and the immersive reader.',
  },
  renZu: {
    href: '/characters/ren-zu/',
    label: 'Ren Zu',
    title: 'Who Is Ren Zu? | The Legends of Ren Zu Character Guide',
    blurb: 'A quick guide to Ren Zu, humanity’s first ancestor, and why he matters across the entire work.',
  },
  charactersHub: {
    href: '/characters/',
    label: 'Characters',
    title: 'Legends of Ren Zu Characters | Starting Character Guide',
    blurb: 'A clean starting point for character-focused pages, beginning with Ren Zu himself.',
  },
  themesHub: {
    href: '/themes/',
    label: 'Themes',
    title: 'Legends of Ren Zu Themes | Hope, Fate, Freedom, Wisdom, and Self',
    blurb: 'Theme pages explaining the major ideas that repeat through the legends.',
  },
  hopeGu: {
    href: '/themes/hope-gu/',
    label: 'Hope Gu',
    title: 'Hope Gu Explained | The Legends of Ren Zu Theme Guide',
    blurb: 'Why Hope Gu matters, what it represents, and where it shapes the story most strongly.',
  },
  fateFreedom: {
    href: '/themes/fate-and-freedom/',
    label: 'Fate and Freedom',
    title: 'Fate and Freedom in The Legends of Ren Zu | Theme Guide',
    blurb: 'A guide to Fate Gu, rebellion, and the long struggle for freedom.',
  },
  wisdomStrengthSelf: {
    href: '/themes/wisdom-strength-and-self/',
    label: 'Wisdom, Strength, and Self',
    title: 'Wisdom, Strength, and Self in The Legends of Ren Zu | Theme Guide',
    blurb: 'How Strength Gu, Wisdom Gu, and Self Gu frame growth, identity, and human effort.',
  },
  faq: {
    href: '/faq/',
    label: 'FAQ',
    title: 'Legends of Ren Zu FAQ | Chapters, Ren Zu, Hope Gu, and Reading Guide',
    blurb: 'Short answers to the questions new readers and searchers usually ask first.',
  },
};

const navItems = [
  { href: '/chapters/', label: 'Chapters' },
  { href: '/guides/', label: 'Guides' },
  { href: '/themes/', label: 'Themes' },
  { href: '/characters/', label: 'Characters' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/about/', label: 'About' },
];

function navHtml() {
  return `
    <div class="topnav">
      <div class="topnav-inner">
        <a class="brand" href="/">${SITE_NAME}</a>
        <div class="navlinks">
          ${navItems.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function footerHtml() {
  return `
    <footer>
      <div class="wrap">
        <div>${SITE_NAME} · ${BRAND}</div>
        <div class="footer-links">
          <a href="/">Immersive reader</a>
          <a href="/chapters/">Chapter archive</a>
          <a href="/guides/">Guides</a>
          <a href="/themes/">Themes</a>
          <a href="/characters/">Characters</a>
          <a href="/faq/">FAQ</a>
          <a href="/about/">About</a>
        </div>
      </div>
    </footer>
  `;
}

function renderPage({ canonicalPath, title, description, heroEyebrow, heroTitle, heroLead, bodyHtml, type = 'website', schema = [] }) {
  const head = baseHead({ title, description, canonicalUrl: pathToUrl(canonicalPath), type });
  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  ${navHtml()}
  <header class="hero">
    <div class="wrap">
      <div class="eyebrow">${htmlEscape(heroEyebrow)}</div>
      <h1>${htmlEscape(heroTitle)}</h1>
      <p class="lead">${htmlEscape(heroLead)}</p>
      <div class="actions">
        <a class="button primary" href="/">Open immersive reader</a>
        <a class="button" href="/chapters/">Browse chapters</a>
        <a class="button" href="/guides/">Open guides</a>
      </div>
    </div>
  </header>
  <main class="wrap stack">
    ${bodyHtml}
  </main>
  ${footerHtml()}
</body>
</html>`;
}

function guideCardHtml(key) {
  const page = pageCatalog[key];
  return `
    <article class="info-card">
      <div class="eyebrow">${htmlEscape(page.label)}</div>
      <h3><a href="${page.href}">${htmlEscape(page.title.replace(` | ${SITE_NAME}`, '').replace(' | The Omniarch', ''))}</a></h3>
      <p>${htmlEscape(page.blurb)}</p>
      <a href="${page.href}">Open page</a>
    </article>
  `;
}

function guideGrid(keys) {
  return `<div class="grid">${keys.map(guideCardHtml).join('')}</div>`;
}

function chapterLink(num, label = null) {
  const chapter = chapterByNum.get(num);
  if (!chapter) return '';
  return `<a href="/chapters/${chapter.slug}/">${htmlEscape(label || chapterTitle(chapter))}</a>`;
}

function chapterReferenceList(items) {
  const rows = items
    .map((item) => {
      if (typeof item === 'string') return chapterLink(item);
      return chapterLink(item.num, item.label);
    })
    .filter(Boolean)
    .map((link) => `<li>${link}</li>`)
    .join('');
  return `<ul class="link-list">${rows}</ul>`;
}

function chapterQuickCards(chapter) {
  const text = chapter.body.toLowerCase();
  const keys = ['renZu'];
  if (text.includes('hope')) keys.push('hopeGu');
  if (text.includes('fate') || text.includes('freedom')) keys.push('fateFreedom');
  if (text.includes('wisdom') || text.includes('strength') || text.includes('self gu') || text.includes(' self ')) keys.push('wisdomStrengthSelf');
  keys.push('guidesHub');
  const unique = [...new Set(keys)].slice(0, 4);
  return guideGrid(unique);
}

function chapterArchivePage() {
  const canonicalPath = '/chapters/';
  const title = `${SITE_NAME} Chapters | Archive, Reader, Reading Order, and Lore Guide`;
  const description = `Browse every available chapter entry from ${SITE_NAME}, then jump into reading guides, theme explainers, and the immersive Omniarch reader.`;
  const schema = [
    websiteSchema(),
    bookSchema({ url: `${SITE_URL}/`, description: `${SITE_NAME} by ${AUTHOR}.` }),
    webPageSchema({ pageType: 'CollectionPage', name: title, url: pathToUrl(canonicalPath), description }),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Chapters', url: pathToUrl(canonicalPath) },
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

  const bodyHtml = `
    <section class="card">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <span>Chapters</span>
      </nav>
      <div class="meta">
        <span>${chapters.length} indexed entries</span>
        <span>Original work reference: Reverend Insanity</span>
        <span>Author: ${AUTHOR}</span>
      </div>
      <p class="small">This archive is the search-friendly layer built around the fragile main reader. It gives Google stable URLs, while still sending human readers back into the immersive experience whenever they want it.</p>
    </section>
    <section class="card stack">
      <div>
        <div class="eyebrow">Start here</div>
        <h2 class="section-title">Quick guides before you read</h2>
        <p class="small">If someone lands here from search, these supporting pages help them understand Ren Zu, Hope Gu, Fate, Freedom, and the best reading order.</p>
      </div>
      ${guideGrid(['guidesHub', 'readingOrder', 'renZu', 'hopeGu', 'fateFreedom', 'faq'])}
    </section>
    <section class="card stack">
      <div>
        <div class="eyebrow">Archive</div>
        <h2 class="section-title">All available chapters</h2>
      </div>
      <div class="grid">${cards}</div>
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: `${SITE_NAME} · Chapter Archive`,
    heroTitle: `${SITE_NAME} Chapters`,
    heroLead: 'Explore the available entries, open any chapter on its own search-friendly page, or move through the supporting guides before jumping back into the full reader.',
    bodyHtml,
    schema,
  });
}

function chapterPage(chapter, index) {
  const canonicalPath = `/chapters/${chapter.slug}/`;
  const title = `${chapterTitle(chapter)} | ${SITE_NAME}`;
  const description = descriptionForChapter(chapter);
  const paragraphs = paragraphize(chapter.body).map((p) => `<p>${htmlEscape(p)}</p>`).join('\n');
  const prev = chapters[index - 1];
  const next = chapters[index + 1];

  const schema = [
    websiteSchema(),
    bookSchema({ url: `${SITE_URL}/`, description: `${SITE_NAME} by ${AUTHOR}.` }),
    {
      '@context': 'https://schema.org',
      '@type': 'Chapter',
      name: chapterTitle(chapter),
      headline: chapterTitle(chapter),
      url: pathToUrl(canonicalPath),
      description,
      author: { '@type': 'Person', name: AUTHOR },
      isPartOf: {
        '@type': 'Book',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        author: { '@type': 'Person', name: AUTHOR },
      },
      inLanguage: 'en',
    },
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Chapters', url: `${SITE_URL}/chapters/` },
      { name: chapterTitle(chapter), url: pathToUrl(canonicalPath) },
    ]),
  ];

  const bodyHtml = `
    <section class="card">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <a href="/chapters/">Chapters</a>
        <span>›</span>
        <span>${htmlEscape(chapterTitle(chapter))}</span>
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
          ${prev ? `<div class="small">Previous</div>${chapterLink(prev.num)}` : ''}
        </div>
        <div style="text-align:right">
          ${next ? `<div class="small">Next</div>${chapterLink(next.num)}` : ''}
        </div>
      </div>
    </section>
    <section class="card stack">
      <div>
        <div class="eyebrow">Explore more</div>
        <h2 class="section-title">Related guides for this chapter</h2>
        <p class="small">These pages are original guide pages designed to support related searches and help readers understand the major ideas surrounding this chapter.</p>
      </div>
      ${chapterQuickCards(chapter)}
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: SITE_NAME,
    heroTitle: chapterTitle(chapter),
    heroLead: description,
    bodyHtml,
    type: 'article',
    schema,
  });
}

const faqEntries = [
  {
    q: 'What is The Legends of Ren Zu?',
    a: 'It is a mythic narrative associated with Reverend Insanity that follows Ren Zu, the ancestor of humanity, as he struggles against suffering, limitation, and fate itself.',
  },
  {
    q: 'Who is Ren Zu?',
    a: 'Ren Zu is the first human and the central figure of the legends. He is presented as a primordial ancestor whose life becomes a chain of bargains, losses, revelations, and acts of defiance.',
  },
  {
    q: 'What is Hope Gu?',
    a: 'Hope Gu is one of the most important symbolic Gu in the entire work. It repeatedly represents the ability to keep moving through despair even after strength, wisdom, and certainty fail.',
  },
  {
    q: 'Do I need to read the chapters in order?',
    a: 'Yes. The cleanest reading order is from Part 1 onward, because later entries build on earlier symbols, family relationships, and philosophical themes.',
  },
  {
    q: 'Why does this site have separate chapter pages and an immersive reader?',
    a: 'The immersive reader is the richer reading experience for people. The separate static chapter pages exist so search engines can crawl and understand the content more clearly.',
  },
  {
    q: 'Why does Google still say some pages are unknown?',
    a: 'That is normal right after a sitemap submission or indexing request. Search Console often needs time to process the sitemap, crawl the pages, and refresh its reports.',
  },
];

function aboutPage() {
  const canonicalPath = '/about/';
  const title = pageCatalog.about.title;
  const description = 'Learn what this reader project is, why the search-friendly pages exist, and how they fit around the main Legends of Ren Zu experience.';
  const schema = [
    websiteSchema(),
    webPageSchema({ pageType: 'AboutPage', name: title, url: pathToUrl(canonicalPath), description }),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'About', url: pathToUrl(canonicalPath) },
    ]),
  ];

  const bodyHtml = `
    <section class="card stack">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <span>About</span>
      </nav>
      <div class="callout">This site now has two layers: the immersive reader for human experience and a stable static page layer for search engines, direct linking, and discoverability.</div>
      <div>
        <h2 class="section-title">Why this site exists</h2>
        <p>The Omniarch reader was designed to feel atmospheric and premium. That works well for readers, but search engines prefer stable pages with plain HTML, individual titles, and internal links. The search layer was added so the project can compete for branded and related queries without tearing apart the existing reader.</p>
        <p>In other words, the chapter archive, guides, character pages, and theme explainers are here to make the site easier to discover, easier to share, and easier to understand at a glance.</p>
      </div>
      <div>
        <h2 class="section-title">What to use first</h2>
        <ul class="list">
          <li>Use the immersive reader when you want the full experience.</li>
          <li>Use the chapter archive when you want direct chapter URLs.</li>
          <li>Use the guides if you arrived from search and need context first.</li>
          <li>Use the FAQ if you want the shortest answers possible.</li>
        </ul>
      </div>
      ${guideGrid(['guidesHub', 'readingOrder', 'faq'])}
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'About this project',
    heroTitle: 'Why the site now has a search-friendly layer',
    heroLead: 'The main reader stays intact, while supporting pages make the project easier to discover, crawl, and rank.',
    bodyHtml,
    schema,
  });
}

function guidesHubPage() {
  const canonicalPath = '/guides/';
  const title = pageCatalog.guidesHub.title;
  const description = 'Open beginner-friendly guides for Ren Zu, Hope Gu, Fate, Freedom, reading order, and the major ideas behind The Legends of Ren Zu.';
  const schema = [
    websiteSchema(),
    webPageSchema({ pageType: 'CollectionPage', name: title, url: pathToUrl(canonicalPath), description }),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: pathToUrl(canonicalPath) },
    ]),
  ];

  const bodyHtml = `
    <section class="card stack">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <span>Guides</span>
      </nav>
      <div class="callout">These pages are written as original companion material. Their job is to answer the questions people actually search for before they commit to reading the full text.</div>
      <div>
        <h2 class="section-title">Start here</h2>
        <p>If someone searched for Ren Zu, Hope Gu, Fate Gu, or simply wanted to know where to begin, these are the right entry points.</p>
      </div>
      ${guideGrid(['readingOrder', 'renZu', 'hopeGu', 'fateFreedom', 'wisdomStrengthSelf', 'faq', 'about'])}
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Guide hub',
    heroTitle: 'Legends of Ren Zu guides and explainers',
    heroLead: 'A clean hub for new readers, search visitors, and anyone who wants context before diving deeper.',
    bodyHtml,
    schema,
  });
}

function readingOrderPage() {
  const canonicalPath = '/guides/reading-order/';
  const title = pageCatalog.readingOrder.title;
  const description = 'Use this reading order page to start The Legends of Ren Zu from the right place and understand the combined part labels in the archive.';
  const schema = [
    websiteSchema(),
    webPageSchema({ pageType: 'Article', name: title, url: pathToUrl(canonicalPath), description }),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Reading order', url: pathToUrl(canonicalPath) },
    ]),
  ];

  const bodyHtml = `
    <section class="card stack">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <a href="/guides/">Guides</a>
        <span>›</span>
        <span>Reading order</span>
      </nav>
      <div>
        <h2 class="section-title">Best place to start</h2>
        <p>The best place to begin is simple: start at Part 1 and keep moving forward. The later entries make more sense when you experience the symbolic development in order.</p>
      </div>
      <div>
        <h2 class="section-title">How the archive is labeled</h2>
        <ul class="list">
          <li>Most entries are single numbered parts.</li>
          <li>Part 4 &amp; 5 and Part 10 &amp; 11 are combined entries in the archive.</li>
          <li>The archive ends at Part 44 in the current site version.</li>
        </ul>
      </div>
      <div>
        <h2 class="section-title">Suggested first clicks</h2>
        ${chapterReferenceList(['1', '2', '3', '4 & 5', '12', '34', '44'])}
      </div>
      <div class="callout">If you want atmosphere and reader features, open the immersive reader. If you want stable URLs for revisiting, use the chapter archive pages.</div>
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Reading guide',
    heroTitle: 'Best reading order for The Legends of Ren Zu',
    heroLead: 'Start with Part 1, read forward, and use this page whenever you need a clean overview of the archive structure.',
    bodyHtml,
    schema,
  });
}

function charactersHubPage() {
  const canonicalPath = '/characters/';
  const title = pageCatalog.charactersHub.title;
  const description = 'A starting character hub for The Legends of Ren Zu, beginning with Ren Zu and expanding as the project grows.';
  const schema = [
    websiteSchema(),
    webPageSchema({ pageType: 'CollectionPage', name: title, url: pathToUrl(canonicalPath), description }),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Characters', url: pathToUrl(canonicalPath) },
    ]),
  ];

  const bodyHtml = `
    <section class="card stack">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <span>Characters</span>
      </nav>
      <p class="small">This hub starts with the single most important character page on the site: Ren Zu. More character pages can be added later without changing the reader itself.</p>
      ${guideGrid(['renZu'])}
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Character hub',
    heroTitle: 'Character pages for The Legends of Ren Zu',
    heroLead: 'Start with Ren Zu, the ancestor figure whose life and choices define the entire work.',
    bodyHtml,
    schema,
  });
}

function renZuPage() {
  const canonicalPath = '/characters/ren-zu/';
  const title = pageCatalog.renZu.title;
  const description = 'Who is Ren Zu? This page explains his role as the first human, why he matters, and where to start reading his story.';
  const schema = [
    websiteSchema(),
    webPageSchema({ pageType: 'Article', name: title, url: pathToUrl(canonicalPath), description }),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Characters', url: `${SITE_URL}/characters/` },
      { name: 'Ren Zu', url: pathToUrl(canonicalPath) },
    ]),
  ];

  const bodyHtml = `
    <section class="card stack">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <a href="/characters/">Characters</a>
        <span>›</span>
        <span>Ren Zu</span>
      </nav>
      <div>
        <h2 class="section-title">Who Ren Zu is</h2>
        <p>Ren Zu is the foundational human figure in the legends: the first ancestor, the center of the book, and the lens through which the work explores suffering, courage, loneliness, desire, and rebellion. He is not just a protagonist in the ordinary sense. He functions as the symbolic ancestor whose life becomes a map of human struggle.</p>
      </div>
      <div>
        <h2 class="section-title">Why he matters so much</h2>
        <ul class="list">
          <li>He bargains with concepts that become Gu.</li>
          <li>He keeps losing certainty, then rebuilding purpose.</li>
          <li>He stands at the center of the conflict between fate and freedom.</li>
          <li>His story ties together hope, wisdom, strength, selfhood, and sacrifice.</li>
        </ul>
      </div>
      <blockquote class="quote">If you only understand one figure in the legends, understand Ren Zu first. Almost every major theme bends back toward him.</blockquote>
      <div>
        <h2 class="section-title">Best chapters to start with for Ren Zu</h2>
        ${chapterReferenceList(['1', '2', '21', '34', '39', '44'])}
      </div>
      ${guideGrid(['hopeGu', 'fateFreedom', 'wisdomStrengthSelf'])}
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Character guide',
    heroTitle: 'Who is Ren Zu?',
    heroLead: 'Ren Zu is the ancestor of humanity and the emotional center of the legends: a figure defined by hardship, insight, and refusal to surrender.',
    bodyHtml,
    schema,
  });
}

function themesHubPage() {
  const canonicalPath = '/themes/';
  const title = pageCatalog.themesHub.title;
  const description = 'Theme pages for The Legends of Ren Zu covering Hope Gu, Fate, Freedom, Wisdom, Strength, and Self.';
  const schema = [
    websiteSchema(),
    webPageSchema({ pageType: 'CollectionPage', name: title, url: pathToUrl(canonicalPath), description }),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Themes', url: pathToUrl(canonicalPath) },
    ]),
  ];

  const bodyHtml = `
    <section class="card stack">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <span>Themes</span>
      </nav>
      <div class="callout">These pages are not replacements for the chapters. They are companion explainers that make the recurring ideas easier to track across the archive.</div>
      ${guideGrid(['hopeGu', 'fateFreedom', 'wisdomStrengthSelf'])}
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Theme hub',
    heroTitle: 'Major themes in The Legends of Ren Zu',
    heroLead: 'Hope, fate, freedom, wisdom, strength, and selfhood recur constantly. These pages help new readers track those patterns.',
    bodyHtml,
    schema,
  });
}

function hopeGuPage() {
  const canonicalPath = '/themes/hope-gu/';
  const title = pageCatalog.hopeGu.title;
  const description = 'Hope Gu is one of the core symbolic forces in The Legends of Ren Zu. This guide explains what it means and where it matters most.';
  const schema = [
    websiteSchema(),
    webPageSchema({ pageType: 'Article', name: title, url: pathToUrl(canonicalPath), description }),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Themes', url: `${SITE_URL}/themes/` },
      { name: 'Hope Gu', url: pathToUrl(canonicalPath) },
    ]),
  ];

  const bodyHtml = `
    <section class="card stack">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <a href="/themes/">Themes</a>
        <span>›</span>
        <span>Hope Gu</span>
      </nav>
      <div>
        <h2 class="section-title">Why Hope Gu stands out</h2>
        <p>Hope Gu appears early, but it never really leaves the architecture of the work. It represents the thing that still moves when everything else has already failed: not certainty, not victory, but the refusal to stop.</p>
      </div>
      <div>
        <h2 class="section-title">What it symbolizes</h2>
        <ul class="list">
          <li>Endurance under hopeless conditions.</li>
          <li>Movement before clarity arrives.</li>
          <li>The emotional spark that keeps humans facing Predicament.</li>
          <li>A kind of inner light that outlives comfort.</li>
        </ul>
      </div>
      <div>
        <h2 class="section-title">Chapters where Hope Gu matters most</h2>
        ${chapterReferenceList(['1', '2', '17', '39'])}
      </div>
      ${guideGrid(['renZu', 'fateFreedom', 'faq'])}
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Theme guide',
    heroTitle: 'Hope Gu explained',
    heroLead: 'Hope Gu is not just a plot element. It is one of the clearest statements of how the legends understand persistence under suffering.',
    bodyHtml,
    schema,
  });
}

function fateFreedomPage() {
  const canonicalPath = '/themes/fate-and-freedom/';
  const title = pageCatalog.fateFreedom.title;
  const description = 'This page explains the long tension between Fate Gu, human resistance, and the desire for freedom across The Legends of Ren Zu.';
  const schema = [
    websiteSchema(),
    webPageSchema({ pageType: 'Article', name: title, url: pathToUrl(canonicalPath), description }),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Themes', url: `${SITE_URL}/themes/` },
      { name: 'Fate and Freedom', url: pathToUrl(canonicalPath) },
    ]),
  ];

  const bodyHtml = `
    <section class="card stack">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <a href="/themes/">Themes</a>
        <span>›</span>
        <span>Fate and Freedom</span>
      </nav>
      <div>
        <h2 class="section-title">The central conflict</h2>
        <p>One of the strongest long-form tensions in the legends is the clash between Fate Gu and the human desire for freedom. Fate implies that structures already exist above the individual; freedom is the insistence that one can still choose, resist, or overturn those structures.</p>
      </div>
      <div>
        <h2 class="section-title">Why this theme matters</h2>
        <p>This is the axis that turns the legends from moral fable into existential struggle. The more Ren Zu resists submission, the more the story becomes a meditation on whether a human being can truly break what the world has already assigned.</p>
      </div>
      <div>
        <h2 class="section-title">Chapters to read for this theme</h2>
        ${chapterReferenceList(['12', '32', '33', '34', '35', '36'])}
      </div>
      ${guideGrid(['hopeGu', 'renZu', 'wisdomStrengthSelf'])}
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Theme guide',
    heroTitle: 'Fate and freedom',
    heroLead: 'This theme sits near the heart of the project: whether human beings must accept the structure of fate or dare to oppose it.',
    bodyHtml,
    schema,
  });
}

function wisdomStrengthSelfPage() {
  const canonicalPath = '/themes/wisdom-strength-and-self/';
  const title = pageCatalog.wisdomStrengthSelf.title;
  const description = 'This theme guide explains how Strength Gu, Wisdom Gu, and Self Gu shape the ideas of capability, identity, and growth in The Legends of Ren Zu.';
  const schema = [
    websiteSchema(),
    webPageSchema({ pageType: 'Article', name: title, url: pathToUrl(canonicalPath), description }),
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Themes', url: `${SITE_URL}/themes/` },
      { name: 'Wisdom, Strength, and Self', url: pathToUrl(canonicalPath) },
    ]),
  ];

  const bodyHtml = `
    <section class="card stack">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <a href="/themes/">Themes</a>
        <span>›</span>
        <span>Wisdom, Strength, and Self</span>
      </nav>
      <div>
        <h2 class="section-title">Three different forms of power</h2>
        <p>Strength solves immediate survival. Wisdom interprets the world. Self preserves identity when both power and understanding become unstable. Together, these ideas let the legends ask what kind of power really belongs to a human being.</p>
      </div>
      <div>
        <h2 class="section-title">How to think about them</h2>
        <ul class="list">
          <li><strong>Strength</strong> is useful but limited when used without reflection.</li>
          <li><strong>Wisdom</strong> expands possibility, but does not erase suffering.</li>
          <li><strong>Self</strong> becomes crucial when borrowed power is no longer enough.</li>
        </ul>
      </div>
      <div>
        <h2 class="section-title">Chapters to read for this theme</h2>
        ${chapterReferenceList(['1', '2', '3', '16', '26', '43', '44'])}
      </div>
      ${guideGrid(['renZu', 'hopeGu', 'faq'])}
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Theme guide',
    heroTitle: 'Wisdom, strength, and self',
    heroLead: 'These recurring Gu and ideas explain how the legends frame ability, insight, and identity under pressure.',
    bodyHtml,
    schema,
  });
}

function faqPage() {
  const canonicalPath = '/faq/';
  const title = pageCatalog.faq.title;
  const description = 'Short answers to common questions about The Legends of Ren Zu, its chapter archive, Ren Zu, Hope Gu, and the reading order.';
  const schema = [
    websiteSchema(),
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntries.map((entry) => ({
        '@type': 'Question',
        name: entry.q,
        acceptedAnswer: { '@type': 'Answer', text: entry.a },
      })),
    },
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'FAQ', url: pathToUrl(canonicalPath) },
    ]),
  ];

  const qaHtml = faqEntries.map((entry) => `
    <article class="info-card">
      <h3>${htmlEscape(entry.q)}</h3>
      <p>${htmlEscape(entry.a)}</p>
    </article>
  `).join('');

  const bodyHtml = `
    <section class="card stack">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <span>FAQ</span>
      </nav>
      <div class="callout">This page exists for people who want answers fast, and for search engines that look for strong question-and-answer signals.</div>
      <div class="grid">${qaHtml}</div>
    </section>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Frequently asked questions',
    heroTitle: 'Legends of Ren Zu FAQ',
    heroLead: 'Short answers for readers, searchers, and anyone trying to understand the site before diving into the full text.',
    bodyHtml,
    schema,
  });
}

writePage('/chapters/', chapterArchivePage());
for (const [index, chapter] of chapters.entries()) {
  writePage(`/chapters/${chapter.slug}/`, chapterPage(chapter, index));
}
writePage('/about/', aboutPage());
writePage('/guides/', guidesHubPage());
writePage('/guides/reading-order/', readingOrderPage());
writePage('/characters/', charactersHubPage());
writePage('/characters/ren-zu/', renZuPage());
writePage('/themes/', themesHubPage());
writePage('/themes/hope-gu/', hopeGuPage());
writePage('/themes/fate-and-freedom/', fateFreedomPage());
writePage('/themes/wisdom-strength-and-self/', wisdomStrengthSelfPage());
writePage('/faq/', faqPage());

const sitemapUrls = [
  `${SITE_URL}/`,
  `${SITE_URL}/about/`,
  `${SITE_URL}/guides/`,
  `${SITE_URL}/guides/reading-order/`,
  `${SITE_URL}/characters/`,
  `${SITE_URL}/characters/ren-zu/`,
  `${SITE_URL}/themes/`,
  `${SITE_URL}/themes/hope-gu/`,
  `${SITE_URL}/themes/fate-and-freedom/`,
  `${SITE_URL}/themes/wisdom-strength-and-self/`,
  `${SITE_URL}/faq/`,
  `${SITE_URL}/chapters/`,
  ...chapters.map((chapter) => `${SITE_URL}/chapters/${chapter.slug}/`),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);

console.log(`Generated ${chapters.length} chapter pages plus Stage 2 guide pages, sitemap.xml, and robots.txt.`);
