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
  if (paper) {
    paper.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pp]');
      if (!b) return;
      var act = b.getAttribute('data-pp');
      if (act === 'print') { window.print(); return; }
      paper.querySelectorAll('.q details').forEach(function (d) { d.open = act === 'open'; });
    });
  }
  var HREF = '/practice-papers-2026/';
  if (location.pathname.indexOf(HREF) === 0 || !window.HTMLDialogElement) return;
  var KEY = 'lithelp-pp2026';
  var state;
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { state = {}; }
  if (state.opened || (state.later && Date.now() - state.later < 7 * 864e5)) return;
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  setTimeout(function () {
    if (document.querySelector('dialog[open]')) return;
    var d = document.createElement('dialog');
    d.className = 'announce';
    d.setAttribute('aria-labelledby', 'an-title');
    d.innerHTML = '<div class="an-top"><small>New on LitHelp</small><h2 id="an-title">RCF Practice Papers for 2026</h2><button type="button" class="an-x" aria-label="Close">&times;</button></div>' +
      '<div class="an-body"><p>Five full practice papers in the latest O/L exam format (Paper I and Paper II), with answers and essay marking guides.</p>' +
      '<div class="an-actions"><a class="btn btn-brand an-open" href="' + HREF + '">Open the papers</a><button type="button" class="btn an-later">Maybe later</button></div></div>';
    document.body.appendChild(d);
    function later() { save({ later: Date.now() }); d.close(); }
    d.querySelector('.an-open').addEventListener('click', function () { save({ opened: Date.now() }); });
    d.querySelector('.an-later').addEventListener('click', later);
    d.querySelector('.an-x').addEventListener('click', later);
    d.addEventListener('cancel', function () { save({ later: Date.now() }); });
    d.addEventListener('click', function (e) { if (e.target === d) later(); });
    d.showModal();
  }, 2500);
})();
