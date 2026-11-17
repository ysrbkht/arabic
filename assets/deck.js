(function () {
  'use strict';
  const R = window.ARABIC_RULE;
  if (!R) { console.error('window.ARABIC_RULE تعریف نشده است.'); return; }

  const HOME = R.homeUrl || '../index.html';
  const HAS_WORKSHOP = !!(R.workshop && R.workshop.verbs && R.workshop.verbs.length);

  const svg = p => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  const ICON_HOME = svg('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>');
  const ICON_TOC = svg('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>');
  const ICON_EYE = svg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>');
  const ICON_LASER = svg('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" stroke-dasharray="2 3"/>');
  const ICON_HELP = svg('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>');
  const ICON_MOON = svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>');
  const ICON_SUN = svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>');
  const ICON_NEXT = svg('<polyline points="15 18 9 12 15 6"/>');
  const ICON_PREV = svg('<polyline points="9 18 15 12 9 6"/>');
  const ICON_EXPAND = svg('<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>');
  const ICON_CONTRACT = svg('<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>');
  const ICON_CHECK = svg('<polyline points="20 6 9 17 4 12"/>');
  const ROSETTE = '<svg class="rosette" viewBox="0 0 400 400" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><circle cx="200" cy="200" r="196"/><circle cx="200" cy="200" r="120"/><rect x="62" y="62" width="276" height="276"/><rect x="62" y="62" width="276" height="276" transform="rotate(45 200 200)"/><rect x="108" y="108" width="184" height="184"/><rect x="108" y="108" width="184" height="184" transform="rotate(45 200 200)"/></svg>';

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="laser-dot" id="laserDot"></div>
    <div class="app">
      <main class="sheet" id="sheet">
        <div class="tools" id="toolbar">
          <a class="ibtn pill" href="${HOME}" title="بازگشت به فهرست قواعد" aria-label="فهرست قواعد">
            <span class="tool-icon">${ICON_HOME}</span><span class="pill-label">قواعد</span>
          </a>
          <button class="ibtn pill" id="btnToc" title="فهرست بخش‌ها (M)" aria-label="فهرست بخش‌ها">
            <span class="tool-icon">${ICON_TOC}</span><span class="pill-label">بخش‌ها</span>
          </button>
          <button class="ibtn pill" id="btnShowAll" title="نمایش یکجای تمام نکات (A)" aria-label="نمایش همه">
            <span class="tool-icon">${ICON_EYE}</span><span class="pill-label">نمایش همه</span>
          </button>
          <div class="tool-sep"></div>
          <button class="ibtn" id="btnLaser" title="نشانگر لیزری (L)" aria-label="لیزر">${ICON_LASER}</button>
          <button class="ibtn txt" id="btnFontDown" title="کوچک کردن متن">A−</button>
          <button class="ibtn txt" id="btnFontUp" title="بزرگ کردن متن">A+</button>
          <button class="ibtn" id="btnTheme" title="تغییر تم روشن/تیره (T)" aria-label="تغییر تم"></button>
          <button class="ibtn" id="btnHelp" title="راهنمای کلیدها (H)" aria-label="راهنما">${ICON_HELP}</button>
          <button class="ibtn" id="btnFull" title="تمام‌صفحه (F)" aria-label="تمام‌صفحه"></button>
        </div>
        <header class="top">
          <span class="badge" id="badge"></span>
          <h1 class="title" id="title"></h1>
        </header>
        <section class="content" id="body" aria-live="polite"></section>
        <footer class="bottom">
          <div class="progress"><span id="bar"></span></div>
          <div class="nav">
            <div class="nav-group">
              <button class="nav-btn" id="btnPrev" title="گام قبلی (→)" aria-label="قبلی">${ICON_PREV}</button>
            </div>
            <div class="info">
              <div class="dots" id="dots"></div>
              <span class="counter" id="counter"></span>
            </div>
            <div class="nav-group">
              <button class="nav-btn" id="btnNext" title="گام بعدی (← یا Space)" aria-label="بعدی">${ICON_NEXT}</button>
            </div>
          </div>
        </footer>
      </main>

      <div class="drawer-backdrop" id="tocBackdrop">
        <aside class="toc-drawer" aria-label="فهرست بخش‌ها">
          <div class="toc-header">
            <h3>فهرست بخش‌ها</h3>
            <button class="ibtn" id="btnCloseToc" aria-label="بستن">✕</button>
          </div>
          <div class="toc-list" id="tocList"></div>
        </aside>
      </div>

      <div class="overlay" id="helpOverlay">
        <div class="overlay-card">
          <h2>کلیدهای میانبر ویژه مدرس</h2>
          <p>برای مدیریت سریع‌تر کلاس:</p>
          <div class="shortcuts-grid">
            <div class="sc-row"><span>گام بعدی</span><kbd>Space / ←</kbd></div>
            <div class="sc-row"><span>گام قبلی</span><kbd>Backspace / →</kbd></div>
            <div class="sc-row"><span>نمایش همه نکات</span><kbd>A</kbd></div>
            <div class="sc-row"><span>نشانگر لیزری</span><kbd>L</kbd></div>
            <div class="sc-row"><span>فهرست بخش‌ها</span><kbd>M</kbd></div>
            <div class="sc-row"><span>تغییر تم</span><kbd>T</kbd></div>
            <div class="sc-row"><span>تمام‌صفحه</span><kbd>F</kbd></div>
            <div class="sc-row"><span>بازگشت به ابتدا</span><kbd>Home</kbd></div>
          </div>
          <button class="btn-primary" id="closeHelpBtn">متوجه شدم</button>
        </div>
      </div>

      <div class="overlay" id="overlay">
        <div class="overlay-card">
          <div class="overlay-icon">${ICON_CHECK}</div>
          <h2>پایان ارائه</h2>
          <p>${R.title} با موفقیت به پایان رسید.</p>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            ${HAS_WORKSHOP ? '<button class="btn-primary" id="goWorkshopBtn" style="background:var(--gold);">مرور کارگاه و آزمون</button>' : ''}
            <button class="btn-primary" id="restartBtn">شروع مجدد</button>
          </div>
        </div>
      </div>
    </div>
  `);

  const $ = id => document.getElementById(id);
  const sheet = $('sheet'), titleEl = $('title'), badgeEl = $('badge'), bodyEl = $('body'), barEl = $('bar'),
        counterEl = $('counter'), dotsEl = $('dots'), overlay = $('overlay'), helpOverlay = $('helpOverlay'),
        tocBackdrop = $('tocBackdrop'), tocList = $('tocList'), laserDot = $('laserDot'),
        btnToc = $('btnToc'), btnShowAll = $('btnShowAll'), btnLaser = $('btnLaser'), btnHelp = $('btnHelp'),
        btnFull = $('btnFull'), btnFontUp = $('btnFontUp'), btnFontDown = $('btnFontDown'),
        btnTheme = $('btnTheme'), btnPrev = $('btnPrev'), btnNext = $('btnNext'),
        restartBtn = $('restartBtn'), goWorkshopBtn = $('goWorkshopBtn'),
        closeHelpBtn = $('closeHelpBtn'), btnCloseToc = $('btnCloseToc');

  const deck = [];
  if (R.opening) deck.push({ isOpening: true, tocTitle: 'آغازین', title: '', items: [R.opening] });
  (R.sections || []).forEach(s => deck.push({
    tocTitle: s.tocTitle || s.title,
    badge: s.badge || '',
    title: s.title || '',
    items: s.items || []
  }));
  if (HAS_WORKSHOP) {
    deck.push({
      isWorkshop: true,
      tocTitle: R.workshop.tocTitle || 'کارگاه و آزمون',
      badge: R.workshop.badge || '',
      title: R.workshop.title || 'کارگاه تعاملی و آزمون',
      items: [{ html: '' }]
    });
  }

  const realSections = deck.filter(s => !s.isOpening);
  const totalRealItems = realSections.reduce((s, sec) => s + sec.items.length, 0);
  const revealedRealBefore = idx => deck.slice(0, idx).filter(s => !s.isOpening).reduce((s, sec) => s + sec.items.length, 0);
  const faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const toFa = n => String(n).replace(/\d/g, d => faDigits[+d]);

  deck.forEach((sec, i) => {
    if (!sec.isOpening) {
      const d = document.createElement('button');
      d.dataset.si = i;
      d.title = sec.tocTitle;
      d.setAttribute('aria-label', sec.tocTitle);
      d.addEventListener('click', e => { e.stopPropagation(); goTo(i, true); });
      dotsEl.appendChild(d);
    }
    const tocBtn = document.createElement('button');
    tocBtn.className = 'toc-item';
    tocBtn.dataset.si = i;
    tocBtn.innerHTML = `<span class="toc-num">${toFa(i)}</span><span>${sec.tocTitle}</span>`;
    tocBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleToc(false);
      goTo(i, true);
    });
    tocList.appendChild(tocBtn);
  });

  let si = 0, ii = 0, els = [], transitioning = false;
  let activeVerbIdx = 0, activeQuizIdx = 0;

  function updateFocus() { els.forEach((el, k) => el.classList.toggle('cur', k === ii - 1)); }

  function renderWorkshopSlide(container) {
    const W = R.workshop;
    const wrap = document.createElement('div');
    wrap.className = 'workshop-wrap interactive-zone';
    wrap.innerHTML = `
      <div class="ws-panel">
        <h3 class="ws-title">🔬 آزمایشگاه گام‌به‌گام</h3>
        <div class="verb-selector" id="verbSelector"></div>
        <div class="lab-meta" id="labMeta"></div>
        <div class="lab-stages" id="labStages"></div>
      </div>
      <div class="ws-panel">
        <div class="quiz-header">
          <h3 class="ws-title">🏆 آزمون سریع کلاسی</h3>
          <span class="badge" id="quizBadge"></span>
        </div>
        <div class="quiz-q" id="quizQ"></div>
        <div class="quiz-options" id="quizOpts"></div>
        <div class="quiz-feedback" id="quizFeedback"><span>یک گزینه را انتخاب کنید.</span></div>
      </div>`;
    container.appendChild(wrap);

    const sel = wrap.querySelector('#verbSelector');
    W.verbs.forEach((v, idx) => {
      const b = document.createElement('button');
      b.className = 'verb-btn' + (idx === activeVerbIdx ? ' active' : '');
      b.textContent = v.verb;
      b.addEventListener('click', e => {
        e.stopPropagation();
        activeVerbIdx = idx;
        updateWorkshopVerb(wrap);
      });
      sel.appendChild(b);
    });

    updateWorkshopVerb(wrap);
    if (W.quiz && W.quiz.length) renderQuizQuestion(wrap);
  }

  function updateWorkshopVerb(wrap) {
    const W = R.workshop, v = W.verbs[activeVerbIdx];
    wrap.querySelectorAll('.verb-btn').forEach((b, idx) => b.classList.toggle('active', idx === activeVerbIdx));
    wrap.querySelector('#labMeta').innerHTML =
      `<span><strong>معنا:</strong> ${v.meaning || '—'}</span>` +
      `<span><strong>نوع:</strong> ${v.type || '—'}</span>`;
    wrap.querySelector('#labStages').innerHTML = `
      <div class="stage-box"><span class="stage-num">۱</span><span class="stage-ar">${v.s1 || ''}</span><span class="stage-desc">${v.s1Desc || ''}</span></div>
      <div class="stage-box"><span class="stage-num">۲</span><span class="stage-ar">${v.s2 || ''}</span><span class="stage-desc">${v.s2Desc || ''}</span></div>
      <div class="stage-box"><span class="stage-num">۳</span><span class="stage-ar">${v.s3 || ''}</span><span class="stage-desc">${v.s3Desc || ''}</span></div>
      <div class="stage-box final"><span class="stage-num">نهایی</span><span class="stage-ar">${v.final || ''}</span><span class="stage-desc">صیغه نهایی</span></div>
    `;
  }

  function renderQuizQuestion(wrap) {
    const Q = R.workshop.quiz, q = Q[activeQuizIdx];
    wrap.querySelector('#quizBadge').textContent = `سوال ${toFa(activeQuizIdx + 1)} از ${toFa(Q.length)}`;
    wrap.querySelector('#quizQ').textContent = q.q;
    const opts = wrap.querySelector('#quizOpts');
    const fb = wrap.querySelector('#quizFeedback');
    opts.innerHTML = '';
    fb.innerHTML = '<span>گزینه صحیح را انتخاب کنید.</span>';

    q.options.forEach((text, idx) => {
      const btn = document.createElement('button');
      btn.className = 'q-opt';
      btn.textContent = text;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const all = opts.querySelectorAll('.q-opt');
        all.forEach(b => b.disabled = true);
        if (idx === q.answer) btn.classList.add('correct');
        else { btn.classList.add('wrong'); all[q.answer].classList.add('correct'); }

        const nextIdx = (activeQuizIdx + 1) % Q.length;
        fb.innerHTML = `<span>✅ ${q.explain || ''}</span>
          <button class="btn-sm" id="nextQuizBtn">${activeQuizIdx < Q.length - 1 ? 'سوال بعدی ⟵' : 'شروع مجدد آزمون'}</button>`;
        fb.querySelector('#nextQuizBtn').addEventListener('click', ev => {
          ev.stopPropagation();
          activeQuizIdx = nextIdx;
          renderQuizQuestion(wrap);
        });
      });
      opts.appendChild(btn);
    });
  }

  function renderSection() {
    const sec = deck[si];
    sheet.classList.toggle('opening', !!sec.isOpening);
    bodyEl.innerHTML = '';

    if (sec.isOpening) {
      titleEl.textContent = '';
      badgeEl.textContent = '';
      bodyEl.innerHTML = `
        <div class="basmala-wrap">
          ${ROSETTE}
          <h1 class="basmala" lang="ar">${sec.items[0].html}</h1>
          <div class="opening-sub">${sec.items[0].sub || ''}</div>
          <div class="opening-hint">برای شروع کلیک کنید یا Space را بزنید</div>
        </div>`;
      els = [];
      ii = 1;
      btnShowAll.disabled = true;
      return;
    }

    titleEl.textContent = sec.title;
    badgeEl.textContent = sec.badge || '';
    titleEl.classList.remove('anim');
    void titleEl.offsetWidth;
    titleEl.classList.add('anim');

    if (sec.isWorkshop) {
      renderWorkshopSlide(bodyEl);
      els = [];
      ii = 1;
      btnShowAll.disabled = true;
      return;
    }

    els = sec.items.map((item, k) => {
      const d = document.createElement('div');
      d.className = 'item' + (item.type === 'quote' ? ' is-quote' : '') + (k < ii ? ' show' : '');
      d.innerHTML = item.html;
      d.querySelectorAll('.ar').forEach(a => a.setAttribute('lang', 'ar'));
      bodyEl.appendChild(d);
      return d;
    });

    btnShowAll.disabled = ii >= sec.items.length;
    updateFocus();
    bodyEl.scrollTop = 0;
  }

  function revealItem(k) {
    const el = els[k];
    if (!el) return;
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      catch (e) { el.scrollIntoView(false); }
    }, 100);
  }

  function showAllInCurrentSlide() {
    const sec = deck[si];
    if (sec.isOpening || sec.isWorkshop) return;
    els.forEach(el => el.classList.add('show'));
    ii = sec.items.length;
    updateFocus();
    updateHud();
  }

  function updateHud() {
    const sec = deck[si];
    btnPrev.disabled = si === 0;
    btnShowAll.disabled = sec.isOpening || sec.isWorkshop || ii >= sec.items.length;

    tocList.querySelectorAll('.toc-item').forEach(btn =>
      btn.classList.toggle('active', +btn.dataset.si === si));

    if (sec.isOpening) {
      barEl.style.width = '0%';
      counterEl.textContent = '';
      dotsEl.querySelectorAll('button').forEach(d => d.classList.remove('active', 'done'));
      return;
    }

    const revealed = revealedRealBefore(si) + ii;
    barEl.style.width = (totalRealItems ? (revealed / totalRealItems) * 100 : 0) + '%';
    counterEl.textContent = sec.isWorkshop ? 'کارگاه' : (toFa(ii) + ' از ' + toFa(sec.items.length));
    dotsEl.querySelectorAll('button').forEach(d => {
      const s = +d.dataset.si;
      d.classList.toggle('active', s === si);
      d.classList.toggle('done', s < si);
    });
  }

  function next() {
    if (transitioning) return;
    if (overlay.classList.contains('visible')) { reset(); return; }
    const sec = deck[si];
    if (sec.isOpening) { if (si < deck.length - 1) goTo(si + 1); return; }
    if (ii < sec.items.length) { revealItem(ii); ii++; updateFocus(); updateHud(); return; }
    if (si < deck.length - 1) { goTo(si + 1); return; }
    overlay.classList.add('visible');
  }

  function prev() {
    if (transitioning) return;
    if (overlay.classList.contains('visible')) { overlay.classList.remove('visible'); return; }
    if (deck[si].isOpening) return;
    if (!deck[si].isWorkshop && ii > 1) {
      ii--;
      if (els[ii]) els[ii].classList.remove('show');
      updateFocus(); updateHud();
      return;
    }
    if (si > 0) goTo(si - 1, true);
  }

  function goTo(n, revealAll) {
    transitioning = true;
    overlay.classList.remove('visible');
    bodyEl.classList.add('out');
    setTimeout(() => {
      si = n;
      const sec = deck[si];
      if (sec.isOpening || sec.isWorkshop) ii = 1;
      else ii = revealAll ? sec.items.length : 1;
      renderSection();
      bodyEl.classList.remove('out');
      updateHud();
      setTimeout(() => { transitioning = false; }, 280);
    }, 220);
  }

  function reset() {
    transitioning = false;
    overlay.classList.remove('visible');
    bodyEl.classList.remove('out');
    si = 0;
    ii = 1;
    renderSection();
    updateHud();
  }

  function toggleToc(force) {
    const open = typeof force === 'boolean' ? force : !tocBackdrop.classList.contains('open');
    tocBackdrop.classList.toggle('open', open);
  }

  let laserActive = false;
  function toggleLaser() {
    laserActive = !laserActive;
    document.body.classList.toggle('laser-on', laserActive);
    btnLaser.classList.toggle('active', laserActive);
  }
  document.addEventListener('mousemove', e => {
    if (!laserActive) return;
    laserDot.style.left = e.clientX + 'px';
    laserDot.style.top = e.clientY + 'px';
  });

  function toggleFullscreen() {
    const el = document.documentElement;
    try {
      if (!(document.fullscreenElement || document.webkitFullscreenElement)) {
        (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      }
    } catch (e) {}
  }
  function updateFullscreenIcon() {
    const f = !!(document.fullscreenElement || document.webkitFullscreenElement);
    btnFull.innerHTML = f ? ICON_CONTRACT : ICON_EXPAND;
  }
  if (!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)) {
    btnFull.style.display = 'none';
  }

  const FONT_MIN = 0.8, FONT_MAX = 1.5, FONT_STEP = 0.1;
  let fontScale = 1;
  function applyFontScale() {
    document.documentElement.style.setProperty('--font-scale', fontScale.toFixed(2));
    btnFontDown.disabled = fontScale <= FONT_MIN + 0.001;
    btnFontUp.disabled = fontScale >= FONT_MAX - 0.001;
    try { localStorage.setItem('amr-font-scale', fontScale); } catch (e) {}
  }
  function changeFont(d) {
    fontScale = Math.round(Math.max(FONT_MIN, Math.min(FONT_MAX, fontScale + d)) * 100) / 100;
    applyFontScale();
  }
  try {
    const s = parseFloat(localStorage.getItem('amr-font-scale'));
    if (!isNaN(s)) fontScale = Math.max(FONT_MIN, Math.min(FONT_MAX, s));
  } catch (e) {}

  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    btnTheme.innerHTML = t === 'dark' ? ICON_SUN : ICON_MOON;
    try { localStorage.setItem('amr-theme', t); } catch (e) {}
  }
  function toggleTheme() {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  }
  let savedTheme = (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  try { savedTheme = localStorage.getItem('amr-theme') || savedTheme; } catch (e) {}

  document.addEventListener('click', e => {
    if (e.target.closest('button') || e.target.closest('a') ||
        e.target.closest('.interactive-zone') || e.target.closest('.overlay-card') ||
        e.target.closest('.toc-drawer') || tocBackdrop.classList.contains('open') ||
        helpOverlay.classList.contains('visible')) return;
    next();
  });

  document.addEventListener('keydown', e => {
    const c = e.code;
    if (c === 'Escape') {
      toggleToc(false);
      helpOverlay.classList.remove('visible');
      overlay.classList.remove('visible');
      return;
    }
    if (e.target.closest && e.target.closest('button') && (c === 'Space' || c === 'Enter')) return;
    if (['Space', 'Enter', 'ArrowLeft', 'ArrowDown', 'PageDown'].includes(c)) { e.preventDefault(); next(); }
    else if (['ArrowRight', 'ArrowUp', 'Backspace', 'PageUp'].includes(c)) { e.preventDefault(); prev(); }
    else if (c === 'KeyA') { e.preventDefault(); showAllInCurrentSlide(); }
    else if (c === 'KeyL') { e.preventDefault(); toggleLaser(); }
    else if (c === 'KeyM') { e.preventDefault(); toggleToc(); }
    else if (c === 'KeyH') { e.preventDefault(); helpOverlay.classList.toggle('visible'); }
    else if (c === 'KeyF') { e.preventDefault(); toggleFullscreen(); }
    else if (c === 'KeyT') { e.preventDefault(); toggleTheme(); }
    else if (c === 'Home') { e.preventDefault(); reset(); }
  });

  let tx = null, ty = null;
  document.addEventListener('touchstart', e => {
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    tx = ty = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx > 0 ? next() : prev();
    }
  }, { passive: true });

  btnToc.addEventListener('click', e => { e.stopPropagation(); toggleToc(); });
  btnCloseToc.addEventListener('click', e => { e.stopPropagation(); toggleToc(false); });
  tocBackdrop.addEventListener('click', e => { if (!e.target.closest('.toc-drawer')) toggleToc(false); });
  btnShowAll.addEventListener('click', e => { e.stopPropagation(); showAllInCurrentSlide(); });
  btnLaser.addEventListener('click', e => { e.stopPropagation(); toggleLaser(); });
  btnHelp.addEventListener('click', e => { e.stopPropagation(); helpOverlay.classList.add('visible'); });
  closeHelpBtn.addEventListener('click', e => { e.stopPropagation(); helpOverlay.classList.remove('visible'); });
  helpOverlay.addEventListener('click', e => { if (!e.target.closest('.overlay-card')) helpOverlay.classList.remove('visible'); });
  btnFull.addEventListener('click', e => { e.stopPropagation(); toggleFullscreen(); });
  btnTheme.addEventListener('click', e => { e.stopPropagation(); toggleTheme(); });
  btnFontUp.addEventListener('click', e => { e.stopPropagation(); changeFont(FONT_STEP); });
  btnFontDown.addEventListener('click', e => { e.stopPropagation(); changeFont(-FONT_STEP); });
  btnNext.addEventListener('click', e => { e.stopPropagation(); next(); });
  btnPrev.addEventListener('click', e => { e.stopPropagation(); prev(); });
  restartBtn.addEventListener('click', e => { e.stopPropagation(); reset(); });
  if (goWorkshopBtn) goWorkshopBtn.addEventListener('click', e => {
    e.stopPropagation();
    overlay.classList.remove('visible');
    goTo(deck.length - 1, true);
  });
  overlay.addEventListener('click', e => { if (!e.target.closest('.overlay-card')) overlay.classList.remove('visible'); });
  document.addEventListener('fullscreenchange', updateFullscreenIcon);
  document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);

  renderSection();
  updateHud();
  updateFullscreenIcon();
  applyFontScale();
  applyTheme(savedTheme);
})();
