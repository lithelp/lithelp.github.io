# LitHelp Migration Inventory (Phase 1)

Source (master copy, untouched): https://lithelp.yolasite.com/
Crawled: 2026-10-04 (read-only, nothing on Yola was changed)

## Platform facts
- Yola Sitebuilder Classic, template `Skyline_v2`; every page is `/<Name>.php`.
- `.php` pages sit behind a Cloudflare bot check (command-line downloads get 403). Images/documents under `/resources/` download freely.
- Existing Yola `robots.txt`: `User-agent: *`, `Disallow: /definitions/`, points to `sitemap.xml`.
- Pages carry Google AdSense (`ca-pub-5600707937611761`), Yola/SiteWit analytics, a Google Maps embed (home), a Facebook Like box (To the Nile), and an hCaptcha form (rcf-lit-class).
- Most pages have an **empty** `<meta name="description">` and `<meta name="keywords">`.

## Navigation (top menu)
| Menu | Page | Sub-pages |
|---|---|---|
| HOME | `index.php` (`/`) | |
| SYLLABUS | `My-Poems.php` | |
| POETRY | `OL-LITERATURE-HELP.php` (empty on Yola) | Elements-of-Poetry---You-must-read-this, To-the-Nile-by-Keats, A-Bird-came-down-the-Walk, Farewell-to-Barn-Stack-and-Tree, To-the-Evening-Star, The-Eagle-by-Tennyson, War-is-Kind, I-know-why-the-Caged-Bird-Sings, poem-by-wislawa, Breakfast-by-Jaques-Prevert, Once-upon-a-Time-by-Gabriel-Okara, Richard-Cory, Big-Match-1983, The-Earthen-Goblet, poem-about-camel, Father-and-Son-by-Cat-Stevens, the-poem-fear, poem-about-clowns-wife, Upside-Down, The-Huntsman, They-said-the-House |
| DRAMA | `drama.php` (empty on Yola) | The-Bear-by-Anton-Chekov, The-Twilight-of-a-Crane |
| PROSE | `OL-Prose.php` (empty on Yola) | The-Lahor-Attack, The-Nightingale-and-The-Rose-by-Oscar-Wilde, The-Lumber-Room-by-Saki, The-Wave |
| NOVELS | `novels.php` (empty on Yola) | Prince-and-the-Pauper, Vendor-of-Sweets, Bringing-Tony-Home |
| RESOURCES | `papers.php` | |
| RCF PUBLICATIONS | `RCF-Publications.php` | |
| RCF-LIT-CLASS | `rcf-lit-class.php` | |
| (hidden, in sitemap) | `home-backup.php` | |

Note: the page URL is `Breakfast-by-Jaques-Prevert.php` (spelled "Jaques"), not "Jacques". The original spelling is kept because that's the indexed URL.

**Total live pages: 40** (36 with content; the 4 section landing pages are empty on Yola itself)

## Page titles (`<title>`), to be kept exactly
| Page | Title |
|---|---|
| index.php | Literature Help |
| OL-LITERATURE-HELP.php | Notes |
| My-Poems.php | My Poems |
| Elements-of-Poetry---You-must-read-this.php | Elements of Poetry - You must read this |
| To-the-Nile-by-Keats.php | Notes |
| A-Bird-came-down-the-Walk.php | Notes |
| Farewell-to-Barn-Stack-and-Tree.php | Farewell to Barn Stack and Tree |
| To-the-Evening-Star.php | To the Evening Star |
| The-Eagle-by-Tennyson.php | Literature Help |
| War-is-Kind.php | Literature Help |
| I-know-why-the-Caged-Bird-Sings.php | I know why the Caged Bird Sings |
| poem-by-wislawa.php | The Terrorist He's watching |
| Breakfast-by-Jaques-Prevert.php | Breakfast by Jaques Prevert |
| Once-upon-a-Time-by-Gabriel-Okara.php | Once upon a Time by Gabriel Okara |
| Richard-Cory.php | Richard Cory |
| Big-Match-1983.php | Big Match 1983 |
| The-Earthen-Goblet.php | The Earthen Goblet |
| poem-about-camel.php | camel's Hump |
| Father-and-Son-by-Cat-Stevens.php | Father and Son by Cat Stevens |
| the-poem-fear.php | Fear |
| poem-about-clowns-wife.php | The Clown's Wife |
| Upside-Down.php | Upside Down |
| The-Huntsman.php | The Huntsman |
| They-said-the-House.php | They said the House |
| drama.php | OL Drama |
| The-Bear-by-Anton-Chekov.php | OL Drama |
| The-Twilight-of-a-Crane.php | The Twilight of a Crane |
| OL-Prose.php | OL Prose |
| The-Lahor-Attack.php | OL Prose |
| The-Nightingale-and-The-Rose-by-Oscar-Wilde.php | The Nightingale and the Rose by Oscar Wilde |
| The-Lumber-Room-by-Saki.php | Prose |
| The-Wave.php | The Wave |
| novels.php | OL Novels |
| Prince-and-the-Pauper.php | OL Novels |
| Vendor-of-Sweets.php | OL Novels |
| Bringing-Tony-Home.php | Bringing Tony Home |
| papers.php | Literature Help |
| RCF-Publications.php | Literature Help |
| rcf-lit-class.php | Literature Help |
| home-backup.php | Literature Help |

## Old URLs that no longer exist on Yola (found in the Internet Archive, 2016)
Yola already returns 404 for these, so any search value they had is likely already lost:
`contact.php`, `FUN-ZONE.php`, `Model-Papers.php`, `queries.php`, `OL-Drama.php`, `OL-Novels.php`.
The GitHub site can bring these back as redirect pages to their current equivalents (e.g. OL-Drama → drama.php).

## Files (downloaded to `site/`, byte-for-byte, original filenames)
- 158 files, about 85 MB: images, scans, .docx, .pdf, .pptx, template CSS/JS.
- Vendor-of-Sweets uses a 31-image scanned-page gallery (full-size scans and 100px thumbnails both kept).
- RCF-Publications and rcf-lit-class images are Yola-resized copies (`*.opt…jpg`); the full-size originals were downloaded as well.
- **Broken on Yola already:** `resources/download (1).jpg` (image on The-Twilight-of-a-Crane) returns 404 on the live site.
- **Broken links in the original content:** Elements-of-Poetry contains 5 images pointing to `file:///C:/Users/Sohan/AppData/Local/Temp/...clip_image00N` (pasted from Word; these were never uploaded and don't show on Yola either).
- **External images:** poem-about-camel hotlinks `kiplingsociety.co.uk/pix/camel.jpg`; RCF-Publications hotlinks Facebook emoji images.
- **SWF/Flash:** none of the 41 live pages reference a .swf file. Any .swf files in the Yola File Manager are not linked from a live page (see "Unlinked files").
- YouTube embeds: 18 pages (they keep working on GitHub).

## Unlinked files
Yola's File Manager showed about 101.5 MB; the files linked from live pages come to about 85 MB. The difference (old files, .swf files, unused uploads) can't be found by crawling the site and has to be downloaded from the Yola File Manager by hand.

## Search-traffic candidates
All 41 pages are in Yola's sitemap. Without Google Search Console data, the most likely traffic pages are the individual text study pages (poems, prose, drama, novels) plus papers.php (past papers). Search Console access would confirm this.

## Page content capture (done)
All 36 pages with content are saved in `content/original/` as clean HTML (Yola wrapper, ads and tracking removed; text, links, images, tables and Sinhala text unchanged). Each was checked automatically against a fingerprint of the live page text: 36/36 match exactly (`node verify.js`). The 10 poetry quizzes are saved separately in `content/quizzes.json`, with the garbled characters from Yola repaired (e.g. `â€œ` back to a curly quote). Menu structure and titles: `content/pages.json`.
