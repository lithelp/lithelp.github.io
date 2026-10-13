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

// Installable app: offline support, plus "Add shortcut" (home-screen) prompts.
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (standalone) return;
  var ua = navigator.userAgent;
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var deferred = null;
  var KEY = 'lithelp-install-dismissed';
  function dismissedRecently() {
    try { var t = +localStorage.getItem(KEY); return t && Date.now() - t < 30 * 864e5; } catch (e) { return false; }
  }
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }

  var iosDialog;
  function showIOSHelp() {
    if (!iosDialog) {
      iosDialog = document.createElement('dialog');
      iosDialog.className = 'install-help';
      iosDialog.innerHTML = '<h2>Add LitHelp to your Home Screen</h2><ol>' +
        '<li>Tap the <b>Share</b> button <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Share icon"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v8h14v-8"/></svg> at the bottom (or top) of Safari.</li>' +
        '<li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>. LitHelp now opens from your Home Screen like an app.</li></ol>' +
        '<button type="button" class="btn btn-brand">Got it</button>';
      document.body.appendChild(iosDialog);
      iosDialog.querySelector('button').addEventListener('click', function () { iosDialog.close(); });
      iosDialog.addEventListener('click', function (e) { if (e.target === iosDialog) iosDialog.close(); });
    }
    if (iosDialog.showModal) iosDialog.showModal(); else alert('In Safari, tap Share, then "Add to Home Screen".');
  }
  function install() {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function (c) { if (c.outcome === 'accepted') hideAll(); deferred = null; });
    } else if (isIOS) {
      showIOSHelp();
    }
  }

  var bar;
  function showBar() {
    if (bar || dismissedRecently() || window.innerWidth > 760) return;
    bar = document.createElement('div');
    bar.className = 'install-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Add a home-screen shortcut');
    bar.innerHTML = '<img src="/assets/icons/icon-192.png" alt="" width="40" height="40"><span><b>LitHelp in one tap</b><small>Put it on your home screen. Works offline.</small></span>' +
      '<button type="button" class="install-go">Add shortcut</button><button type="button" class="install-x" aria-label="Not now">&times;</button>';
    document.body.appendChild(bar);
    document.body.classList.add('has-install-bar');
    bar.querySelector('.install-go').addEventListener('click', install);
    bar.querySelector('.install-x').addEventListener('click', function () { remember(); bar.remove(); bar = null; document.body.classList.remove('has-install-bar'); });
  }
  var linksReady = false;
  function showLinks() {
    if (linksReady) return;
    linksReady = true;
    document.querySelectorAll('.install-link').forEach(function (a) {
      a.hidden = false;
      a.addEventListener('click', function (e) { e.preventDefault(); install(); });
    });
    var nav = document.querySelector('#site-nav > ul');
    if (nav) {
      var li = document.createElement('li');
      li.className = 'nav-install';
      li.innerHTML = '<button type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>Add shortcut</button>';
      li.querySelector('button').addEventListener('click', install);
      nav.appendChild(li);
    }
  }
  function hideAll() {
    document.querySelectorAll('.install-link').forEach(function (a) { a.hidden = true; });
    var li = document.querySelector('.nav-install'); if (li) li.remove();
    if (bar) { bar.remove(); bar = null; }
    document.body.classList.remove('has-install-bar');
  }
  function ready() {
    showLinks();
    var shown = false;
    function later() { if (!shown && window.scrollY > 400) { shown = true; showBar(); window.removeEventListener('scroll', later); } }
    window.addEventListener('scroll', later, { passive: true });
    setTimeout(function () { if (!shown) { shown = true; showBar(); } }, 12000);
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; ready(); });
  window.addEventListener('appinstalled', hideAll);
  if (isIOS && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)) ready();
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
