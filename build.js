// Builds the static LitHelp site into ./docs from ./content and ./src.
//   node build.js                      -> uses https://lithelp.github.io
//   SITE_URL=https://example.org node build.js
//
// Every old Yola address /Name.php is kept: the page is written to /Name.php/index.html,
// and GitHub Pages answers /Name.php with a redirect to /Name.php/.
// The original wording in content/original/*.html is never changed here; this script only
// wraps it in the new design and converts Yola-specific markup (file boxes, embeds, links).

const fs = require('fs');
const path = require('path');

const SITE_URL = (process.env.SITE_URL || 'https://lithelp.github.io').replace(/\/$/, '');
const SITE_NAME = 'O/L Literature Help';
const ROOT = __dirname;
const OUT = path.join(ROOT, 'docs');
const TODAY = new Date().toISOString().slice(0, 10);
const ASSET_V = Date.now().toString(36);

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const pagesData = JSON.parse(read('content/pages.json'));
const quizzes = JSON.parse(read('content/quizzes.json'));
const ADS = JSON.parse(read('content/site.json')).adsense;

// Ad space. Renders nothing until AdSense is enabled in content/site.json, so pages carry no empty boxes.
// With a slot ID it places a responsive unit here; without one, Auto ads (head script) decide placement.
function adHtml(where) {
  if (!ADS.enabled || !ADS.slot) return '';
  return `<div class="ad-slot${where ? ' ad-' + where : ''}" aria-label="Advertisement"><ins class="adsbygoogle" style="display:block" data-ad-client="${ADS.client}" data-ad-slot="${ADS.slot}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>`;
}

// ---------- Site map ----------
const all = [];
for (const top of pagesData.nav) {
  all.push({ ...top, parent: null });
  for (const c of top.children || []) all.push({ ...c, parent: top });
}
for (const h of pagesData.hidden) all.push({ ...h, label: h.title, parent: null, hidden: true });
const bySlug = Object.fromEntries(all.map(p => [p.slug, p]));
const urlOf = slug => (slug === 'index' ? '/' : '/' + slug + '.php/');

// Menu labels shown in the new design. URLs and <title>s keep the originals.
const DISPLAY = { 'rcf-lit-class': 'RCF Lit Class' };
const labelOf = p => DISPLAY[p.slug] || p.label;

// Short descriptions for the section cards on the home page and section pages.
const SECTION_INFO = {
  'My-Poems': ['Syllabus', 'The prescribed poems, prose, drama and novels, grouped by theme.', 'book'],
  'OL-LITERATURE-HELP': ['Poetry', 'Line-by-line notes, Sinhala translations, videos and quizzes for the prescribed poems.', 'feather'],
  'drama': ['Drama', 'Notes on The Bear and Twilight of a Crane.', 'mask'],
  'OL-Prose': ['Prose', 'Notes on the prescribed short stories and extracts.', 'scroll'],
  'novels': ['Novels', 'Notes and scanned study pages for the prescribed novels.', 'library'],
  'papers': ['Resources', 'Past papers, term tests, model papers, marking schemes and presentations.', 'file'],
  'RCF-Publications': ['RCF Publications', 'E-books and study guides for students and teachers.', 'bag'],
  'rcf-lit-class': ['RCF Lit Class', 'RCF online Literature classes.', 'users'],
};
const ICONS = {
  book: '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h12"/>',
  feather: '<path d="M20 4c-6 0-11 4-12 11l-3 5"/><path d="M8 15c5 0 9-3 10-8"/><path d="M11 12h5"/>',
  mask: '<path d="M4 5h16v6a8 8 0 0 1-16 0V5Z"/><path d="M9 10h.01M15 10h.01"/><path d="M9 14c1.5 1.3 4.5 1.3 6 0"/>',
  scroll: '<path d="M7 3h11v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1h11v1a3 3 0 0 0 3 3"/><path d="M7 3a2 2 0 0 0-2 2v11"/><path d="M9 8h6M9 12h6"/>',
  library: '<path d="M4 4h4v16H4zM10 4h4v16h-4z"/><path d="m16 5 3.5-1 2.5 15.5-3.5 1z"/>',
  file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  bag: '<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
};
const icon = n => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const caret = '<svg class="caret" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';

// ---------- Helpers ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const textOf = h => decode(h.replace(/<[^>]+>/g, ' ')).replace(/\[\[[^\]]*\]\]/g, ' ').replace(/[\s­]+/g, ' ').trim();
const clip = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,;:.\s]+$/, '') + '…');

function rewriteUrl(u) {
  if (/^https?:\/\/lithelp\.yolasite\.com\//i.test(u)) u = u.replace(/^https?:\/\/lithelp\.yolasite\.com\//i, '');
  if (/^(https?:|mailto:|tel:|#|\/\/|data:)/i.test(u)) return u;
  if (u === './' || u === '' || u === 'index.php') return '/';
  if (/^(resources|classes|templates)\//.test(u)) return '/' + u.replace(/\?\d+$/, '');
  const m = u.match(/^([\w\-]+)\.php(#.*)?$/);
  if (m) return (m[1] === 'index' ? '/' : '/' + m[1] + '.php/') + (m[2] || '');
  return u;
}

const EXT_TAG = { pdf: 'PDF', docx: 'DOC', doc: 'DOC', pptx: 'PPT', jpg: 'JPG', png: 'PNG' };
function fileCard(href, name, size, type) {
  const t = type.toLowerCase();
  const kb = parseFloat(size);
  const human = !size ? '' : ' · ' + (kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.round(kb) + ' KB');
  return `<a class="file" href="${href}" download><span class="tag ${t}">${EXT_TAG[t] || t.toUpperCase()}</span>` +
    `<span><span class="name">${name}</span><span class="meta">${t.toUpperCase()}${human}</span></span></a>`;
}

function quizHtml(slug) {
  const q = quizzes[slug];
  if (!q) return '';
  const json = JSON.stringify(q.data).replace(/</g, '\\u003c');
  return `<div class="rcf-quiz" id="${q.id}"><h2>${esc(q.title)}</h2><p class="by">${esc(q.by)}</p>` +
    `<div class="questions"></div><button type="button" class="check">Check my answers</button>` +
    `<button type="button" class="reset">Try again</button><div class="result" aria-live="polite">Choose one answer for each question.</div>` +
    `<script type="application/json">${json}</script></div>`;
}

const contactBox = () => `<div class="contact"><p style="margin:0">To enrol or ask about RCF online Literature classes, contact RCF on WhatsApp.</p>` +
  `<a class="btn" href="https://wa.me/94704395240" target="_blank" rel="noopener">WhatsApp 070 439 5240</a></div>`;

// Converts one original Yola content fragment into the new page body.
function transform(html, page) {
  let h = html;

  h = h.replace(/<p>\[\[YOUTUBE ([\w-]+)\]\]<\/p>/g, (m, id) =>
    `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Video: ${esc(page.label)}" loading="lazy" ` +
    `allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`);
  h = h.replace(/<p>\[\[FB-LIKE\]\]<\/p>\n?/g, '');
  h = h.replace(/<p>\[\[FORM:[^\]]*\]\]<\/p>/g, contactBox);
  h = h.replace(/<p>\[\[QUIZ\]\]<\/p>/g, () => quizHtml(page.slug));

  // Yola "file box" tables -> download cards.
  h = h.replace(/<table>\s*<tbody><tr>\s*<td>\s*<img src="classes\/components\/File\/resources\/images\/\w+\.png\?\d+" alt="[^"]*">\s*<\/td>\s*<td>\s*<a href="([^"]+)">([^<]+)<\/a><br>\s*Size : ([\d.]+) Kb <br>\s*Type : (\w+)\s*<\/td>\s*<\/tr><tr>\s*<\/tr><\/tbody><\/table>/g,
    (m, href, name, size, type) => fileCard(href, name, size, type));
  // Yola download buttons (bare links to documents) -> download cards.
  h = h.replace(/(?:<a href="resources\/[^"]+\.(?:pdf|pptx|docx)">\s*[^<]+?\s*<\/a>\s*){2,}/g, m =>
    [...m.matchAll(/<a href="(resources\/[^"]+\.(pdf|pptx|docx))">\s*([^<]+?)\s*<\/a>/g)].map(x => fileCard(x[1], x[3], null, x[2])).join('\n') + '\n');
  h = h.replace(/(?:<a class="file"[\s\S]*?<\/a>\s*){2,}/g, m => `<div class="files">${m.trim()}</div>\n`);

  // Yola image gallery (empty links to scans) -> thumbnail grid.
  h = h.replace(/(?:<a href="resources\/([^"]+\.jpg)">\s*<\/a>\s*){2,}/g, m => {
    const items = [...m.matchAll(/<a href="resources\/([^"]+\.jpg)">/g)].map(x => x[1]);
    return `<div class="gallery">` + items.map(f => {
      const name = decodeURIComponent(f).replace(/\.jpg$/, '');
      return `<a href="/resources/${f}" data-title="${esc(name)}"><img src="/resources/thumbs/${f}" alt="Scanned note page: ${esc(name)}" loading="lazy" width="480" height="640">${esc(name)}</a>`;
    }).join('') + `</div>\n`;
  });

  // Images that are already broken on the Yola site.
  h = h.replace(/<img [^>]*src="file:[^"]*"[^>]*>/g, '');
  h = h.replace(/<img [^>]*src="resources\/download%20%281%29\.jpg"[^>]*>\n?/g, '');
  h = h.replace(/<tr><td><br><img src="http:\/\/www\.kiplingsociety\.co\.uk\/pix\/camel\.jpg"><\/td><\/tr>/g, '');
  // Facebook-hosted emoji images -> the emoji itself.
  h = h.replace(/<img alt="([^"]+)" src="https:\/\/static\.xx\.fbcdn\.net\/[^"]*">/g, '$1');
  // Empty links left over from Yola.
  h = h.replace(/<h3><a href="[^"]*"><\/a><\/h3>\n?/g, '').replace(/<a href="[^"]*"><\/a>/g, '').replace(/<a><\/a>/g, '');

  // One <h1> per page (the page title); long paragraphs Yola marked as headings become paragraphs.
  h = h.replace(/<(\/?)h1>/g, '<$1h2>');
  h = h.replace(/<(h[2-6])>([\s\S]*?)<\/\1>/g, (m, tag, inner) => (textOf(inner).length > 160 ? `<p>${inner}</p>` : m));

  h = h.replace(/(href|src)="([^"]*)"/g, (m, a, u) => `${a}="${rewriteUrl(u)}"`);
  h = h.replace(/<a href="(https?:\/\/[^"]+)"(?! target)/g, '<a href="$1" target="_blank" rel="noopener"');
  h = h.replace(/<img (?![^>]*\balt=)/g, `<img alt="${esc(page.label)}" `);
  h = h.replace(/<img (?![^>]*\bloading=)/g, '<img loading="lazy" ');
  h = h.replace(/<(p|h[2-6])>((?:(?!<\/\1>)[\s\S])*?[඀-෿](?:(?!<\/\1>)[\s\S])*?)<\/\1>/g, '<$1 lang="si">$2</$1>');
  return h;
}

// ---------- Layout ----------
function navHtml(current) {
  const cur = current && (current.parent ? current.parent.slug : current.slug);
  const items = pagesData.nav.map(top => {
    const active = top.slug === cur;
    if (!top.children) {
      return `<li${active ? ' class="active"' : ''}><a href="${urlOf(top.slug)}"${current && current.slug === top.slug ? ' aria-current="page"' : ''}>${esc(labelOf(top))}</a></li>`;
    }
    const mega = top.children.length > 8 ? ' mega' : '';
    const subs = [`<li class="overview"><a href="${urlOf(top.slug)}">All ${esc(labelOf(top).toLowerCase())} →</a></li>`]
      .concat(top.children.map(c => `<li><a href="${urlOf(c.slug)}"${current && current.slug === c.slug ? ' aria-current="page"' : ''}>${esc(c.label)}</a></li>`));
    return `<li class="has-sub${mega}${active ? ' active' : ''}"><button type="button" aria-expanded="false">${esc(labelOf(top))}${caret}</button><ul class="sub">${subs.join('')}</ul></li>`;
  });
  return `<nav class="nav" id="site-nav" aria-label="Main"><ul>${items.join('')}</ul></nav>`;
}

function layout({ page, title, description, canonical, body, hasQuiz, hasSinhala, breadcrumbs }) {
  const fonts = 'family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400' + (hasSinhala ? '&family=Noto+Sans+Sinhala:wght@400;600' : '');
  const ld = breadcrumbs && breadcrumbs.length > 1 ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: SITE_URL + b.url })),
  })}</script>` : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">\n` : ''}<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(title)}">
${description ? `<meta property="og:description" content="${esc(description)}">\n` : ''}<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE_URL}/resources/imageedit_1_8950105283.png">
<meta name="theme-color" content="#1f5fa8">
<link rel="icon" href="/resources/imageedit_1_8950105283.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts}&display=swap">
<link rel="stylesheet" href="/assets/site.css?v=${ASSET_V}">
${hasQuiz ? `<link rel="stylesheet" href="/assets/quiz.css?v=${ASSET_V}">\n` : ''}${ld}
${ADS.enabled ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS.client}" crossorigin="anonymous"></script>\n` : ''}</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="/"><img src="/resources/imageedit_1_8950105283.png" alt="O/L Literature Help" width="184" height="95"><span><b>O/L Literature Help</b><small>G.C.E. O/L English Literature</small></span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span class="menu-label">Menu</span></button>
    ${navHtml(page)}
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div><h2>O/L Literature Help</h2><p style="margin:0 0 .6rem">G.C.E. O/L English Literature notes, translations, quizzes and past papers by RCF Creations.</p><p style="margin:0">${esc(pagesData.footer)}</p></div>
    <div><h2>Study</h2><ul>${['My-Poems', 'OL-LITERATURE-HELP', 'drama', 'OL-Prose', 'novels'].map(s => `<li><a href="${urlOf(s)}">${esc(labelOf(bySlug[s]))}</a></li>`).join('')}</ul></div>
    <div><h2>More</h2><ul>${['papers', 'RCF-Publications', 'rcf-lit-class'].map(s => `<li><a href="${urlOf(s)}">${esc(labelOf(bySlug[s]))}</a></li>`).join('')}<li><a href="https://rcfenglish.com" target="_blank" rel="noopener">rcfenglish.com</a></li></ul></div>
  </div>
  <div class="fine">Copyright O/L Literature Help · RCF Creations <span class="heart">♥</span></div>
</footer>
<script src="/assets/site.js?v=${ASSET_V}" defer></script>
${hasQuiz ? `<script src="/assets/quiz.js?v=${ASSET_V}" defer></script>\n` : ''}</body>
</html>
`;
}

function writePage(slug, html) {
  const file = slug === 'index' ? path.join(OUT, 'index.html') : path.join(OUT, slug + '.php', 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function redirectPage(to, title) {
  const target = SITE_URL + to;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>` +
    `<meta name="robots" content="noindex"><link rel="canonical" href="${target}">` +
    `<meta http-equiv="refresh" content="0; url=${to}"><script>location.replace(${JSON.stringify(to)} + location.hash)</script></head>` +
    `<body><p>This page has moved to <a href="${to}">${esc(target)}</a>.</p></body></html>`;
}

// ---------- Pages ----------
const crumbsFor = page => {
  const c = [{ name: 'Home', url: '/' }];
  if (page.parent) c.push({ name: labelOf(page.parent), url: urlOf(page.parent.slug) });
  if (page.slug !== 'index') c.push({ name: labelOf(page), url: urlOf(page.slug) });
  return c;
};
const crumbsHtml = c => `<nav class="crumbs" aria-label="Breadcrumb">${c.map((b, i) => (i < c.length - 1 ? `<a href="${b.url}">${esc(b.name)}</a><span aria-hidden="true">›</span>` : `<span aria-current="page">${esc(b.name)}</span>`)).join('')}</nav>`;

function sectionCards(slugs) {
  return `<div class="cards">` + slugs.map(s => {
    const p = bySlug[s];
    const [name, blurb, ic] = SECTION_INFO[s];
    const n = p.children ? `<span class="count">${p.children.length} ${p.children.length === 1 ? 'text' : 'texts'} →</span>` : '<span class="count">Open →</span>';
    return `<a class="card" href="${urlOf(s)}"><span class="ico">${icon(ic)}</span><h3>${esc(name)}</h3><p>${esc(blurb)}</p>${n}</a>`;
  }).join('') + `</div>`;
}

const built = [];

// Revised O/L study guides live in content/revised/<slug>.html. When one exists it becomes the
// main page at the old address, and the verbatim original moves to /<slug>.php/original/.
const revisedDir = path.join(ROOT, 'content', 'revised');
const hasRevised = slug => fs.existsSync(path.join(revisedDir, slug + '.html'));

// Study path used on every guide: each section id belongs to one step.
const STEPS = [
  ['Learn', 'Know the writer and the world of the text', ['poet', 'author', 'background', 'setting']],
  ['Understand', 'Follow the story and the meaning', ['synopsis', 'plot', 'structure', 'analysis', 'translation', 'characters', 'themes', 'techniques', 'tone']],
  ['Practise', 'Try exam-style short questions', ['context-questions', 'short-questions', 'passage-questions']],
  ['Answer', 'Plan and write full essays', ['essay-questions']],
  ['Revise', 'Check yourself before the exam', ['revision', 'downloads']],
];
const SECTION_ICON = {
  poet: 'user', author: 'user', background: 'globe', setting: 'pin', synopsis: 'list', plot: 'list', structure: 'layers',
  analysis: 'search', translation: 'globe', characters: 'users2', themes: 'bulb', techniques: 'palette', tone: 'wave',
  'context-questions': 'quote', 'short-questions': 'quote', 'passage-questions': 'quote', 'essay-questions': 'pen', revision: 'refresh', downloads: 'download',
};
const GICONS = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  users2: '<circle cx="8" cy="9" r="3"/><circle cx="17" cy="9" r="3"/><path d="M2.5 19a5.5 5.5 0 0 1 11 0M12 19a5 5 0 0 1 9.5-2"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18c1.2 0 1.6-1 1.1-2-.6-1.2.2-2.5 1.6-2.5H17a4 4 0 0 0 4-4C21 7 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
  wave: '<path d="M2 12c2.5-4 4.5-4 7 0s4.5 4 7 0 4.5-4 6 0"/>',
  quote: '<path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6"/>',
  pen: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 13a8 8 0 0 0 14.9 3"/><path d="M5 3v5h5M19 21v-5h-5"/>',
  download: '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>',
};
const gicon = n => `<svg class="h-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GICONS[n]}</svg>`;

// Guide-only markup: [[AD]] ad spaces, [[TOC]] study path, heading icons, fact cards, responsive tables.
function guideExtras(h) {
  h = h.replace(/<p>\[\[AD\]\]<\/p>|\[\[AD\]\]/g, () => adHtml());
  const sections = [...h.matchAll(/<h2 id="([\w-]+)">([\s\S]*?)<\/h2>/g)].map(m => ({ id: m[1], name: textOf(m[2]) }));
  if (h.includes('[[TOC]]')) {
    const path = STEPS.map(([step, hint, ids], i) => {
      const links = sections.filter(s => ids.includes(s.id));
      if (!links.length) return '';
      return `<li><a class="step" href="#${links[0].id}"><span class="step-n">${i + 1}</span><span><b>${step}</b><small>${hint}</small></span></a>` +
        `<span class="step-links">${links.map(s => `<a href="#${s.id}">${esc(s.name)}</a>`).join('')}</span></li>`;
    }).join('');
    h = h.replace(/<p>\[\[TOC\]\]<\/p>|\[\[TOC\]\]/, `<nav class="study-path" aria-label="Study path"><ol>${path}</ol></nav>`);
  }
  h = h.replace(/<h2 id="([\w-]+)">/g, (m, id) => {
    const step = STEPS.findIndex(s => s[2].includes(id));
    return `<h2 id="${id}"${step >= 0 ? ` data-step="${STEPS[step][0]}"` : ''}>${SECTION_ICON[id] ? gicon(SECTION_ICON[id]) : ''}`;
  });
  // Quick-facts list -> cards.
  h = h.replace(/<dl class="facts">([\s\S]*?)<\/dl>/, (m, inner) =>
    `<dl class="facts">${inner.replace(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g, '<div class="fact"><dt>$1</dt><dd>$2</dd></div>')}</dl>`);
  // Technique tables: label each cell so they turn into cards on phones.
  h = h.replace(/<table class="terms">([\s\S]*?)<\/table>/g, (m, inner) => {
    const heads = [...(inner.match(/<thead>([\s\S]*?)<\/thead>/) || ['', ''])[1].matchAll(/<th>([\s\S]*?)<\/th>/g)].map(x => textOf(x[1]));
    const body = inner.replace(/<tr>([\s\S]*?)<\/tr>/g, (r, cells) => {
      let i = 0;
      return '<tr>' + cells.replace(/<td>/g, () => `<td data-label="${esc(heads[i++] || '')}">`) + '</tr>';
    });
    return `<table class="terms">${body}</table>`;
  });
  return h;
}

// Places ad spaces into an original page: one after roughly the first third, one at the end.
function addAdsToOriginal(h) {
  if (!ADS.enabled) return h;
  const breaks = [...h.matchAll(/<\/p>\n/g)].map(m => m.index + m[0].length);
  if (breaks.length > 8) { const at = breaks[Math.floor(breaks.length / 3)]; h = h.slice(0, at) + adHtml() + h.slice(at); }
  return h + adHtml();
}

function renderArticle(page, src, mode) {
  // A guide may set its search description with <!-- description: ... --> on the first line.
  let metaDesc = '';
  src = src.replace(/^<!--\s*description:\s*([\s\S]*?)-->\s*/, (m, d) => { metaDesc = d.trim(); return ''; });
  let h1;
  const first = src.match(/^<(h[1-6])(?: [^>]*)?>([\s\S]*?)<\/\1>/);
  if (first && textOf(first[2])) { h1 = textOf(first[2]); src = src.slice(first[0].length).trim(); }
  else h1 = labelOf(page);
  const hasQuiz = src.includes('[[QUIZ]]');
  const hasSinhala = /[඀-෿]/.test(src);
  let inner = transform(src, page);
  inner = mode === 'guide' ? guideExtras(inner) : addAdsToOriginal(inner);
  const para = (inner.match(/<p(?: lang="si")?>([\s\S]*?)<\/p>/g) || []).map(textOf).find(t => t.length > 60 && !/[඀-෿]/.test(t));
  return { h1, inner, hasQuiz, hasSinhala, description: metaDesc || (para ? clip(para, 158) : '') };
}

for (const page of all) {
  if (page.slug === 'index') continue;
  const isEmptySection = pagesData.emptyOnYola.includes(page.slug);
  const revised = !isEmptySection && hasRevised(page.slug);
  const crumbs = crumbsFor(page);
  let art;

  if (isEmptySection) {
    // These section pages are blank on Yola; here they list the texts in the section.
    const description = SECTION_INFO[page.slug][1];
    art = {
      h1: labelOf(page), description, hasQuiz: false, hasSinhala: false,
      inner: `<p style="font-family:var(--ui);color:var(--muted);margin-top:0">${esc(description)}</p><div class="list-cards">` +
        page.children.map((c, i) => `<a href="${urlOf(c.slug)}"><span class="num">${i + 1}</span>${esc(c.label)}${hasRevised(c.slug) ? '<span class="badge">Study guide</span>' : ''}</a>`).join('') + `</div>`,
    };
  } else {
    const original = fs.readFileSync(path.join(ROOT, 'content', 'original', page.slug + '.html'), 'utf8').trim();
    art = revised ? renderArticle(page, fs.readFileSync(path.join(revisedDir, page.slug + '.html'), 'utf8').trim(), 'guide')
      : renderArticle(page, original, 'original');

    if (revised) {
      // Archive copy of the original notes, unchanged, at /<slug>.php/original/
      const o = renderArticle(page, original, 'original');
      const oCrumbs = crumbs.concat([{ name: 'Original notes', url: urlOf(page.slug) + 'original/' }]);
      const oBody = `<div class="page-head"><div class="wrap">${crumbsHtml(oCrumbs)}<span class="kicker">Original notes · archive</span><h1>${o.h1}</h1></div></div>
<div class="wrap layout"><div><p class="archive-note">These are the original LitHelp notes for this text, kept unchanged. For the updated O/L study guide with explanations, exam questions and model answers, see <a href="${urlOf(page.slug)}">${esc(labelOf(page))}: study guide</a>.</p><article class="prose">
${o.inner}
</article></div></div>`;
      const file = path.join(OUT, page.slug + '.php', 'original', 'index.html');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, layout({
        page, title: page.title + ' (original notes)', description: o.description, canonical: SITE_URL + urlOf(page.slug) + 'original/',
        body: oBody, hasQuiz: o.hasQuiz, hasSinhala: o.hasSinhala, breadcrumbs: oCrumbs,
      }).replace('<head>', '<head>\n<meta name="robots" content="noindex, follow">'));
    }
  }

  const siblings = page.parent ? page.parent.children : null;
  let pager = '', aside = '';
  if (siblings) {
    const i = siblings.findIndex(s => s.slug === page.slug);
    const prev = siblings[i - 1], next = siblings[i + 1];
    pager = `<nav class="pager" aria-label="More in ${esc(labelOf(page.parent))}">` +
      (prev ? `<a class="prev" href="${urlOf(prev.slug)}"><small>← Previous</small>${esc(prev.label)}</a>` : '') +
      (next ? `<a class="next" href="${urlOf(next.slug)}"><small>Next →</small>${esc(next.label)}</a>` : '') + `</nav>`;
    aside = `<aside class="aside" aria-label="${esc(labelOf(page.parent))}"><h2>${esc(labelOf(page.parent))}</h2><ul>` +
      siblings.map(s => `<li><a href="${urlOf(s.slug)}"${s.slug === page.slug ? ' aria-current="page"' : ''}>${esc(s.label)}</a></li>`).join('') + `</ul>${adHtml('aside')}</aside>`;
  }

  const kicker = page.parent ? labelOf(page.parent) + (revised ? ' · O/L study guide' : '') : '';
  const originalLink = revised ? `<p class="archive-note">Looking for the earlier LitHelp notes on this text? <a href="${urlOf(page.slug)}original/">Read the original notes</a>.</p>` : '';
  const body = `<div class="page-head${revised ? " guide-head" : ""}"><div class="wrap">${crumbsHtml(crumbs)}${kicker ? `<span class="kicker">${esc(kicker)}</span>` : ''}<h1>${art.h1}</h1></div></div>
<div class="wrap layout${aside ? ' has-aside' : ''}">
<div><article class="prose${revised ? ' guide' : ''}">
${art.inner}
</article>${originalLink}${pager}</div>
${aside}
</div>`;

  writePage(page.slug, layout({
    page, title: page.title, description: art.description, canonical: SITE_URL + urlOf(page.slug), body,
    hasQuiz: art.hasQuiz, hasSinhala: art.hasSinhala, breadcrumbs: crumbs,
  }));
  built.push(page.slug);
}

// ---------- Home ----------
{
  const page = bySlug.index;
  const body = `<section class="hero"><div class="wrap">
  <span class="eyebrow">G.C.E. O/L English Literature</span>
  <h1>O/L Literature Help</h1>
  <p>Your trusted online resource for G.C.E. O/L English Literature learning and teaching. This website provides students and teachers with easy access to the syllabus, poetry, drama, prose, novels, past papers and other useful learning materials. Our aim is to make literature clearer, more enjoyable and easier to study through well-organized and practical resources.</p>
  <div class="cta"><a class="btn btn-light" href="${urlOf('OL-LITERATURE-HELP')}">Start with poetry</a><a class="btn btn-ghost" href="${urlOf('papers')}">Past papers &amp; resources</a></div>
  <p class="notice">For the latest resources, study guides, and updates, please visit our new official website at <a href="https://rcfenglish.com" target="_blank" rel="noopener">rcfenglish.com</a>.</p>
</div></section>
<section class="section"><div class="wrap">
  <h2 class="title">Explore the sections</h2>
  <p class="lede">Explore the sections above and begin your journey towards a better understanding and appreciation of English Literature.</p>
  ${sectionCards(['My-Poems', 'OL-LITERATURE-HELP', 'drama', 'OL-Prose', 'novels', 'papers', 'RCF-Publications', 'rcf-lit-class'])}
</div></section>
<section class="section" style="padding-top:0"><div class="wrap">
  <h2 class="title">How to study with LitHelp</h2>
  <p class="lede">Every O/L study guide follows the same five steps, so you always know what to do next.</p>
  <ol class="path-banner">
    <li><span class="n">1</span><b>Learn</b><span>Read about the writer, the background and the setting.</span></li>
    <li><span class="n">2</span><b>Understand</b><span>Follow the story, then work through the line-by-line analysis, themes and techniques.</span></li>
    <li><span class="n">3</span><b>Practise</b><span>Try the exam-style context questions before opening the model answers.</span></li>
    <li><span class="n">4</span><b>Answer</b><span>Plan and write essays the way examiners mark them: content, organisation, language.</span></li>
    <li><span class="n">5</span><b>Revise</b><span>Use the quick-revision cards and common mistakes before the exam.</span></li>
  </ol>
</div></section>
${(() => {
  const guides = all.filter(p => p.parent && hasRevised(p.slug));
  if (!guides.length) return '';
  return `<section class="section" style="padding-top:0"><div class="wrap">
  <h2 class="title">New O/L study guides</h2>
  <p class="lede">Full study guides with line-by-line analysis, exam-style questions and model answers.</p>
  <div class="cards">${guides.map(g => `<a class="card" href="${urlOf(g.slug)}"><span class="ico">${icon(SECTION_INFO[g.parent.slug][2])}</span><h3>${esc(g.label)}</h3><p>${esc(labelOf(g.parent))} · study guide</p><span class="count">Open guide →</span></a>`).join('')}</div>
</div></section>`;
})()}
<section class="section" style="padding-top:0"><div class="wrap">
  <div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))">
    <div class="panel"><h2 class="title" style="font-size:1.4rem">What is new!</h2><ol style="margin:.4rem 0 1rem;padding-left:1.2rem"><li>O/L Literature Questions Bank</li><li>Poetry Interactive Quizzes</li><li>Presentations</li></ol><a class="btn btn-brand" href="${urlOf('papers')}">Visit the Papers section</a></div>
    <div class="panel"><h2 class="title" style="font-size:1.4rem">RCF Publications</h2><p>Explore practical English and Literature eBooks for students and teachers. Our publications include grammar practice books, O/L Literature study guides and English support materials.</p><a class="btn btn-brand" href="${urlOf('RCF-Publications')}">View RCF Publications</a></div>
    <div class="panel"><h2 class="title" style="font-size:1.4rem">Need help with English Literature?</h2><p>Explore the resources above or contact RCF Publications on WhatsApp: 070 439 5240.</p><a class="btn btn-brand" href="https://wa.me/94704395240" target="_blank" rel="noopener">WhatsApp RCF</a></div>
  </div>
</div></section>`;
  writePage('index', layout({
    page, title: page.title,
    description: 'Free G.C.E. O/L English Literature notes, poem analyses, Sinhala translations, quizzes, past papers and study resources for students and teachers.',
    canonical: SITE_URL + '/', body, breadcrumbs: null,
  }));
  built.push('index');
}

// ---------- Redirects for old addresses ----------
fs.mkdirSync(path.join(OUT, 'index.php'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.php', 'index.html'), redirectPage('/', SITE_NAME));
const gone = Object.entries(pagesData.goneFromYola).filter(([k]) => !k.startsWith('_'));
for (const [from, to] of gone) {
  fs.mkdirSync(path.join(OUT, from + '.php'), { recursive: true });
  fs.writeFileSync(path.join(OUT, from + '.php', 'index.html'), redirectPage(urlOf(to), labelOf(bySlug[to])));
}

// ---------- 404 (also catches odd spellings of old URLs) ----------
const known = all.map(p => p.slug).concat(gone.map(g => g[0]));
fs.writeFileSync(path.join(OUT, '404.html'), layout({
  page: null, title: 'Page not found | ' + SITE_NAME, description: '', canonical: SITE_URL + '/404.html',
  body: `<div class="wrap notfound"><h1>Page not found</h1><p>Sorry, that page is not here. Try the menu above, or go to the <a href="/">home page</a>.</p></div>
<script>(function(){var k=${JSON.stringify(known)};var p=decodeURIComponent(location.pathname).replace(/^\\/+|\\/+$/g,'').replace(/\\.(php|html?)$/i,'');var lc=p.toLowerCase();for(var i=0;i<k.length;i++){if(k[i].toLowerCase()===lc){location.replace('/'+k[i]+'.php/');return;}}})();</script>`,
}).replace('<head>', '<head>\n<meta name="robots" content="noindex">'));

// ---------- sitemap.xml, robots.txt, .nojekyll, assets ----------
const sitemapUrls = ['index'].concat(all.filter(p => p.slug !== 'index').map(p => p.slug));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(s => `  <url><loc>${SITE_URL}${urlOf(s)}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
if (ADS.enabled) fs.writeFileSync(path.join(OUT, 'ads.txt'), 'google.com, ' + ADS.client.replace('ca-', '') + ', DIRECT, f08c47fec0942fa0\n');
else if (fs.existsSync(path.join(OUT, 'ads.txt'))) fs.unlinkSync(path.join(OUT, 'ads.txt'));
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const f of fs.readdirSync(path.join(ROOT, 'src', 'assets'))) fs.copyFileSync(path.join(ROOT, 'src', 'assets', f), path.join(OUT, 'assets', f));

console.log(`Built ${built.length} pages, ${gone.length + 1} redirects, sitemap with ${sitemapUrls.length} URLs -> ${SITE_URL}`);

// Files that must sit at the site root unchanged (e.g. Google Search Console verification).
for (const f of fs.readdirSync(path.join(ROOT, 'src', 'root'))) fs.copyFileSync(path.join(ROOT, 'src', 'root', f), path.join(OUT, f));
