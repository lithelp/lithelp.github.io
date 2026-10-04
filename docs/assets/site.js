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
    if (e.key === 'Escape') document.querySelectorAll('.nav li.open').forEach(function (o) { o.classList.remove('open'); });
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
