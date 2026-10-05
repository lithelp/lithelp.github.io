// Checks every quotation in the RCF Practice Papers (content/practice-papers-2026.js) against its sources:
// the LitHelp pages (content/original, content/revised), Project Gutenberg texts (sources/gutenberg)
// and sources/verified-quotes.txt. Usage: node check-practice.js
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const papers = require('./content/practice-papers-2026.js');

const norm = s => s.toLowerCase()
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#39;|&rsquo;|&lsquo;|&quot;|&ldquo;|&rdquo;/g, '')
  .replace(/_/g, '')
  .replace(/[‘’‚‛'`“”"]/g, '')
  .replace(/[–—-]+/g, ' ')
  .replace(/[^a-z0-9 ]+/g, ' ')
  .replace(/\s+/g, ' ').trim();

let corpus = '';
for (const dir of ['content/original', 'content/revised']) {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) if (f.endsWith('.html')) corpus += ' ' + norm(fs.readFileSync(path.join(ROOT, dir, f), 'utf8'));
}
for (const f of fs.readdirSync(path.join(ROOT, 'sources/gutenberg'))) corpus += ' ' + norm(fs.readFileSync(path.join(ROOT, 'sources/gutenberg', f), 'utf8'));
corpus += ' ' + norm(fs.readFileSync(path.join(ROOT, 'sources/verified-quotes.txt'), 'utf8').split('\n').filter(l => !l.startsWith('#')).join(' '));

// A quotation may be split by an ellipsis or by " / " (a line break in poetry); check each piece.
function pieces(q) {
  return q.split(/\.{3,}|…|\s\/\s|\n/).map(norm).filter(p => p.split(' ').length >= 2);
}
const problems = [];
let checked = 0;
function check(where, q, minWords) {
  for (const p of pieces(q)) {
    if (p.split(' ').length < minWords) continue;
    checked++;
    if (!corpus.includes(p)) problems.push(`${where}: "${p}"`);
  }
}
// Quotations inside answers and essay points: text in double quotes, three words or more.
// Titles of texts are skipped.
const TITLES = new Set(['the eagle', 'once upon a time', 'the lumber room', 'the lahore attack', 'twilight of a crane', 'the bear',
  'a bird came down the walk', 'twos company', 'the nightingale and the rose', 'war is kind', 'fear', 'to the evening star',
  'the huntsman', 'farewell to barn and stack and tree', 'the camels hump', 'to the nile', 'father and son', 'richard cory',
  'the terrorist hes watching', 'breakfast', 'i know why the caged bird sings', 'the earthen goblet', 'big match 1983',
  'the clowns wife', 'upside down', 'wave', 'the prince and the pauper', 'bringing tony home', 'the vendor of sweets']);
function checkQuoted(where, text) {
  for (const m of String(text).matchAll(/"([^"]+)"/g)) {
    const q = m[1];
    if (TITLES.has(norm(q))) continue;
    if (norm(q).split(' ').length < 3) continue;
    check(where, q, 3);
  }
}

for (const p of papers) {
  p.a.forEach((it, i) => {
    check(`Paper ${p.n} A${i + 1} extract`, it.x, 2);
    it.q.forEach((q, j) => checkQuoted(`Paper ${p.n} A${i + 1}(${'abcd'[j]})`, q[2]));
  });
  p.b.forEach((it, i) => {
    check(`Paper ${p.n} B${i + 1} extract`, it.x, 2);
    it.q.forEach((q, j) => checkQuoted(`Paper ${p.n} B${i + 1} q${j + 1}`, q[2]));
  });
  for (const [sec, qs] of Object.entries(p.p2)) {
    qs.forEach(([, pts], i) => pts.forEach(pt => checkQuoted(`Paper ${p.n} II ${sec} ${i + 1}`, pt)));
  }
}
console.log(`Quotations checked: ${checked}, not found: ${problems.length}`);
for (const pr of problems) console.log('  ' + pr);
process.exitCode = problems.length ? 1 : 0;
