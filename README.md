# O/L Literature Help

Source for https://lithelp.github.io/, the G.C.E. O/L English Literature site migrated from lithelp.yolasite.com.

## How it is organised
- `content/original/`: the original Yola page content, verified word-for-word against the live site. Treat it as the archive and don't edit it.
- `content/pages.json`: menu order, page titles, and redirects for old addresses.
- `content/quizzes.json`: the interactive poetry quizzes.
- `src/assets/`: styles and scripts.
- `docs/`: the generated website (GitHub Pages publishes this folder). `docs/resources/` holds the original images and documents at their original paths.

## Rebuild after a change
```
node build.js
node check.js
```
Preview locally with `node serve.js`, then open http://127.0.0.1:8080.

## Addresses
Every old Yola page `Name.php` is published as `docs/Name.php/index.html`, so `https://lithelp.github.io/Name.php` keeps working (GitHub Pages redirects it to `/Name.php/`).
