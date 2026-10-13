# Step H: send Yola visitors to rcflithelp.com

> **Status, 13 October 2026: not possible any more.** Yola disabled lithelp.yolasite.com ("Site disabled") and does not allow publishing on the free plan, so this redirect was never applied. This guide is kept only as a record.

This guide adds a small script to the old Yola site (lithelp.yolasite.com). When anyone opens a Yola page, they go straight to the same page on https://rcflithelp.com.

- Nothing on Yola is deleted. The Yola site stays exactly as it is underneath.
- To undo it, remove the script and publish again. Yola works as before.
- Do **not** delete the Yola site afterwards. It must stay published so the old links keep forwarding.
- Do **not** buy a Yola upgrade for this. If the site-wide option asks for one, use Method B.

Checked on 13 October 2026: all 46 old Yola page addresses have a working page on rcflithelp.com.

## The code

```html
<script>
/* LitHelp has moved to https://rcflithelp.com. Remove this script to stop forwarding. */
(function () {
  var top = window, href = location.href;
  try { if (window.top !== window) { top = window.top; href = top.location.href; } }
  catch (e) { href = document.referrer || ''; } /* the widget runs inside a frame */
  var u; try { u = new URL(href); } catch (e) { return; }
  if (!/(^|\.)lithelp\.yolasite\.com$/i.test(u.hostname)) return;
  var m = u.pathname.match(/^\/([^\/]+?)(?:\.php)?\/?$/);
  var page = m && !/^index$/i.test(m[1]) ? m[1] + '.php/' : '';
  var to = 'https://rcflithelp.com/' + page + u.hash;
  try { var l = document.createElement('link'); l.rel = 'canonical'; l.href = 'https://rcflithelp.com/' + page; (top.document || document).head.appendChild(l); } catch (e) {}
  try { top.location.replace(to); } catch (e) { location.replace(to); }
})();
</script>
<p style="font:16px sans-serif">LitHelp has moved to <a href="https://rcflithelp.com/" target="_top">rcflithelp.com</a>.</p>
```

The last line is a visible link, for anyone whose browser blocks the automatic forwarding.

How it behaves:

| Visitor opens | Goes to |
|---|---|
| lithelp.yolasite.com/ or /index.php | rcflithelp.com/ |
| lithelp.yolasite.com/Richard-Cory.php | rcflithelp.com/Richard-Cory.php/ |
| lithelp.yolasite.com/The-Eagle-by-Tennyson.php#analysis | rcflithelp.com/The-Eagle-by-Tennyson.php/#analysis |
| Yola's own editor (sitebuilder) | nothing happens, so you can still edit |

PDF and Word files on Yola (the /resources/ links) are not affected and keep downloading as before.

## Method A: Sitebuilder+ (one place for the whole site)

1. Sign in to Yola and open the LitHelp site in Sitebuilder.
2. Click the **Main menu** (top left) and choose **Settings**.
3. Open the **Custom Code** tab.
4. Under **Head**, click **Add code**.
5. Name it `Redirect to rcflithelp.com`, paste the code above, and choose **Website only**.
6. Save, then **Publish** the site.

If Yola says you need to upgrade for Custom Code, stop and use Method B instead.

## Method B: Sitebuilder Classic (an HTML widget on each page)

1. Open the site in Sitebuilder and go to the **Home** page.
2. Open **Widgets → Popular**, and drag an **HTML** widget onto the page, near the top.
3. Paste the code above into the widget and click **Save**.
4. Repeat for every page in the menu (Poetry, each poem, Drama, Prose, Novels, Resources, RCF Publications, RCF Lit Class, and the hidden home-backup page).
5. **Publish** the site.

Tip: if your Classic layout has an area shared by all pages (a site-wide header or footer zone), one widget placed there covers every page. Try that first, then check two or three pages.

## After publishing: check it

1. Open https://lithelp.yolasite.com/ in an Incognito window. It should open rcflithelp.com.
2. Open https://lithelp.yolasite.com/Richard-Cory.php. It should open rcflithelp.com/Richard-Cory.php/.
3. Open one page you remember well and make sure it arrives at the same text on the new site.

## To undo

Remove the Custom Code snippet (Method A) or the HTML widgets (Method B), then publish again.
