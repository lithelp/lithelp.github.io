// Compares each saved original-content file with the text fingerprint taken from the live Yola page.
const fs = require('fs'), path = require('path');
const norm = h => h.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const sig = h => { const t = norm(h); let x = 5381; for (const c of t) x = ((x*33) ^ c.codePointAt(0)) >>> 0; return [...t].length === t.length ? t.length + ':' + x.toString(16) : t.length + ':' + x.toString(16); };
let ok = 0, bad = 0, missing = 0;
for (const line of fs.readFileSync(path.join(__dirname, 'content/signatures.txt'), 'utf8').trim().split('\n')) {
  const [name, want] = line.split(' ');
  const f = path.join(__dirname, 'content/original', name + '.html');
  if (!fs.existsSync(f)) { missing++; continue; }
  const got = sig(fs.readFileSync(f, 'utf8'));
  if (got === want) ok++; else { bad++; console.log('MISMATCH', name, 'want', want, 'got', got); }
}
console.log(`verified ${ok}, mismatched ${bad}, not yet saved ${missing}`);
