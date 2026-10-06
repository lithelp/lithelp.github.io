// Makes the downloadable PDFs of the RCF Practice Papers (question paper + answers for each paper).
// Usage: node build.js && node make-practice-pdfs.js && node build.js
// It serves ./docs on a local port, prints /practice-papers-2026/paper-N/?print=questions|answers with headless Chrome,
// and writes the PDFs to src/root/practice-papers-2026/pdf/ (the second build copies them into docs and adds the links).
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { execFile } = require('child_process');
const ROOT = __dirname, DOCS = path.join(ROOT, 'docs');
const OUT = path.join(ROOT, 'src', 'root', 'practice-papers-2026', 'pdf');
const PAPERS = require('./content/practice-papers-2026.js');
const PORT = 8091;
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
if (!CHROME) { console.error('Google Chrome not found.'); process.exit(1); }

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  let p = path.join(DOCS, decodeURIComponent(u.pathname));
  if (!p.startsWith(DOCS)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

// Chrome writes into the system temp folder (it may not see this project folder the same way), then we copy the file in.
function printPdf(url, file) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'lithelp-pdf-'));
  const tmp = path.join(work, 'out.pdf');
  return new Promise((resolve, reject) => execFile(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-pdf-header-footer',
    `--user-data-dir=${path.join(work, 'profile')}`, '--virtual-time-budget=10000', '--run-all-compositor-stages-before-draw', `--print-to-pdf=${tmp}`, url],
  { timeout: 120000 }, err => {
    try {
      if (!fs.existsSync(tmp)) return reject(err || new Error('Chrome made no PDF for ' + url));
      fs.copyFileSync(tmp, file);
      resolve();
    } finally { try { fs.rmSync(work, { recursive: true, force: true }); } catch (e) {} }
  }));
}

server.listen(PORT, '127.0.0.1', async () => {
  fs.mkdirSync(OUT, { recursive: true });
  try {
    for (const p of PAPERS) {
      for (const mode of ['questions', 'answers']) {
        const file = path.join(OUT, `RCF-Practice-Paper-${p.n}-OL-2026${mode === 'answers' ? '-Answers' : ''}.pdf`);
        if (fs.existsSync(file)) fs.unlinkSync(file);
        await printPdf(`http://127.0.0.1:${PORT}/practice-papers-2026/paper-${p.n}/?print=${mode}`, file);
        console.log(path.basename(file), Math.round(fs.statSync(file).size / 1024) + ' KB');
      }
    }
  } catch (e) { console.error(e.message); process.exitCode = 1; }
  server.close();
});
