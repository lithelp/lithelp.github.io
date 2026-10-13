// O/L Literature Help — menu toggle, dropdowns and the scanned-page lightbox.
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Dropdowns open on click (touch, keyboard) as well as hover on desktop.
  document.querySelectorAll('.nav li.has-sub > button').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var li = btn.parentElement;
      var wasOpen = li.classList.contains('open');
      document.querySelectorAll('.nav li.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('button').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) { li.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav')) {
      document.querySelectorAll('.nav li.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('button').setAttribute('aria-expanded', 'false');
      });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.nav li.open').forEach(function (o) {
      o.classList.remove('open');
      var b = o.querySelector('button');
      b.setAttribute('aria-expanded', 'false');
      if (o.contains(document.activeElement)) b.focus();
    });
  });

  // Gallery lightbox for scanned pages.
  var gallery = document.querySelector('.gallery');
  if (gallery && window.HTMLDialogElement) {
    var links = Array.prototype.slice.call(gallery.querySelectorAll('a'));
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.innerHTML = '<div class="lb-bar"><button type="button" data-act="prev" aria-label="Previous page">&larr;</button>' +
      '<span class="lb-title"></span><span><a class="lb-open" target="_blank" rel="noopener">Full size</a> ' +
      '<button type="button" data-act="next" aria-label="Next page">&rarr;</button> ' +
      '<button type="button" data-act="close" aria-label="Close">&times;</button></span></div><img alt="">';
    document.body.appendChild(dlg);
    var img = dlg.querySelector('img'), title = dlg.querySelector('.lb-title'), full = dlg.querySelector('.lb-open'), idx = 0;
    function show(i) {
      idx = (i + links.length) % links.length;
      img.src = links[idx].href;
      img.alt = links[idx].dataset.title;
      title.textContent = links[idx].dataset.title + ' (' + (idx + 1) + ' / ' + links.length + ')';
      full.href = links[idx].href;
    }
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); show(i); dlg.showModal(); });
    });
    dlg.addEventListener('click', function (e) {
      var act = e.target.dataset && e.target.dataset.act;
      if (act === 'prev') show(idx - 1);
      else if (act === 'next') show(idx + 1);
      else if (act === 'close' || e.target === dlg) dlg.close();
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }
})();

// Reading progress bar and back-to-top button on article pages.
(function () {
  var article = document.querySelector('article.prose');
  if (!article) return;
  var bar = document.createElement('div');
  bar.className = 'read-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var top = document.createElement('a');
  top.className = 'to-top';
  top.href = '#main';
  top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(top);
  function update() {
    var r = article.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var done = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
    bar.style.transform = 'scaleX(' + done + ')';
    top.classList.toggle('show', window.scrollY > 900);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Home-screen shortcut and app install. Two separate pop-ups, shortcut first:
//   1. "Add LitHelp to your home screen / desktop": how to make a plain shortcut with the browser's own menu (no install).
//   2. "Install the LitHelp app": the browser's install prompt, offered on a later visit (a day or more after pop-up 1).
// Each pop-up can be closed and then stays away for 30 days. The menu item and footer link open a chooser with both.
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (standalone || /[?&]print=/.test(location.search)) return;
  var ua = navigator.userAgent;
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /android/i.test(ua);
  var isMobile = isIOS || isAndroid || window.innerWidth <= 760;
  var isSamsung = /samsungbrowser/i.test(ua);
  var isEdge = /edg\//i.test(ua);
  var isFirefox = /firefox|fxios/i.test(ua);
  var deferred = null;
  var DAY = 864e5;

  var KEY = 'lithelp-home';
  var st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = null; } // no storage: no pop-ups
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function track(name) { if (window.gtag) window.gtag('event', name); }

  // How to make a plain shortcut in this browser (no install).
  function shortcutSteps() {
    var share = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Share"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v8h14v-8"/></svg>';
    if (isIOS) return '<li>Tap the <b>Share</b> button ' + share + ' in Safari (at the bottom or top of the screen).</li><li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>. The LitHelp icon is now on your Home Screen.</li>';
    if (isSamsung) return '<li>Tap the menu <b>≡</b> at the bottom right.</li><li>Tap <b>Add page to</b>, then <b>Home screen</b>.</li><li>Tap <b>Add</b>. The LitHelp icon is now on your home screen.</li>';
    if (isAndroid) return '<li>Tap the menu <b>⋮</b> at the top right of Chrome.</li><li>Tap <b>Add to Home screen</b>.</li><li>If Chrome asks, choose <b>Create shortcut</b> (not Install), then tap <b>Add</b>.</li>';
    if (isEdge) return '<li>Click the menu <b>…</b> at the top right of Edge.</li><li>Choose <b>More tools</b>, then <b>Pin to taskbar</b> or <b>Pin to Start</b>.</li><li>LitHelp now opens from your taskbar or Start menu.</li>';
    if (isFirefox) return '<li>Make the window smaller so you can see your desktop.</li><li>Drag the padlock icon at the left of the address bar onto your desktop.</li><li>A LitHelp shortcut appears on your desktop.</li>';
    return '<li>Click the menu <b>⋮</b> at the top right of Chrome.</li><li>Choose <b>Cast, save and share</b>, then <b>Create shortcut…</b></li><li>Click <b>Create</b>. A LitHelp shortcut is added to your desktop.</li>';
  }

  var dlg;
  function openDialog(html) {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'install-help';
      document.body.appendChild(dlg);
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
        if (e.target.closest('[data-install]')) { dlg.close(); install(); }
        if (e.target.closest('[data-shortcut]')) showShortcutHelp();
      });
    }
    dlg.innerHTML = html;
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
  }
  function showShortcutHelp() {
    track('home_shortcut_help');
    openDialog('<h2>Add a LitHelp shortcut' + (isMobile ? ' to your home screen' : ' to your computer') + '</h2><ol>' + shortcutSteps() + '</ol>' +
      '<p class="install-note">A shortcut opens LitHelp in your browser in one tap. Nothing is installed.</p>' +
      '<button type="button" class="btn btn-brand" data-close>Got it</button>');
  }
  function showChooser() {
    openDialog('<h2>Keep LitHelp one tap away</h2>' +
      '<div class="install-choice"><b>Shortcut</b><span>An icon that opens LitHelp in your browser. Nothing is installed.</span><button type="button" class="btn btn-brand" data-shortcut>Add a shortcut</button></div>' +
      (deferred ? '<div class="install-choice"><b>App</b><span>Opens full screen like an app and keeps the pages you have read for offline use.</span><button type="button" class="btn" data-install>Install the app</button></div>' : '') +
      '<button type="button" class="btn install-cancel" data-close>Not now</button>');
  }
  function install() {
    if (!deferred) { showShortcutHelp(); return; }
    track('home_install_prompt');
    deferred.prompt();
    deferred.userChoice.then(function (c) { if (c.outcome === 'accepted') { st.installed = Date.now(); save(); hideAll(); } deferred = null; });
  }

  // The two pop-ups (bars at the bottom of the screen).
  var bar;
  function removeBar() { if (bar) { bar.remove(); bar = null; } document.body.classList.remove('has-install-bar'); }
  function showBar(kind) {
    if (bar) return;
    bar = document.createElement('div');
    bar.className = 'install-bar' + (isMobile ? '' : ' install-bar-wide');
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', kind === 'install' ? 'Install the LitHelp app' : 'Add a LitHelp shortcut');
    var where = isMobile ? 'home screen' : 'computer';
    bar.innerHTML = '<img src="/assets/icons/icon-192.png" alt="" width="40" height="40">' + (kind === 'install'
      ? '<span><b>Install the LitHelp app</b><small>Opens full screen and works offline.</small></span><button type="button" class="install-go">Install</button>'
      : '<span><b>Add LitHelp to your ' + where + '</b><small>A shortcut opens LitHelp in one tap.</small></span><button type="button" class="install-go">Add shortcut</button>') +
      '<button type="button" class="install-x" aria-label="Not now">&times;</button>';
    document.body.appendChild(bar);
    document.body.classList.add('has-install-bar');
    var stamp = kind === 'install' ? 'installSeen' : 'shortcutSeen';
    bar.querySelector('.install-go').addEventListener('click', function () {
      st[stamp] = Date.now(); save(); removeBar();
      if (kind === 'install') install(); else showShortcutHelp();
    });
    bar.querySelector('.install-x').addEventListener('click', function () { st[stamp] = Date.now(); save(); removeBar(); });
    track(kind === 'install' ? 'home_install_bar' : 'home_shortcut_bar');
  }
  function nextBar() {
    if (!st || st.installed) return null;
    var now = Date.now();
    var shortcutDue = !st.shortcutSeen || now - st.shortcutSeen > 30 * DAY;
    if (shortcutDue) return 'shortcut';
    // The install pop-up comes on a later visit: at least a day after the shortcut pop-up, and only where the browser can install.
    var installDue = deferred && now - st.shortcutSeen > DAY && (!st.installSeen || now - st.installSeen > 30 * DAY);
    return installDue ? 'install' : null;
  }
  function scheduleBar() {
    var shown = false;
    function go() {
      if (shown) return;
      if (document.querySelector('dialog[open]')) { setTimeout(go, 4000); return; } // wait until the daily tip is closed
      var kind = nextBar();
      shown = true;
      window.removeEventListener('scroll', onScroll);
      if (kind) showBar(kind);
    }
    function onScroll() { if (window.scrollY > 400) go(); }
    window.addEventListener('scroll', onScroll, { passive: true });
    setTimeout(go, 12000);
  }

  // The menu item and the footer link open the chooser (shortcut first, install second).
  var linksReady = false;
  function showLinks() {
    if (linksReady) return;
    linksReady = true;
    document.querySelectorAll('.install-link').forEach(function (a) {
      a.hidden = false;
      a.addEventListener('click', function (e) { e.preventDefault(); showChooser(); });
    });
    var nav = document.querySelector('#site-nav > ul');
    if (nav) {
      var li = document.createElement('li');
      li.className = 'nav-install';
      li.innerHTML = '<button type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>Add shortcut</button>';
      li.querySelector('button').addEventListener('click', showChooser);
      nav.appendChild(li);
    }
  }
  function hideAll() {
    document.querySelectorAll('.install-link').forEach(function (a) { a.hidden = true; });
    var li = document.querySelector('.nav-install'); if (li) li.remove();
    removeBar();
  }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', function () { if (st) { st.installed = Date.now(); save(); } hideAll(); });
  showLinks();
  if (st) scheduleBar();
})();

// RCF Practice Papers: answer toolbar on the paper pages, and a one-time announcement pop-up elsewhere.
(function () {
  var paper = document.querySelector('article.pp');
  // ?print=questions or ?print=answers prepares a paper page for the downloadable PDFs.
  var printMode = (location.search.match(/[?&]print=(questions|answers)/) || [])[1];
  if (paper && printMode) {
    document.documentElement.classList.add('pp-print', 'pp-print-' + printMode);
    var h1 = document.querySelector('.page-head h1');
    if (h1 && printMode === 'answers') h1.textContent += ': Answers and Marking Guide';
    paper.querySelectorAll('.q details').forEach(function (d) { d.open = printMode === 'answers'; });
  }
  if (paper) {
    paper.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pp]');
      if (!b) return;
      var act = b.getAttribute('data-pp');
      if (act === 'print') { window.print(); return; }
      paper.querySelectorAll('.q details').forEach(function (d) { d.open = act === 'open'; });
    });
  }
})();

// "Today on LitHelp": a daily highlight from /assets/daily.json (made from content/daily.json).
// Shown at most once a day per visitor; everyone sees the same item on the same Sri Lanka date.
(function () {
  if (!window.HTMLDialogElement || /[?&]print=/.test(location.search)) return;
  var KEY = 'lithelp-daily';
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return; } // no storage: never nag
  var slDate = new Date(Date.now() + 5.5 * 36e5).toISOString().slice(0, 10); // today's date in Sri Lanka
  if (state.shown === slDate) return;
  if (state.pauseUntil && slDate < state.pauseUntil) return;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function track(name) { if (window.gtag) window.gtag('event', name, { daily_item: state.item }); }
  setTimeout(function () {
    if (document.querySelector('dialog[open]')) return;
    fetch('/assets/daily.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
      var items = data && data.items;
      if (!items || !items.length || document.querySelector('dialog[open]')) return;
      var day = Math.floor((Date.parse(slDate) - Date.parse('2026-10-01')) / 864e5);
      var i = ((day % items.length) + items.length) % items.length;
      if (items[i].link === location.pathname) i = (i + 1) % items.length; // don't advertise the page being read
      var it = items[i];
      state.shown = slDate; state.item = it.title; save();
      var d = document.createElement('dialog');
      d.className = 'announce daily';
      d.setAttribute('aria-labelledby', 'an-title');
      d.innerHTML = '<div class="an-top"><small>Today on LitHelp · ' + esc(it.kind) + '</small><h2 id="an-title">' + esc(it.title) + '</h2><button type="button" class="an-x" aria-label="Close">&times;</button></div>' +
        '<div class="an-body">' + (it.img ? '<img class="an-img" src="/assets/img/texts/' + esc(it.img.toLowerCase()) + '.jpg" alt="" width="240" height="160">' : '') +
        '<p>' + esc(it.text) + '</p>' +
        '<div class="an-actions"><a class="btn btn-brand an-open" href="' + esc(it.link) + '">' + esc(it.cta || 'Open') + '</a><button type="button" class="btn an-later">Close</button></div>' +
        '<button type="button" class="an-pause">Don\'t show daily tips for a week</button></div>';
      document.body.appendChild(d);
      function close() { d.close(); }
      d.querySelector('.an-open').addEventListener('click', function () { track('daily_tip_open'); });
      d.querySelector('.an-later').addEventListener('click', close);
      d.querySelector('.an-x').addEventListener('click', close);
      d.querySelector('.an-pause').addEventListener('click', function () {
        state.pauseUntil = new Date(Date.parse(slDate) + 7 * 864e5).toISOString().slice(0, 10); save(); track('daily_tip_pause'); close();
      });
      d.addEventListener('click', function (e) { if (e.target === d) close(); });
      d.showModal();
      track('daily_tip_shown');
    }).catch(function () {});
  }, 3000);
})();
