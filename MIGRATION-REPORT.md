# LitHelp Migration Report

Source: https://lithelp.yolasite.com/ (left untouched)
Target: https://lithelp.github.io/ (GitHub Pages, free)
Built and tested locally: 2026-10-04

## Summary

| Item | Status |
|---|---|
| Number of pages copied | **40 of 40** live Yola pages (36 with content + 4 section pages that are empty on Yola; those now list their texts) |
| Original text preserved | **36 / 36** pages verified word-for-word against the live site (`node verify.js`) |
| Number of images copied | **97** original images + 31 new preview thumbnails (originals untouched) |
| Number of documents/files copied | **43** (.docx, .pdf, .pptx), all with original filenames and at the original `/resources/...` paths |
| Old URLs preserved | **All 40**: `/Name.php` keeps working (GitHub Pages redirects it to `/Name.php/`) |
| Old dead URLs revived | **7** redirect pages: `index.php`, `contact.php`, `FUN-ZONE.php`, `Model-Papers.php`, `queries.php`, `OL-Drama.php`, `OL-Novels.php` |
| Broken internal links | **0** (2,957 internal links, images and downloads checked) |
| Missing images | 0 new. **7 were already broken on Yola** (see below) |
| SWF files | **None** used by any live page |
| Interactive quizzes | **10 / 10** working (garbled characters from Yola repaired) |
| YouTube videos | **19** embeds working |
| SEO titles preserved | **Yes**: every page keeps its exact original `<title>` |
| Meta descriptions | **Added** (Yola's were empty); taken from each page's own opening text |
| Canonical URLs, breadcrumbs, Open Graph | Added |
| Sitemap created | **Yes**: `sitemap.xml` (40 URLs) |
| robots.txt created | **Yes** |
| Mobile display | **Pass**: every page checked at 320, 360 and 414 px wide, no sideways scrolling; no JavaScript errors |
| GitHub Pages working | **Not yet**: needs the `lithelp` GitHub organisation (only you can create it). Then upload and re-test `/Name.php` on the live site |

## Problems found (already present on Yola, not caused by the migration)

| Page | Problem | What the new site does |
|---|---|---|
| The-Twilight-of-a-Crane | Image `download (1).jpg` missing on Yola (404) | Image left out |
| Elements-of-Poetry---You-must-read-this | 5 images point to `file:///C:/Users/Sohan/...` (pasted from Word, never uploaded) | Left out. The page's Word download still has the full notes |
| poem-about-camel | Camel picture hotlinked from kiplingsociety.co.uk, now 404 | Left out |
| Upside-Down | Link to site-children.com: the website no longer exists | Link kept as in the original (can be removed during revision) |
| Richard-Cory | Link to poetryfoundation.org blocks automated checks (probably fine in a browser) | Kept |
| RCF-Publications | Emoji were images hotlinked from Facebook | Replaced with real emoji characters |
| To-the-Nile-by-Keats | Facebook "Like" box | Removed (it is a Facebook tracking widget and does not work without Yola's setup) |
| rcf-lit-class | Contact form (needs Yola's server and hCaptcha) | Replaced with a WhatsApp button (070 439 5240, the number used elsewhere on the site) |
| papers | Heading says "Resouces" (typo in the original) | Kept, to be fixed in the content revision |

Note: two different phone numbers appear in the original: 070 439 5240 (in page content) and 071 439 5240 (Yola footer). Both are shown where they originally appeared.

## Not migrated (by design)
- Google AdSense code (`ca-pub-5600707937611761`): AdSense must approve each new domain, so it was not added. It can be added after GitHub Pages is live, if you want ads.
- Yola analytics, SiteWit tracking, Google Maps embed in the Yola footer.

## Files in this project
- `content/original/`: verified copy of the original page content (the archive; never edited)
- `content/quizzes.json`, `content/pages.json`: quizzes, menu, titles and old-URL redirects
- `src/assets/`: design (CSS) and scripts
- `build.js`: builds the site into `docs/`
- `verify.js`: re-checks the archive against the fingerprints taken from the live Yola site
- `check.js`: checks every link, image and download (`node check.js --external` also tests outside links)
- `serve.js`: local preview that behaves like GitHub Pages
- `docs/`: the finished website that GitHub Pages publishes
- `MIGRATION-INVENTORY.md`: the full Phase 1 inventory
