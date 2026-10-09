// Checks every internal link, image and download in ./docs points at a real file.
// Usage: node check.js [--external]   (--external also tests outside links over the network)
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'docs');

const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!['resources', 'classes', 'templates'].includes(e.name)) walk(p); }
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(OUT);

function resolve(u) {
  let p = decodeURIComponent(u.split('#')[0].split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  return path.join(OUT, p);
}

const broken = [], external = new Set();
let checked = 0;
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^https?:/.test(u)) { if (!/fonts\.(googleapis|gstatic)|(www\.)?rcflithelp\.com|lithelp\.github\.io/.test(u)) external.add(u); continue; }
    if (/^(mailto:|tel:|#|data:)/.test(u)) continue;
    if (!u.startsWith('/')) { broken.push([path.relative(OUT, f), u, 'relative link']); continue; }
    checked++;
    if (!fs.existsSync(resolve(u))) broken.push([path.relative(OUT, f), u, 'missing']);
  }
}
console.log(`HTML files: ${htmlFiles.length}, internal links checked: ${checked}, broken: ${broken.length}, external links: ${external.size}`);
for (const b of broken) console.log('  BROKEN', b.join('  |  '));

if (process.argv.includes('--external')) {
  (async () => {
    const bad = [];
    for (const u of external) {
      if (/youtube-nocookie\.com\/embed/.test(u) || /wa\.me\//.test(u)) continue;
      try {
        const r = await fetch(u, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 LitHelp link check' } });
        if (r.status >= 400) bad.push([r.status, u]);
      } catch (e) { bad.push(['ERR ' + (e.cause?.code || e.name), u]); }
    }
    console.log(`External links not working: ${bad.length}`);
    for (const b of bad) console.log('  ', b.join('  '));
  })();
}
