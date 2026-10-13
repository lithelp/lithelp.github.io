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

// Home-screen icon: one pop-up, "Add LitHelp to your home screen" (phones) or "... to your desktop" (computers).
// The button opens the device's own confirmation box (the browser's install prompt), which puts the LitHelp icon on the
// home screen or desktop in one tap. A line explains that the box may say "Install" but only adds the icon.
// Where a browser has no such box (iPhone Safari, Firefox and some others), the button shows the short steps instead.
// Closing the pop-up keeps it away for 30 days. The menu item and footer link do the same as the button.
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
  var isFirefox = /firefox|fxios/i.test(ua);
  var where = isMobile ? 'home screen' : 'desktop';
  var deferred = null;

  var KEY = 'lithelp-home';
  var st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = null; } // no storage: no pop-up
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function track(name) { if (window.gtag) window.gtag('event', name); }

  // Steps for browsers that have no confirmation box.
  function steps() {
    var share = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Share"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v8h14v-8"/></svg>';
    if (isIOS) return '<li>Tap the <b>Share</b> button ' + share + ' at the bottom (or top) of the screen.</li><li>Tap <b>Add to Home Screen</b>, then <b>Add</b>.</li>';
    if (isSamsung) return '<li>Tap the menu <b>≡</b> at the bottom right.</li><li>Tap <b>Add page to</b> → <b>Home screen</b>, then <b>Add</b>.</li>';
    if (isFirefox && isMobile) return '<li>Tap the menu <b>⋮</b>.</li><li>Tap <b>Add to Home screen</b>, then <b>Add</b>.</li>';
    if (isFirefox) return '<li>Drag the padlock icon at the left of the address bar onto your desktop.</li>';
    return '<li>Open the browser menu (<b>⋮</b> or <b>…</b>) at the top right.</li><li>Choose <b>Add to Home screen</b> (or <b>Cast, save and share → Create shortcut</b> on a computer).</li>';
  }
  var dlg;
  function showSteps() {
    track('home_steps');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'install-help';
      document.body.appendChild(dlg);
      dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
    }
    dlg.innerHTML = '<h2>Add LitHelp to your ' + where + '</h2><ol>' + steps() + '</ol>' +
      '<p class="install-note">The LitHelp icon then opens the site in one tap.</p><button type="button" class="btn btn-brand" data-close>Got it</button>';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  // Menu item and footer link: explain "Install" first, then open the box from the Continue button.
  function explainThenAdd() {
    if (!deferred) { showSteps(); return; }
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'install-help';
      document.body.appendChild(dlg);
      dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
    }
    dlg.innerHTML = '<h2>Install the LitHelp shortcut</h2>' +
      '<p>Your ' + (isMobile ? 'phone' : 'computer') + ' will now ask to <b>"Install"</b>. That just means adding the <b>LitHelp shortcut icon</b> to your ' + where + '. Nothing is downloaded from an app store, and you can remove the icon like any other.</p>' +
      '<div class="an-actions"><button type="button" class="btn btn-brand" data-go>Install shortcut</button><button type="button" class="btn install-cancel" data-close>Not now</button></div>';
    dlg.querySelector('[data-go]').addEventListener('click', function () { dlg.close(); add(); });
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  // The button: the device's own box where available, otherwise the steps.
  function add() {
    if (!deferred) { showSteps(); return; }
    track('home_add_prompt');
    deferred.prompt();
    deferred.userChoice.then(function (c) {
      if (c.outcome === 'accepted') { if (st) { st.added = Date.now(); save(); } hideAll(); track('home_added'); }
      deferred = null;
    });
  }

  var bar;
  function removeBar() { if (bar) { bar.remove(); bar = null; } document.body.classList.remove('has-install-bar'); }
  function showBar() {
    if (bar || !st || st.added || (st.closed && Date.now() - st.closed < 30 * 864e5)) return;
    if (!deferred && !isIOS) return; // only offer the pop-up where adding takes one or two taps
    bar = document.createElement('div');
    bar.className = 'install-bar' + (isMobile ? '' : ' install-bar-wide');
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Add LitHelp to your ' + where);
    bar.innerHTML = '<img src="/assets/icons/icon-192.png" alt="" width="40" height="40">' +
      '<span><b>' + (deferred ? 'Install the LitHelp shortcut' : 'Add LitHelp to your ' + where) + '</b><small>' + (deferred
        ? 'Adds the LitHelp icon to your ' + where + '.'
        : 'Open your notes in one tap.') + '</small></span>' +
      '<button type="button" class="install-go">' + (deferred ? 'Install' : 'Show me') + '</button><button type="button" class="install-x" aria-label="Not now">&times;</button>';
    document.body.appendChild(bar);
    document.body.classList.add('has-install-bar');
    bar.querySelector('.install-go').addEventListener('click', function () { removeBar(); add(); });
    bar.querySelector('.install-x').addEventListener('click', function () { st.closed = Date.now(); save(); removeBar(); });
    track('home_bar');
  }
  var scheduled = false;
  function scheduleBar() {
    if (scheduled) return;
    scheduled = true;
    var shown = false;
    function go() {
      if (shown) return;
      if (document.querySelector('dialog[open]')) { setTimeout(go, 4000); return; } // wait until the daily tip is closed
      shown = true;
      window.removeEventListener('scroll', onScroll);
      showBar();
    }
    function onScroll() { if (window.scrollY > 400) go(); }
    window.addEventListener('scroll', onScroll, { passive: true });
    setTimeout(go, 12000);
  }

  // Menu item and footer link.
  var linksReady = false;
  function showLinks() {
    if (linksReady) return;
    linksReady = true;
    document.querySelectorAll('.install-link').forEach(function (a) {
      a.hidden = false;
      a.textContent = deferred || !isIOS ? 'Install the LitHelp shortcut' : 'Add LitHelp to your home screen';
      a.addEventListener('click', function (e) { e.preventDefault(); explainThenAdd(); });
    });
    var nav = document.querySelector('#site-nav > ul');
    if (nav) {
      var li = document.createElement('li');
      li.className = 'nav-install';
      li.innerHTML = '<button type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>Install shortcut</button>';
      li.querySelector('button').addEventListener('click', explainThenAdd);
      nav.appendChild(li);
    }
  }
  function hideAll() {
    document.querySelectorAll('.install-link').forEach(function (a) { a.hidden = true; });
    var li = document.querySelector('.nav-install'); if (li) li.remove();
    removeBar();
  }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; scheduleBar(); });
  window.addEventListener('appinstalled', function () { if (st) { st.added = Date.now(); save(); } hideAll(); });
  showLinks();
  if (isIOS) scheduleBar();
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
