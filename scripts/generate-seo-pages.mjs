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
  const chapters = eval(arraySource); // trusted local repository source
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

function teaser(body, max = 170) {
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
  return cleanWhitespace(`Read ${chapterTitle(chapter)} from ${SITE_NAME}. ${teaser(chapter.body, 120)}`);
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
      --paper: #F7F3E8;
      --paper-deep: #EFE8D7;
      --paper-card: #FCFAF2;
      --ink: #15120C;
      --ink-soft: #5B5142;
      --ink-faint: #93897A;
      --seal: #B3331E;
      --seal-soft: rgba(179,51,30,.10);
      --gold: #9C7A1E;
      --gold-line: #D4B25A;
      --line: rgba(21,18,12,.13);
      --line-soft: rgba(21,18,12,.07);
      --shadow: 0 18px 50px rgba(17, 12, 7, 0.08);
      --max: 1180px;
      --radius-lg: 26px;
      --radius-md: 18px;
      --radius-sm: 12px;
      --ease: cubic-bezier(.16,.84,.24,1);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: var(--paper);
      color: var(--ink);
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }
    body::before,
    body::after {
      content: '';
      position: fixed;
      inset: auto;
      pointer-events: none;
      z-index: 0;
      border-radius: 999px;
      filter: blur(70px);
      opacity: .18;
    }
    body::before {
      width: 44vw;
      height: 44vw;
      left: -10vw;
      top: -10vw;
      background: radial-gradient(circle, var(--gold-line), transparent 70%);
    }
    body::after {
      width: 36vw;
      height: 36vw;
      right: -12vw;
      top: 20vh;
      background: radial-gradient(circle, var(--seal), transparent 72%);
      opacity: .10;
    }
    a { color: inherit; text-decoration: none; }
    a:hover { color: var(--seal); }
    img { max-width: 100%; display: block; }
    h1, h2, h3, h4 {
      font-family: 'Unbounded', 'Space Grotesk', sans-serif;
      line-height: 1.08;
      letter-spacing: -0.03em;
      color: var(--ink);
      margin: 0 0 14px;
    }
    h1 { font-size: clamp(2.25rem, 5vw, 4.35rem); }
    h2 { font-size: clamp(1.65rem, 3vw, 2.65rem); }
    h3 { font-size: clamp(1.06rem, 1.35vw, 1.28rem); }
    p { margin: 0 0 1rem; }
    strong { color: var(--ink); }
    .wrap { width: min(calc(100% - 36px), var(--max)); margin: 0 auto; position: relative; z-index: 1; }
    .topnav {
      position: sticky;
      top: 0;
      z-index: 30;
      background: rgba(247,243,232,.86);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--line);
    }
    .topnav-inner {
      width: min(calc(100% - 36px), var(--max));
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      padding: 14px 0;
    }
    .brand {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: .98rem;
      letter-spacing: .01em;
      color: var(--ink);
      white-space: nowrap;
    }
    .navlinks {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 12px;
      color: var(--ink-soft);
      font-size: .95rem;
      font-weight: 500;
    }
    .navlinks a {
      padding: 8px 10px;
      border-radius: 999px;
      transition: background .24s var(--ease), color .24s var(--ease), transform .24s var(--ease);
    }
    .navlinks a:hover {
      background: var(--seal-soft);
      color: var(--seal);
      transform: translateY(-1px);
    }
    .hero {
      border-bottom: 1px solid var(--line);
      background:
        linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0)),
        radial-gradient(circle at top left, rgba(212,178,90,.16), transparent 38%);
    }
    .hero-inner {
      width: min(calc(100% - 36px), var(--max));
      margin: 0 auto;
      padding: 68px 0 34px;
      display: grid;
      gap: 18px;
      position: relative;
      z-index: 1;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--seal);
      font-family: 'Fragment Mono', monospace;
      font-size: .73rem;
      letter-spacing: .16em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .eyebrow::before {
      content: '';
      width: 18px;
      height: 1px;
      background: var(--seal);
      display: inline-block;
    }
    .lead {
      font-size: clamp(1rem, 1.35vw, 1.14rem);
      line-height: 1.72;
      color: var(--ink-soft);
      max-width: 76ch;
      margin: 0;
    }
    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 2px;
    }
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,.62);
      color: var(--ink);
      font-weight: 600;
      font-size: .94rem;
      box-shadow: var(--shadow);
      transition: transform .24s var(--ease), background .24s var(--ease), color .24s var(--ease), border-color .24s var(--ease);
    }
    .button:hover {
      transform: translateY(-2px);
      border-color: rgba(179,51,30,.24);
      background: #fffdf7;
      color: var(--seal);
    }
    .button.primary {
      background: var(--seal);
      color: var(--paper);
      border-color: var(--seal);
    }
    .button.primary:hover {
      background: var(--ink);
      border-color: var(--ink);
      color: var(--paper);
    }
    .chip-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 2px;
    }
    .chip {
      border: 1px solid var(--line);
      background: rgba(255,255,255,.7);
      color: var(--ink-soft);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: .88rem;
      box-shadow: 0 8px 20px rgba(17,12,7,.04);
    }
    main { padding: 30px 0 80px; }
    .stack { display: grid; gap: 18px; }
    .card {
      background: var(--paper-card);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow);
      position: relative;
    }
    .card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      background: linear-gradient(180deg, rgba(255,255,255,.45), transparent 22%);
    }
    .card > * { position: relative; z-index: 1; }
    .card-soft,
    .guide-card,
    .chapter-card,
    .detail-card,
    .stat {
      background: rgba(255,255,255,.66);
      border: 1px solid var(--line-soft);
      border-radius: var(--radius-md);
      box-shadow: 0 10px 24px rgba(17,12,7,.04);
    }
    .card-soft,
    .detail-card,
    .guide-card,
    .chapter-card { padding: 18px; }
    .section-title { margin-bottom: 8px; }
    .small, .muted { color: var(--ink-soft); font-size: .95rem; }
    .breadcrumbs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      color: var(--ink-faint);
      font-size: .94rem;
      margin-bottom: 16px;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 18px;
      color: var(--ink-soft);
      font-size: .94rem;
      margin: 8px 0 18px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-top: 6px;
    }
    .stat { padding: 16px; }
    .stat strong {
      display: block;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.18rem;
      margin-bottom: 4px;
      color: var(--ink);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
    .guide-card p,
    .chapter-card p,
    .detail-card p { color: var(--ink-soft); }
    .guide-card h3,
    .chapter-card h3,
    .detail-card h3 { margin-bottom: 10px; }
    .toc {
      display: grid;
      gap: 10px;
    }
    .toc a {
      display: block;
      padding: 11px 12px;
      border-radius: 12px;
      background: rgba(255,255,255,.7);
      border: 1px solid var(--line-soft);
      color: var(--ink-soft);
      transition: border-color .24s var(--ease), color .24s var(--ease), transform .24s var(--ease);
    }
    .toc a:hover {
      border-color: rgba(179,51,30,.2);
      color: var(--seal);
      transform: translateX(2px);
    }
    .callout {
      background: linear-gradient(180deg, rgba(179,51,30,.08), rgba(156,122,30,.05));
      border: 1px solid rgba(179,51,30,.14);
      border-left: 4px solid var(--seal);
      border-radius: 18px;
      padding: 16px 18px;
      color: var(--ink-soft);
    }
    .quote {
      margin: 0;
      padding: 18px;
      border-radius: 18px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,.7);
      color: var(--ink-soft);
      font-style: italic;
    }
    .two-col {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
      gap: 18px;
    }
    .chapter-body p { margin-bottom: 1rem; color: var(--ink-soft); }
    .chapter-body strong,
    .chapter-body b { color: var(--ink); }
    .pager {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    .faq-item + .faq-item { margin-top: 14px; }
    footer {
      border-top: 1px solid var(--line);
      padding: 28px 0 60px;
      color: var(--ink-soft);
      background: linear-gradient(180deg, transparent, rgba(255,255,255,.35));
    }
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 18px;
      margin-top: 10px;
      font-size: .95rem;
    }
    a:focus-visible, button:focus-visible {
      outline: 2.5px solid var(--seal);
      outline-offset: 3px;
      border-radius: 6px;
    }
    @media (max-width: 860px) {
      .two-col { grid-template-columns: 1fr; }
      .topnav-inner { align-items: flex-start; }
      .navlinks { justify-content: flex-start; }
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
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Fragment+Mono:ital@0;1&display=swap" rel="stylesheet" />
    <link rel="icon" href="/icons/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <style>${css()}</style>
  `;
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
    blurb: 'Why the site has both an immersive reader and a search-friendly knowledge layer.',
  },
  guidesHub: {
    href: '/guides/',
    label: 'Guide hub',
    title: 'Legends of Ren Zu Guides | Reader Guides, Explainers, and Summaries',
    blurb: 'A hub for reading order, summaries, explainers, and beginner-friendly entry points.',
  },
  readingOrder: {
    href: '/guides/reading-order/',
    label: 'Reading order',
    title: 'Legends of Ren Zu Reading Order | Chapter Guide and Best Place to Start',
    blurb: 'Where to begin, how the combined parts work, and the cleanest reading route.',
  },
  renZuSummary: {
    href: '/guides/ren-zu-summary/',
    label: 'Ren Zu summary',
    title: 'Ren Zu Summary | The Legends of Ren Zu Guide',
    blurb: 'A detailed, original summary of Ren Zu as a figure, a mythic protagonist, and a human symbol.',
  },
  legendsExplained: {
    href: '/guides/the-legends-of-ren-zu-explained/',
    label: 'Explained',
    title: 'The Legends of Ren Zu Explained | Beginner Guide',
    blurb: 'A plain-language introduction to what the work is, how to read it, and why it matters.',
  },
  bestChapters: {
    href: '/guides/best-ren-zu-chapters/',
    label: 'Best chapters',
    title: 'Best Ren Zu Chapters to Start With | Reader Guide',
    blurb: 'A curated list of chapters to sample first if you want the strongest emotional and philosophical entry points.',
  },
  hopeMeaning: {
    href: '/guides/hope-gu-meaning/',
    label: 'Hope Gu meaning',
    title: 'Hope Gu Meaning | Key Moments and Theme Guide',
    blurb: 'An original guide to what Hope Gu means and why readers remember it so strongly.',
  },
  charactersHub: {
    href: '/characters/',
    label: 'Characters',
    title: 'Legends of Ren Zu Characters | Starting Character Guide',
    blurb: 'A clean hub for character pages focused on the names readers are most likely to search.',
  },
  renZu: {
    href: '/characters/ren-zu/',
    label: 'Ren Zu',
    title: 'Who Is Ren Zu? | The Legends of Ren Zu Character Guide',
    blurb: 'A full character guide to Ren Zu, humanity’s ancestor and the center of the legends.',
  },
  verdant: {
    href: '/characters/verdant-great-sun/',
    label: 'Verdant Great Sun',
    title: 'Who Is Verdant Great Sun? | Character Guide',
    blurb: 'A guide to Ren Zu’s eldest son, his symbolism, and why his arc matters to the work’s early worldview.',
  },
  desolate: {
    href: '/characters/desolate-ancient-moon/',
    label: 'Desolate Ancient Moon',
    title: 'Who Is Desolate Ancient Moon? | Character Guide',
    blurb: 'A guide to Ren Zu’s daughter, sacrifice, rescue, and the emotional force of filial struggle.',
  },
  northern: {
    href: '/characters/northern-dark-ice-soul/',
    label: 'Northern Dark Ice Soul',
    title: 'Who Is Northern Dark Ice Soul? | Character Guide',
    blurb: 'A guide to one of Ren Zu’s most symbolically charged children: darkness, distance, and difficult purpose.',
  },
  boundless: {
    href: '/characters/boundless-forest-samsara/',
    label: 'Boundless Forest Samsara',
    title: 'Who Is Boundless Forest Samsara? | Character Guide',
    blurb: 'A guide to Boundless Forest Samsara, Ordinary Abyss, scale, horizon, and the politics of limitation.',
  },
  themesHub: {
    href: '/themes/',
    label: 'Themes',
    title: 'Legends of Ren Zu Themes | Hope, Fate, Freedom, Wisdom, Strength, and Self',
    blurb: 'A thematic hub for the big ideas readers search for most often.',
  },
  hopeGu: {
    href: '/themes/hope-gu/',
    label: 'Hope Gu',
    title: 'Hope Gu Explained | The Legends of Ren Zu Theme Guide',
    blurb: 'Why Hope Gu matters, what it symbolizes, and where it shapes the story most strongly.',
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
  fateGu: {
    href: '/themes/fate-gu/',
    label: 'Fate Gu',
    title: 'Fate Gu Explained | The Legends of Ren Zu Theme Guide',
    blurb: 'A focused guide to Fate Gu itself: what it represents and why it towers over the work.',
  },
  freedomGu: {
    href: '/themes/freedom-gu/',
    label: 'Freedom Gu',
    title: 'Freedom Gu Explained | The Legends of Ren Zu Theme Guide',
    blurb: 'A guide to what Freedom Gu means, why it is costly, and why it never stays light for long.',
  },
  faq: {
    href: '/faq/',
    label: 'FAQ',
    title: 'Legends of Ren Zu FAQ | Chapters, Ren Zu, Hope Gu, and Reading Guide',
    blurb: 'Fast answers to the questions new readers and search visitors ask first.',
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

function renderPage({ canonicalPath, title, description, heroEyebrow, heroTitle, heroLead, heroChips = [], bodyHtml, type = 'website', schema = [] }) {
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
    <div class="hero-inner">
      <div class="eyebrow">${htmlEscape(heroEyebrow)}</div>
      <h1>${htmlEscape(heroTitle)}</h1>
      <p class="lead">${htmlEscape(heroLead)}</p>
      ${heroChips.length ? `<div class="chip-row">${heroChips.map((chip) => `<span class="chip">${htmlEscape(chip)}</span>`).join('')}</div>` : ''}
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
    <article class="guide-card">
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

function statGrid(items) {
  return `<div class="stats">${items.map((item) => `<div class="stat"><strong>${htmlEscape(item.value)}</strong><span class="small">${htmlEscape(item.label)}</span></div>`).join('')}</div>`;
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
  return `<ul>${rows}</ul>`;
}

function sectionCard({ id = '', eyebrow = '', title = '', content = '' }) {
  return `
    <section class="card"${id ? ` id="${id}"` : ''}>
      ${eyebrow ? `<div class="eyebrow">${htmlEscape(eyebrow)}</div>` : ''}
      ${title ? `<h2 class="section-title">${htmlEscape(title)}</h2>` : ''}
      ${content}
    </section>
  `;
}

function tocCard(items) {
  return sectionCard({
    eyebrow: 'Page map',
    title: 'Quick navigation',
    content: `<div class="toc">${items.map((item) => `<a href="#${item.id}">${htmlEscape(item.label)}</a>`).join('')}</div>`,
  });
}

function textBlocks(paragraphs) {
  return paragraphs.map((p) => `<p>${htmlEscape(p)}</p>`).join('');
}

function bulletList(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function relatedChapterKeysFromText(chapter) {
  const t = chapter.body.toLowerCase();
  const keys = ['renZu'];
  if (t.includes('hope')) keys.push('hopeGu', 'hopeMeaning');
  if (t.includes('fate')) keys.push('fateGu', 'fateFreedom');
  if (t.includes('freedom')) keys.push('freedomGu', 'fateFreedom');
  if (t.includes('wisdom') || t.includes('strength') || t.includes('self gu') || t.includes(' self ')) keys.push('wisdomStrengthSelf');
  if (t.includes('verdant great sun')) keys.push('verdant');
  if (t.includes('desolate ancient moon')) keys.push('desolate');
  if (t.includes('northern dark ice soul')) keys.push('northern');
  if (t.includes('boundless forest samsara')) keys.push('boundless');
  keys.push('guidesHub');
  return [...new Set(keys)].slice(0, 6);
}

function chapterArchivePage() {
  const canonicalPath = '/chapters/';
  const title = `${SITE_NAME} Chapters | Archive, Reader, Reading Order, and Lore Guide`;
  const description = `Browse every available chapter entry from ${SITE_NAME}, then jump into guides, theme explainers, character pages, and the immersive reader.`;
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
    ${sectionCard({
      eyebrow: 'Archive overview',
      title: 'The searchable chapter archive',
      content: `
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span>›</span><span>Chapters</span>
        </nav>
        <div class="meta">
          <span>${chapters.length} indexed entries</span>
          <span>Original work reference: Reverend Insanity</span>
          <span>Author: ${AUTHOR}</span>
        </div>
        <p class="small">This page is built for stability, search discovery, and deep linking. It sits beside the immersive reader rather than replacing it.</p>
        ${statGrid([
          { value: `${chapters.length}`, label: 'Indexed entries' },
          { value: '44', label: 'Named chapter numbers' },
          { value: '10+', label: 'Guide pages live' },
          { value: '1', label: 'Immersive reader experience' },
        ])}
      `,
    })}
    ${sectionCard({
      eyebrow: 'Start here',
      title: 'Support pages for searchers and new readers',
      content: `<p class="small">These pages answer the most likely questions people search before or during reading.</p>${guideGrid(['guidesHub', 'readingOrder', 'legendsExplained', 'renZuSummary', 'renZu', 'hopeGu', 'fateGu', 'faq'])}`,
    })}
    ${sectionCard({
      eyebrow: 'Full archive',
      title: 'Every available chapter page',
      content: `<div class="grid">${cards}</div>`,
    })}
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: `${SITE_NAME} · Chapter archive`,
    heroTitle: `${SITE_NAME} Chapters`,
    heroLead: 'A stable archive for direct chapter reading, indexing, internal discovery, and fast jumps back into the immersive experience.',
    heroChips: ['Search-friendly', 'Direct URLs', 'Guide-linked', 'Reader companion'],
    bodyHtml,
    schema,
  });
}

function chapterPage(chapter, index) {
  const canonicalPath = `/chapters/${chapter.slug}/`;
  const title = `${chapterTitle(chapter)} | ${SITE_NAME}`;
  const description = descriptionForChapter(chapter);
  const paragraphs = paragraphize(chapter.body).map((p) => `<p>${htmlEscape(p)}</p>`).join('');
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  const relatedGuideKeys = relatedChapterKeysFromText(chapter);

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
    <div class="two-col">
      <div class="stack">
        ${sectionCard({
          eyebrow: 'Chapter text',
          title: chapterTitle(chapter),
          content: `
            <nav class="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span>›</span><a href="/chapters/">Chapters</a><span>›</span><span>${htmlEscape(chapterTitle(chapter))}</span>
            </nav>
            <div class="meta">
              <span>Part ${htmlEscape(chapter.num)}</span>
              <span>${htmlEscape(AUTHOR)}</span>
              <span>${htmlEscape(BRAND)} reader companion</span>
            </div>
            <div class="chapter-body">${paragraphs}</div>
            <div class="pager">
              <div>${prev ? `<div class="small">Previous</div>${chapterLink(prev.num)}` : ''}</div>
              <div style="text-align:right">${next ? `<div class="small">Next</div>${chapterLink(next.num)}` : ''}</div>
            </div>
          `,
        })}
      </div>
      <div class="stack">
        ${sectionCard({
          eyebrow: 'At a glance',
          title: 'Why this page matters',
          content: `
            <p class="small">This page gives search engines a stable chapter URL while still pointing real readers toward deeper character, theme, and guide pages.</p>
            ${statGrid([
              { value: `Part ${chapter.num}`, label: 'Archive label' },
              { value: `${Math.max(1, paragraphize(chapter.body).length)}`, label: 'Reading blocks' },
              { value: `${relatedGuideKeys.length}`, label: 'Related guide links' },
            ])}
          `,
        })}
        ${sectionCard({
          eyebrow: 'Related guides',
          title: 'Explore the ideas around this chapter',
          content: guideGrid(relatedGuideKeys),
        })}
      </div>
    </div>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: SITE_NAME,
    heroTitle: chapterTitle(chapter),
    heroLead: description,
    heroChips: ['Direct chapter URL', 'Guide-linked', 'Search-indexable'],
    bodyHtml,
    type: 'article',
    schema,
  });
}

const faqEntries = [
  {
    q: 'What is The Legends of Ren Zu?',
    a: 'It is a mythic narrative associated with Reverend Insanity that follows Ren Zu, the ancestor of humanity, through hardship, bargaining, revelation, and defiance.',
  },
  {
    q: 'Who is Ren Zu?',
    a: 'Ren Zu is the first human and the emotional center of the legends. He is the figure through whom the work explores loneliness, effort, loss, selfhood, and freedom.',
  },
  {
    q: 'What is Hope Gu?',
    a: 'Hope Gu is one of the most memorable symbolic Gu in the work. It repeatedly represents the ability to keep moving when strength, certainty, and comfort have already failed.',
  },
  {
    q: 'Do I need to read the chapters in order?',
    a: 'Yes. The cleanest path is from Part 1 onward, because later entries build on earlier symbols, family arcs, and conceptual threads.',
  },
  {
    q: 'Why does this site have separate chapter pages and an immersive reader?',
    a: 'The immersive reader is better for human experience. The static pages exist so search engines can crawl the material more clearly and readers can share stable URLs.',
  },
  {
    q: 'Why does Search Console say some URLs are unknown to Google?',
    a: 'That is normal right after sitemap submission and indexing requests. Google often needs time to crawl, process, and refresh the reporting layer.',
  },
];

function standardSchema(canonicalPath, title, description, pageType, breadcrumbTrail) {
  return [
    websiteSchema(),
    webPageSchema({ pageType, name: title, url: pathToUrl(canonicalPath), description }),
    breadcrumbSchema(breadcrumbTrail),
  ];
}

function aboutPage() {
  const canonicalPath = '/about/';
  const title = pageCatalog.about.title;
  const description = 'Learn why this project has an immersive reader, a chapter archive, and a growing knowledge layer built for search and discoverability.';
  const schema = standardSchema(canonicalPath, title, description, 'AboutPage', [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'About', url: pathToUrl(canonicalPath) },
  ]);

  const bodyHtml = `
    ${sectionCard({
      eyebrow: 'Project structure',
      title: 'Why the site now has multiple layers',
      content: `${textBlocks([
        'The immersive reader was built for atmosphere, rhythm, and experience. Search engines, however, understand stable HTML pages more easily than a single app-like interface. That is why this project now has a second layer: a chapter archive plus a growing library of original guide pages.',
        'The goal is not to replace the reader. The goal is to let the reader stay dramatic and fragile while the companion layer becomes easy to crawl, easy to share, and easy to understand for someone discovering the project for the first time.',
      ])}${statGrid([
        { value: 'Reader', label: 'Immersive experience' },
        { value: 'Archive', label: 'Stable chapter URLs' },
        { value: 'Guides', label: 'Related-search support' },
        { value: 'FAQ', label: 'Fast answers' },
      ])}`,
    })}
    ${sectionCard({
      id: 'use-cases',
      eyebrow: 'Use cases',
      title: 'How to use the site well',
      content: bulletList([
        'Use the immersive reader when you want the richest interface and the strongest narrative atmosphere.',
        'Use the chapter archive when you want direct links, stable search pages, or a cleaner crawlable structure.',
        'Use the guides, theme pages, and character pages when you want context before reading or when you arrive from search.',
        'Use the FAQ when you want short answers and then move outward into deeper pages.',
      ]),
    })}
    ${sectionCard({
      eyebrow: 'Next clicks',
      title: 'Best supporting pages from here',
      content: guideGrid(['guidesHub', 'readingOrder', 'legendsExplained', 'faq']),
    })}
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'About the project',
    heroTitle: 'A reader experience with a search layer built around it',
    heroLead: 'The immersive reader remains the emotional core, while the archive and guide pages make the project easier to discover, index, and share.',
    heroChips: ['Reader-first', 'Search-supportive', 'Shareable URLs'],
    bodyHtml,
    schema,
  });
}

function guidesHubPage() {
  const canonicalPath = '/guides/';
  const title = pageCatalog.guidesHub.title;
  const description = 'Open detailed reading guides, explainers, summaries, and topic pages built around how people actually search for The Legends of Ren Zu.';
  const schema = standardSchema(canonicalPath, title, description, 'CollectionPage', [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Guides', url: pathToUrl(canonicalPath) },
  ]);

  const bodyHtml = `
    ${sectionCard({
      eyebrow: 'Guide hub',
      title: 'The cleanest entry points for new readers',
      content: `${textBlocks([
        'These guide pages are intentionally written as original companion content. Their purpose is to answer the questions readers search first, reduce confusion, and move people deeper into the archive with better context.',
        'If you arrived here from Google, start with the explained page or the reading order. If you already know the project and want a sharper angle, open the summary, the best-chapters guide, or the Hope Gu meaning page.',
      ])}`,
    })}
    ${sectionCard({
      eyebrow: 'Guides',
      title: 'Detailed support pages',
      content: guideGrid(['readingOrder', 'legendsExplained', 'renZuSummary', 'bestChapters', 'hopeMeaning', 'faq']),
    })}
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Guide hub',
    heroTitle: 'Detailed guides for The Legends of Ren Zu',
    heroLead: 'Reading order, plain-language explanations, chapter recommendations, and support pages designed for discovery and clarity.',
    heroChips: ['Beginner-friendly', 'Original commentary', 'Search-focused'],
    bodyHtml,
    schema,
  });
}

function readingOrderPage() {
  const canonicalPath = '/guides/reading-order/';
  const title = pageCatalog.readingOrder.title;
  const description = 'Use this page to start The Legends of Ren Zu in the right order and understand the archive structure without confusion.';
  const schema = standardSchema(canonicalPath, title, description, 'Article', [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Guides', url: `${SITE_URL}/guides/` },
    { name: 'Reading order', url: pathToUrl(canonicalPath) },
  ]);
  const toc = [
    { id: 'best-start', label: 'Best place to start' },
    { id: 'combined-labels', label: 'Combined chapter labels' },
    { id: 'sample-route', label: 'Sample route' },
    { id: 'where-next', label: 'Where to go next' },
  ];

  const bodyHtml = `
    <div class="two-col">
      <div class="stack">
        ${sectionCard({
          id: 'best-start',
          eyebrow: 'Section 01',
          title: 'Best place to start',
          content: `${textBlocks([
            'The cleanest reading order is the simplest one: start at Part 1 and move forward. The later entries rely on earlier emotional and symbolic foundations, so jumping randomly gives you fragments instead of structure.',
            'This matters especially because the project is less like a normal chaptered novel and more like a chain of conceptual parables. Small ideas introduced early become much heavier later.',
          ])}`,
        })}
        ${sectionCard({
          id: 'combined-labels',
          eyebrow: 'Section 02',
          title: 'How the archive labels work',
          content: `${textBlocks([
            'Most archive entries map to a single numbered part, but a few are merged. Part 4 & 5 and Part 10 & 11 are presented as combined archive entries, so the total archive entry count is lower than the headline chapter count.',
            'That is why the site shows 44 chapters but 42 entries. Nothing is missing. It is simply an archive design choice.',
          ])}${statGrid([
            { value: '44', label: 'Named chapter numbers' },
            { value: '42', label: 'Archive entries' },
            { value: '2', label: 'Combined entries' },
          ])}`,
        })}
        ${sectionCard({
          id: 'sample-route',
          eyebrow: 'Section 03',
          title: 'A strong sample route if you want the essentials first',
          content: `${textBlocks([
            'If you want the best representative path without opening every page immediately, start with the foundation, then jump to the pages that reveal the philosophical core most clearly.',
          ])}${chapterReferenceList(['1', '2', '3', '21', '34', '39', '44'])}`,
        })}
        ${sectionCard({
          id: 'where-next',
          eyebrow: 'Section 04',
          title: 'Where to go next after the reading order',
          content: guideGrid(['legendsExplained', 'renZuSummary', 'bestChapters', 'faq']),
        })}
      </div>
      <div class="stack">
        ${tocCard(toc)}
        ${sectionCard({
          eyebrow: 'Quick note',
          title: 'Use the right page for the right need',
          content: `<div class="callout">Use the archive for stability, the immersive reader for atmosphere, and the guides for context. The strongest experience comes from combining all three intentionally.</div>`,
        })}
      </div>
    </div>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Reading guide',
    heroTitle: 'Best reading order for The Legends of Ren Zu',
    heroLead: 'If you want clarity instead of confusion, start at Part 1, read forward, and use this page whenever you need a structural overview.',
    heroChips: ['Start here', 'Archive structure', 'Best chapter path'],
    bodyHtml,
    schema,
  });
}

function renZuSummaryPage() {
  const canonicalPath = '/guides/ren-zu-summary/';
  const title = pageCatalog.renZuSummary.title;
  const description = 'A detailed Ren Zu summary that explains his role, his arc, his symbolic meaning, and the chapters that best reveal him.';
  const schema = standardSchema(canonicalPath, title, description, 'Article', [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Guides', url: `${SITE_URL}/guides/` },
    { name: 'Ren Zu summary', url: pathToUrl(canonicalPath) },
  ]);
  const toc = [
    { id: 'core-summary', label: 'Core summary' },
    { id: 'symbolic-role', label: 'Symbolic role' },
    { id: 'major-turns', label: 'Major turns' },
    { id: 'best-pages', label: 'Best pages to read next' },
  ];

  const bodyHtml = `
    <div class="two-col">
      <div class="stack">
        ${sectionCard({
          id: 'core-summary',
          eyebrow: 'Section 01',
          title: 'Ren Zu in one clear summary',
          content: `${textBlocks([
            'Ren Zu is the ancestor figure at the center of the legends: the first human, the bearer of impossible burdens, and the person through whom the work examines how humanity survives a world that is older, harsher, and more structurally powerful than any individual life.',
            'He begins as prey among Predicaments and moves through a long sequence of bargains, losses, recoveries, children, separations, revelations, and acts of resistance. As his journey expands, he stops feeling like a single man and starts feeling like a symbolic map of human existence itself.',
          ])}`,
        })}
        ${sectionCard({
          id: 'symbolic-role',
          eyebrow: 'Section 02',
          title: 'Why his role is bigger than a normal protagonist',
          content: `${textBlocks([
            'Ren Zu does not only carry plot. He carries the work’s theory of humanity. Each hardship he faces turns into a question: what keeps a person moving when strength fails, when wisdom fails, when companionship breaks, when fate imposes structure, and when freedom comes with unbearable weight?',
            'That is why understanding Ren Zu first makes everything else easier. Hope Gu, Fate Gu, Self Gu, and the arcs of his children all become clearer when you see them as pressures acting on the human condition through him.',
          ])}${bulletList([
            'He is the emotional center of the archive.',
            'He is the conceptual center of the archive.',
            'He is the best bridge between chapter reading and thematic interpretation.',
          ])}`,
        })}
        ${sectionCard({
          id: 'major-turns',
          eyebrow: 'Section 03',
          title: 'Major turns that define Ren Zu',
          content: `${bulletList([
            'His earliest survival through Strength, Wisdom, and Hope.',
            'The loneliness that pushes him toward radical transformation.',
            'The long sequence of fatherhood, loss, and separation from his children.',
            'The descent into larger questions about ordinary life, extraordinary life, fate, and freedom.',
            'The later struggle over selfhood, truth, and what remains when identity itself becomes unstable.',
          ])}`,
        })}
        ${sectionCard({
          id: 'best-pages',
          eyebrow: 'Section 04',
          title: 'Best chapters and pages to understand him quickly',
          content: `${chapterReferenceList(['1', '2', '21', '34', '39', '44'])}${guideGrid(['renZu', 'hopeGu', 'fateFreedom', 'wisdomStrengthSelf'])}`,
        })}
      </div>
      <div class="stack">
        ${tocCard(toc)}
        ${sectionCard({
          eyebrow: 'Key takeaway',
          title: 'The short version',
          content: `<blockquote class="quote">Ren Zu matters because the legends use his life to ask what a human being still is when every borrowed certainty has already been stripped away.</blockquote>`,
        })}
      </div>
    </div>
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Guide page',
    heroTitle: 'Ren Zu summary',
    heroLead: 'A concise but detailed way to understand Ren Zu as a character, a symbol, and the human center of the entire work.',
    heroChips: ['Summary', 'Symbolism', 'Best chapters'],
    bodyHtml,
    schema,
  });
}

function legendsExplainedPage() {
  const canonicalPath = '/guides/the-legends-of-ren-zu-explained/';
  const title = pageCatalog.legendsExplained.title;
  const description = 'A beginner-friendly explanation of what The Legends of Ren Zu is, how to read it, and what kinds of ideas it keeps returning to.';
  const schema = standardSchema(canonicalPath, title, description, 'Article', [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Guides', url: `${SITE_URL}/guides/` },
    { name: 'Explained', url: pathToUrl(canonicalPath) },
  ]);

  const bodyHtml = `
    ${sectionCard({
      eyebrow: 'Beginner guide',
      title: 'What The Legends of Ren Zu actually is',
      content: `${textBlocks([
        'At the simplest level, The Legends of Ren Zu is a mythic narrative built around Ren Zu, the ancestor of humanity. But reading it only at that level misses what makes it powerful. The work is also a chain of symbolic stories about survival, despair, courage, identity, family, and resistance to fate.',
        'That is why readers often talk about it with unusual intensity. It operates as story, parable, and philosophical pressure all at once.',
      ])}`,
    })}
    ${sectionCard({
      eyebrow: 'How to read it',
      title: 'Best mindset for reading the archive',
      content: `${bulletList([
        'Read it in order first, because the symbols gain weight over time.',
        'Treat every Gu as both a literal force and a conceptual one.',
        'Pay attention to how family, suffering, and selfhood keep reappearing.',
        'Do not expect a normal heroic progression. Expect a harsh, recursive human struggle.',
      ])}`,
    })}
    ${sectionCard({
      eyebrow: 'What to track',
      title: 'The biggest recurring ideas',
      content: `${guideGrid(['hopeGu', 'fateGu', 'freedomGu', 'wisdomStrengthSelf', 'renZu'])}`,
    })}
    ${sectionCard({
      eyebrow: 'Where to begin',
      title: 'The best first pages after this one',
      content: `${chapterReferenceList(['1', '2', '34'])}${guideGrid(['readingOrder', 'renZuSummary', 'faq'])}`,
    })}
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Beginner guide',
    heroTitle: 'The Legends of Ren Zu explained',
    heroLead: 'If you want the plain-language version of what this work is and why people care about it, start here.',
    heroChips: ['Plain language', 'New reader friendly', 'Theme-first'],
    bodyHtml,
    schema,
  });
}

function bestChaptersPage() {
  const canonicalPath = '/guides/best-ren-zu-chapters/';
  const title = pageCatalog.bestChapters.title;
  const description = 'A curated guide to the best Ren Zu chapters for first-time readers who want a strong emotional and philosophical starting set.';
  const schema = standardSchema(canonicalPath, title, description, 'Article', [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Guides', url: `${SITE_URL}/guides/` },
    { name: 'Best chapters', url: pathToUrl(canonicalPath) },
  ]);

  const bodyHtml = `
    ${sectionCard({
      eyebrow: 'How this list works',
      title: 'What makes a Ren Zu chapter worth starting with',
      content: `${textBlocks([
        'A good starter chapter should either establish the emotional engine of the legends, showcase a core theme clearly, or reveal why Ren Zu feels larger than a normal protagonist.',
        'This list is not meant to replace reading in order. It is meant to help curious readers sample the strongest material before committing to the full archive.',
      ])}`,
    })}
    ${sectionCard({
      eyebrow: 'Starter set',
      title: 'Five high-value starting points',
      content: `${chapterReferenceList(['1', '2', '21', '34', '44'])}`,
    })}
    ${sectionCard({
      eyebrow: 'Theme-heavy additions',
      title: 'Best chapters if you want the philosophy quickly',
      content: `${chapterReferenceList(['12', '32', '33', '35', '39'])}`,
    })}
    ${sectionCard({
      eyebrow: 'Follow-up pages',
      title: 'After the chapter sampler, read these',
      content: `${guideGrid(['readingOrder', 'renZuSummary', 'legendsExplained', 'hopeMeaning'])}`,
    })}
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Curated reading',
    heroTitle: 'Best Ren Zu chapters to start with',
    heroLead: 'A fast, high-value chapter list for readers who want to feel the force of the work before diving through every entry.',
    heroChips: ['Starter list', 'Theme-heavy picks', 'Reader sampler'],
    bodyHtml,
    schema,
  });
}

function hopeMeaningPage() {
  const canonicalPath = '/guides/hope-gu-meaning/';
  const title = pageCatalog.hopeMeaning.title;
  const description = 'A detailed guide to Hope Gu meaning, symbolism, and the chapters where its force becomes clearest.';
  const schema = standardSchema(canonicalPath, title, description, 'Article', [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Guides', url: `${SITE_URL}/guides/` },
    { name: 'Hope Gu meaning', url: pathToUrl(canonicalPath) },
  ]);

  const bodyHtml = `
    ${sectionCard({
      eyebrow: 'Meaning guide',
      title: 'What Hope Gu means in simple terms',
      content: `${textBlocks([
        'Hope Gu matters because it stands for motion under despair. It is not comfort, naïve optimism, or a guaranteed happy ending. It is the capacity to keep taking another step even when the surrounding world still looks brutal.',
        'That distinction is why Hope Gu stays memorable. It feels earned through pressure rather than handed out as consolation.',
      ])}`,
    })}
    ${sectionCard({
      eyebrow: 'Why readers remember it',
      title: 'Why Hope Gu hits so hard',
      content: `${bulletList([
        'It appears early enough to shape the emotional lens of the whole project.',
        'It stays connected to Predicament rather than denying it.',
        'It fits naturally into the larger question of what makes humans endure.',
        'It keeps echoing even when later themes become darker or more abstract.',
      ])}`,
    })}
    ${sectionCard({
      eyebrow: 'Key moments',
      title: 'Best chapters for understanding Hope Gu',
      content: `${chapterReferenceList(['1', '2', '17', '39'])}`,
    })}
    ${sectionCard({
      eyebrow: 'Related pages',
      title: 'Read these after Hope Gu',
      content: `${guideGrid(['hopeGu', 'renZu', 'fateFreedom', 'faq'])}`,
    })}
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Meaning guide',
    heroTitle: 'Hope Gu meaning',
    heroLead: 'Hope Gu is one of the clearest emotional statements in the archive: persistence without false softness.',
    heroChips: ['Meaning', 'Key moments', 'Theme bridge'],
    bodyHtml,
    schema,
  });
}

function charactersHubPage() {
  const canonicalPath = '/characters/';
  const title = pageCatalog.charactersHub.title;
  const description = 'A character hub focused on the most important figures readers are likely to search for first.';
  const schema = standardSchema(canonicalPath, title, description, 'CollectionPage', [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Characters', url: pathToUrl(canonicalPath) },
  ]);

  const bodyHtml = `
    ${sectionCard({
      eyebrow: 'Character hub',
      title: 'The most important character pages to open first',
      content: `${textBlocks([
        'These pages focus on the figures most likely to matter to a new reader or to appear in related searches. They are not just profile cards. Each one tries to explain symbolic role, emotional function, and where to keep reading next.',
      ])}${guideGrid(['renZu', 'verdant', 'desolate', 'northern', 'boundless'])}`,
    })}
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Character hub',
    heroTitle: 'Character pages for The Legends of Ren Zu',
    heroLead: 'Start with Ren Zu, then branch outward into the children and figures who carry the work’s symbolic and emotional weight.',
    heroChips: ['Character guides', 'Symbolic roles', 'Best chapter links'],
    bodyHtml,
    schema,
  });
}

function characterPage({ canonicalPath, title, description, heroTitle, chips, whoParagraphs, roleBullets, chapterNums, relatedKeys, breadcrumbName, takeaway }) {
  const schema = standardSchema(canonicalPath, title, description, 'Article', [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Characters', url: `${SITE_URL}/characters/` },
    { name: breadcrumbName, url: pathToUrl(canonicalPath) },
  ]);

  const bodyHtml = `
    ${sectionCard({
      eyebrow: 'Character overview',
      title: 'Who this figure is',
      content: `${textBlocks(whoParagraphs)}`,
    })}
    ${sectionCard({
      eyebrow: 'Role in the work',
      title: 'Why this character matters',
      content: `${bulletList(roleBullets)}`,
    })}
    ${sectionCard({
      eyebrow: 'Best reading route',
      title: 'Chapters to read for this character',
      content: `${chapterReferenceList(chapterNums)}`,
    })}
    ${sectionCard({
      eyebrow: 'Related pages',
      title: 'Themes and guides connected to this character',
      content: `${guideGrid(relatedKeys)}<blockquote class="quote" style="margin-top:16px;">${htmlEscape(takeaway)}</blockquote>`,
    })}
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Character guide',
    heroTitle,
    heroLead: description,
    heroChips: chips,
    bodyHtml,
    schema,
  });
}

function themesHubPage() {
  const canonicalPath = '/themes/';
  const title = pageCatalog.themesHub.title;
  const description = 'A thematic hub for Hope Gu, Fate Gu, Freedom Gu, wisdom, strength, selfhood, and the larger struggle inside The Legends of Ren Zu.';
  const schema = standardSchema(canonicalPath, title, description, 'CollectionPage', [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Themes', url: pathToUrl(canonicalPath) },
  ]);

  const bodyHtml = `
    ${sectionCard({
      eyebrow: 'Theme hub',
      title: 'The ideas people search for most often',
      content: `${textBlocks([
        'The work stays powerful because its symbols do not stay decorative. They become repeated pressures on the same human problem: how to remain human under suffering, limitation, fate, and the cost of desire.',
      ])}${guideGrid(['hopeGu', 'hopeMeaning', 'fateFreedom', 'fateGu', 'freedomGu', 'wisdomStrengthSelf'])}`,
    })}
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Theme hub',
    heroTitle: 'Major themes in The Legends of Ren Zu',
    heroLead: 'Hope, fate, freedom, wisdom, strength, and selfhood are not side topics here. They are the architecture of the work.',
    heroChips: ['Themes', 'Symbols', 'Reader context'],
    bodyHtml,
    schema,
  });
}

function themePage({ canonicalPath, title, description, heroTitle, chips, paragraphs, bullets, chapterNums, relatedKeys, breadcrumbName, takeaway }) {
  const schema = standardSchema(canonicalPath, title, description, 'Article', [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Themes', url: `${SITE_URL}/themes/` },
    { name: breadcrumbName, url: pathToUrl(canonicalPath) },
  ]);

  const bodyHtml = `
    ${sectionCard({
      eyebrow: 'Theme overview',
      title: 'What this theme means',
      content: `${textBlocks(paragraphs)}`,
    })}
    ${sectionCard({
      eyebrow: 'Why it matters',
      title: 'How this theme works inside the archive',
      content: `${bulletList(bullets)}`,
    })}
    ${sectionCard({
      eyebrow: 'Best reading route',
      title: 'Chapters that reveal this theme clearly',
      content: `${chapterReferenceList(chapterNums)}`,
    })}
    ${sectionCard({
      eyebrow: 'Related pages',
      title: 'Where to go after this theme page',
      content: `${guideGrid(relatedKeys)}<blockquote class="quote" style="margin-top:16px;">${htmlEscape(takeaway)}</blockquote>`,
    })}
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'Theme guide',
    heroTitle,
    heroLead: description,
    heroChips: chips,
    bodyHtml,
    schema,
  });
}

function faqPage() {
  const canonicalPath = '/faq/';
  const title = pageCatalog.faq.title;
  const description = 'Short answers to the questions new readers and search visitors ask first about The Legends of Ren Zu.';
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

  const faqCards = faqEntries.map((entry) => `<article class="detail-card faq-item"><h3>${htmlEscape(entry.q)}</h3><p>${htmlEscape(entry.a)}</p></article>`).join('');
  const bodyHtml = `
    ${sectionCard({
      eyebrow: 'Fast answers',
      title: 'The core questions people usually ask first',
      content: `<div class="grid">${faqCards}</div>`,
    })}
    ${sectionCard({
      eyebrow: 'Go deeper',
      title: 'Pages that expand the short answers',
      content: `${guideGrid(['legendsExplained', 'readingOrder', 'renZuSummary', 'hopeMeaning', 'renZu'])}`,
    })}
  `;

  return renderPage({
    canonicalPath,
    title,
    description,
    heroEyebrow: 'FAQ',
    heroTitle: 'Fast answers for new readers',
    heroLead: 'A high-clarity page for the questions people ask before they commit to the archive or the immersive reader.',
    heroChips: ['Quick answers', 'Search-friendly', 'Beginner help'],
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
writePage('/guides/ren-zu-summary/', renZuSummaryPage());
writePage('/guides/the-legends-of-ren-zu-explained/', legendsExplainedPage());
writePage('/guides/best-ren-zu-chapters/', bestChaptersPage());
writePage('/guides/hope-gu-meaning/', hopeMeaningPage());
writePage('/characters/', charactersHubPage());
writePage('/characters/ren-zu/', characterPage({
  canonicalPath: '/characters/ren-zu/',
  title: pageCatalog.renZu.title,
  description: 'A detailed character guide to Ren Zu, the first human and the emotional center of The Legends of Ren Zu.',
  heroTitle: 'Who is Ren Zu?',
  chips: ['Character guide', 'Core figure', 'Best chapters'],
  whoParagraphs: [
    'Ren Zu is the foundational human figure in the legends: the first ancestor, the center of the book, and the lens through which the work explores suffering, courage, loneliness, desire, and rebellion.',
    'He is not just a protagonist in the ordinary sense. He functions as a symbolic ancestor whose life becomes a map of human struggle, stretching from bare survival into questions of selfhood, fate, and freedom.',
  ],
  roleBullets: [
    'He anchors the work emotionally and conceptually.',
    'His bargains and losses set the tone for the entire archive.',
    'His relationship to his children turns personal pain into mythic structure.',
    'His later resistance to fate pushes the legends toward their most charged philosophical territory.',
  ],
  chapterNums: ['1', '2', '21', '34', '39', '44'],
  relatedKeys: ['renZuSummary', 'hopeGu', 'fateFreedom', 'wisdomStrengthSelf'],
  breadcrumbName: 'Ren Zu',
  takeaway: 'If you only understand one figure first, make it Ren Zu. Almost every major theme bends back toward him.',
}));
writePage('/characters/verdant-great-sun/', characterPage({
  canonicalPath: '/characters/verdant-great-sun/',
  title: pageCatalog.verdant.title,
  description: 'A character guide to Verdant Great Sun: Ren Zu’s eldest son, his symbolism, and the chapters that define his role.',
  heroTitle: 'Who is Verdant Great Sun?',
  chips: ['Character guide', 'Ren Zu’s son', 'Early-symbol arc'],
  whoParagraphs: [
    'Verdant Great Sun is one of Ren Zu’s children and one of the clearest early examples of how the legends turn family into symbol. He is tied to brilliance, intoxication, limits, and the cost of reaching beyond measure.',
    'His presence helps the archive shift from survival myth into a more layered meditation on desire, recognition, and the consequences of not understanding one’s limits.',
  ],
  roleBullets: [
    'He expands the emotional scale of Ren Zu’s story through fatherhood and loss.',
    'He helps introduce themes of vanity, intoxication, glory, and consequence.',
    'He becomes part of the work’s larger meditation on aspiration without balance.',
  ],
  chapterNums: ['7', '8', '10 & 11', '12', '13'],
  relatedKeys: ['renZu', 'hopeMeaning', 'bestChapters'],
  breadcrumbName: 'Verdant Great Sun',
  takeaway: 'Verdant Great Sun matters because the work uses him to show how brilliance and excess can become inseparable.',
}));
writePage('/characters/desolate-ancient-moon/', characterPage({
  canonicalPath: '/characters/desolate-ancient-moon/',
  title: pageCatalog.desolate.title,
  description: 'A character guide to Desolate Ancient Moon, her rescue arc, and the emotional force of filial struggle in the legends.',
  heroTitle: 'Who is Desolate Ancient Moon?',
  chips: ['Character guide', 'Rescue arc', 'Sacrifice'],
  whoParagraphs: [
    'Desolate Ancient Moon is one of Ren Zu’s daughters and one of the strongest embodiments of sacrificial devotion in the archive. Her arc carries rescue, filial effort, and the pain of trying to restore what has already been damaged by the world.',
    'She helps reveal how family in the legends is never decorative. It is one of the main ways the work externalizes grief, duty, loyalty, and impossible expectation.',
  ],
  roleBullets: [
    'She intensifies the emotional reality of Ren Zu’s condition as a father.',
    'She embodies effort shaped by love and obligation.',
    'Her arc pushes the archive deeper into suffering, duty, and sacrifice.',
  ],
  chapterNums: ['14', '15', '16', '18'],
  relatedKeys: ['renZu', 'hopeGu', 'wisdomStrengthSelf'],
  breadcrumbName: 'Desolate Ancient Moon',
  takeaway: 'Desolate Ancient Moon matters because she turns abstract devotion into action and cost.',
}));
writePage('/characters/northern-dark-ice-soul/', characterPage({
  canonicalPath: '/characters/northern-dark-ice-soul/',
  title: pageCatalog.northern.title,
  description: 'A character guide to Northern Dark Ice Soul, including his symbolism, difficult purpose, and key chapters.',
  heroTitle: 'Who is Northern Dark Ice Soul?',
  chips: ['Character guide', 'Darkness and purpose', 'Key son arc'],
  whoParagraphs: [
    'Northern Dark Ice Soul is one of Ren Zu’s most symbolically charged children. His name alone signals distance, severity, and the cold edge of purpose. He helps the archive move toward harder questions about understanding, direction, and the limits of simple rescue.',
    'Where some figures radiate warmth or immediacy, Northern Dark Ice Soul often feels like the difficult path itself: necessary, remote, and not easily simplified.',
  ],
  roleBullets: [
    'He strengthens the archive’s movement toward purpose and complexity.',
    'He contributes to the sense that salvation and clarity are never simple.',
    'He helps turn familial myth into philosophical terrain.',
  ],
  chapterNums: ['15', '16', '17', '18'],
  relatedKeys: ['renZu', 'wisdomStrengthSelf', 'readingOrder'],
  breadcrumbName: 'Northern Dark Ice Soul',
  takeaway: 'Northern Dark Ice Soul matters because he gives the legends one of their clearest forms of severe, difficult purpose.',
}));
writePage('/characters/boundless-forest-samsara/', characterPage({
  canonicalPath: '/characters/boundless-forest-samsara/',
  title: pageCatalog.boundless.title,
  description: 'A character guide to Boundless Forest Samsara, Ordinary Abyss, perspective, scale, and limitation in The Legends of Ren Zu.',
  heroTitle: 'Who is Boundless Forest Samsara?',
  chips: ['Character guide', 'Ordinary Abyss', 'Perspective and scale'],
  whoParagraphs: [
    'Boundless Forest Samsara is one of Ren Zu’s children and one of the most useful figures for understanding how the legends play with perspective, scale, ordinary limitation, and the pain of being trapped inside a horizon that feels too small.',
    'Her arc helps the archive shift from pure mythic motion into a study of confinement, perspective, friendship, and the strange politics of what counts as ordinary or extraordinary.',
  ],
  roleBullets: [
    'She embodies a struggle with limitation rather than with simple external violence.',
    'She is central to the emotional and philosophical force of Ordinary Abyss.',
    'Her chapters help explain how scale itself becomes symbolic inside the legends.',
  ],
  chapterNums: ['21', '22', '23', '28', '29', '30', '31'],
  relatedKeys: ['renZu', 'readingOrder', 'legendsExplained', 'bestChapters'],
  breadcrumbName: 'Boundless Forest Samsara',
  takeaway: 'Boundless Forest Samsara matters because the work uses her to show how confinement can reshape vision, value, and identity.',
}));
writePage('/themes/', themesHubPage());
writePage('/themes/hope-gu/', themePage({
  canonicalPath: '/themes/hope-gu/',
  title: pageCatalog.hopeGu.title,
  description: 'Why Hope Gu matters, what it symbolizes, and where it shapes The Legends of Ren Zu most strongly.',
  heroTitle: 'Hope Gu explained',
  chips: ['Theme guide', 'Core symbol', 'Key moments'],
  paragraphs: [
    'Hope Gu stands out because it never feels like cheap optimism. It appears in a brutal world and still matters precisely because the world stays brutal.',
    'The point is not that suffering disappears. The point is that motion becomes possible again. Hope Gu is one of the clearest ways the archive argues that human endurance is not the same thing as comfort.',
  ],
  bullets: [
    'It links directly to survival under Predicament.',
    'It establishes an emotional grammar for the rest of the archive.',
    'It lets later struggles feel like extensions of an older human refusal to surrender.',
    'It remains meaningful even when the work grows darker and more complex.',
  ],
  chapterNums: ['1', '2', '17', '39'],
  relatedKeys: ['hopeMeaning', 'renZu', 'fateFreedom', 'faq'],
  breadcrumbName: 'Hope Gu',
  takeaway: 'Hope Gu is memorable because it does not promise safety. It promises motion when safety is already gone.',
}));
writePage('/themes/fate-and-freedom/', themePage({
  canonicalPath: '/themes/fate-and-freedom/',
  title: pageCatalog.fateFreedom.title,
  description: 'A detailed guide to Fate, Freedom, and why their conflict drives the deepest parts of The Legends of Ren Zu.',
  heroTitle: 'Fate and freedom',
  chips: ['Theme guide', 'Central conflict', 'Philosophical core'],
  paragraphs: [
    'Few tensions define the legends more sharply than the conflict between fate and freedom. Fate implies that the world already has a structure that precedes the individual. Freedom is the refusal to let that structure remain unquestioned.',
    'When this conflict intensifies, the work stops feeling like a simple myth and starts feeling like a struggle over whether human beings can truly live outside the terms already written for them.',
  ],
  bullets: [
    'This theme explains why so much of the later archive feels charged and defiant.',
    'It helps connect Ren Zu’s private suffering to a larger metaphysical struggle.',
    'It clarifies why freedom never arrives as a light or uncomplicated reward.',
  ],
  chapterNums: ['12', '32', '33', '34', '35', '36'],
  relatedKeys: ['fateGu', 'freedomGu', 'renZu', 'wisdomStrengthSelf'],
  breadcrumbName: 'Fate and Freedom',
  takeaway: 'The archive becomes unforgettable when fate stops feeling abstract and starts feeling like an enemy structure pressing directly on human possibility.',
}));
writePage('/themes/wisdom-strength-and-self/', themePage({
  canonicalPath: '/themes/wisdom-strength-and-self/',
  title: pageCatalog.wisdomStrengthSelf.title,
  description: 'A guide to how Wisdom, Strength, and Self shape identity, growth, and human capability in The Legends of Ren Zu.',
  heroTitle: 'Wisdom, strength, and self',
  chips: ['Theme guide', 'Identity', 'Capability'],
  paragraphs: [
    'Strength solves immediate survival, but it reaches limits. Wisdom expands understanding, but it does not erase suffering. Self becomes critical when borrowed or external forms of power stop being enough.',
    'Taken together, these ideas let the legends explore a question that feels human at every scale: what kind of power actually belongs to a person, and what kind merely passes through them for a time?',
  ],
  bullets: [
    'Strength shows the urgency of survival but not the whole shape of life.',
    'Wisdom reveals patterns but cannot remove pain by itself.',
    'Self becomes decisive when identity, truth, and direction all become unstable.',
  ],
  chapterNums: ['1', '2', '3', '16', '26', '43', '44'],
  relatedKeys: ['renZu', 'hopeGu', 'fateFreedom', 'faq'],
  breadcrumbName: 'Wisdom, Strength, and Self',
  takeaway: 'These themes matter because the legends refuse to reduce human power to one simple form.',
}));
writePage('/themes/fate-gu/', themePage({
  canonicalPath: '/themes/fate-gu/',
  title: pageCatalog.fateGu.title,
  description: 'A focused guide to Fate Gu: what it represents, why it feels overwhelming, and how it shapes the deepest conflicts in the archive.',
  heroTitle: 'Fate Gu explained',
  chips: ['Theme guide', 'Structural force', 'Major symbol'],
  paragraphs: [
    'Fate Gu is not just another named force in the archive. It is one of the clearest symbols of structure over the individual: the weight of order, inevitability, and a design larger than human desire.',
    'Whenever Fate Gu becomes central, the archive sharpens its challenge. It asks whether effort alone is enough, whether resistance can matter, and what freedom really means when the world already seems arranged in advance.',
  ],
  bullets: [
    'It helps explain why rebellion in the archive feels existential rather than merely emotional.',
    'It turns the conflict from personal hardship into something metaphysical.',
    'It gives later freedom-focused chapters their full pressure and scale.',
  ],
  chapterNums: ['12', '32', '33', '34', '37'],
  relatedKeys: ['fateFreedom', 'freedomGu', 'renZu', 'bestChapters'],
  breadcrumbName: 'Fate Gu',
  takeaway: 'Fate Gu matters because it makes the struggle bigger than any one pain: it turns suffering into structure.',
}));
writePage('/themes/freedom-gu/', themePage({
  canonicalPath: '/themes/freedom-gu/',
  title: pageCatalog.freedomGu.title,
  description: 'A guide to Freedom Gu: what it means, why it is heavy rather than simple, and how it changes the tone of the later archive.',
  heroTitle: 'Freedom Gu explained',
  chips: ['Theme guide', 'Costly freedom', 'Later-arc pressure'],
  paragraphs: [
    'Freedom Gu matters because the archive refuses to treat freedom as pure lightness. Once freedom begins to appear directly, the work also shows its burden, instability, and cost. To desire freedom is one thing; to hold it, bear it, and live its consequences is another.',
    'That is why Freedom Gu deepens the archive rather than merely rewarding it. It reveals that liberation itself can become a trial.',
  ],
  bullets: [
    'Freedom in the archive is emotional, existential, and structural at once.',
    'Freedom Gu gains force because it appears beside Fate Gu rather than apart from it.',
    'The weight of freedom is part of what makes the later chapters memorable.',
  ],
  chapterNums: ['33', '34', '35', '36', '39'],
  relatedKeys: ['fateFreedom', 'fateGu', 'renZu', 'hopeMeaning'],
  breadcrumbName: 'Freedom Gu',
  takeaway: 'Freedom Gu matters because the legends insist that true freedom is never shallow and never costless.',
}));
writePage('/faq/', faqPage());

const sitemapUrls = [
  `${SITE_URL}/`,
  `${SITE_URL}/about/`,
  `${SITE_URL}/guides/`,
  `${SITE_URL}/guides/reading-order/`,
  `${SITE_URL}/guides/ren-zu-summary/`,
  `${SITE_URL}/guides/the-legends-of-ren-zu-explained/`,
  `${SITE_URL}/guides/best-ren-zu-chapters/`,
  `${SITE_URL}/guides/hope-gu-meaning/`,
  `${SITE_URL}/characters/`,
  `${SITE_URL}/characters/ren-zu/`,
  `${SITE_URL}/characters/verdant-great-sun/`,
  `${SITE_URL}/characters/desolate-ancient-moon/`,
  `${SITE_URL}/characters/northern-dark-ice-soul/`,
  `${SITE_URL}/characters/boundless-forest-samsara/`,
  `${SITE_URL}/themes/`,
  `${SITE_URL}/themes/hope-gu/`,
  `${SITE_URL}/themes/fate-and-freedom/`,
  `${SITE_URL}/themes/wisdom-strength-and-self/`,
  `${SITE_URL}/themes/fate-gu/`,
  `${SITE_URL}/themes/freedom-gu/`,
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

console.log(`Generated ${chapters.length} chapter pages plus Stage 3 guide pages, sitemap.xml, and robots.txt.`);
