/* خروجی PNG و PDF لوح‌ها — مشترک بین همهٔ لوح‌ها */
(function () {
  'use strict';
  var BOARD_SEL = '.poster-board';
  var LABEL = '<span>🖼️</span><span>دانلود عکس با کیفیت بالا (PNG)</span>';
  var MAX_SIDE = 16000, MAX_AREA = 90e6;

  /* html2canvas هر تکهٔ متنی (هر <span> رنگی) را جداگانه می‌کشد و شکل‌گیری حروف عربی
     در مرز بین تکه‌ها قطع می‌شود (مثلاً «یَ» + «ضْرِبُ» جدا و بدون اتصال دیده می‌شود).
     راه‌حل: در مرز دو تکهٔ پیوسته، یک ZWJ (حرف‌چسبان نامرئی) می‌گذاریم تا هر تکه با شکل اتصالیِ درست کشیده شود. */
  var ZWJ = '\u200D';
  var MARK = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u200C-\u200F]/;
  var ARLETTER = /[\u0620-\u064A\u066E-\u06D3\u06FA-\u06FF\u0750-\u077F]/;
  var NOJOIN_NEXT = /[\u0621\u0622\u0623\u0624\u0625\u0627\u0629\u062F\u0630\u0631\u0632\u0648\u0698\u0671\u06D5\u06C0\u06C3\u06D2\u06D3]/;
  function lastBase(t) { for (var i = t.length - 1; i >= 0; i--) { if (!MARK.test(t[i])) return t[i]; } return ''; }
  function isInlineChain(el, stop, win) {
    for (; el && el !== stop; el = el.parentNode) {
      if (el.nodeType === 1 && win.getComputedStyle(el).display !== 'inline') return false;
    }
    return true;
  }
  function commonAncestor(a, b) {
    var set = [], n;
    for (n = a; n; n = n.parentNode) set.push(n);
    for (n = b; n; n = n.parentNode) if (set.indexOf(n) > -1) return n;
    return null;
  }
  function joinArabicAcrossSpans(doc) {
    var root = doc.querySelector(BOARD_SEL) || doc.body, win = doc.defaultView;
    var walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) { if (/\S/.test(n.nodeValue) || n.nodeValue.length) nodes.push(n); }
    for (var i = 0; i + 1 < nodes.length; i++) {
      var a = nodes[i], b = nodes[i + 1];
      if (a.parentNode === b.parentNode && a.nextSibling !== b) continue;
      var av = a.nodeValue, bv = b.nodeValue;
      var prev = lastBase(av), next = bv.charAt(0);
      if (!ARLETTER.test(prev) || NOJOIN_NEXT.test(prev) || !ARLETTER.test(next)) continue; /* فقط اگر واقعاً به هم می‌چسبند */
      if (/\s$/.test(av) || /^\s/.test(bv)) continue;
      var anc = commonAncestor(a, b);
      if (!anc || !isInlineChain(a.parentNode, anc, win) || !isInlineChain(b.parentNode, anc, win)) continue;
      if (anc.nodeType === 1 && win.getComputedStyle(anc).display.indexOf('flex') > -1) continue; /* در flex اصلاً چسبیده نیستند */
      if (av.charAt(av.length - 1) !== ZWJ) a.nodeValue = av + ZWJ;
      if (bv.charAt(0) !== ZWJ) b.nodeValue = ZWJ + bv;
    }
  }

  function fixClone(doc) {
    joinArabicAcrossSpans(doc);
    var st = doc.createElement('style');
    /* letter-spacing شکل‌گیری حروف عربی را در html2canvas می‌شکند؛ سایه‌ها و انیمیشن‌ها هم حذف می‌شوند */
    st.textContent = '*{letter-spacing:normal!important;animation:none!important;transition:none!important}' +
      BOARD_SEL + '{box-shadow:none!important}';
    doc.head.appendChild(st);
    /* متن گرادیانی (background-clip:text) در html2canvas مستطیل توپر می‌شود؛ رنگ ساده جایگزین می‌شود */
    doc.querySelectorAll('*').forEach(function (el) {
      var cs = doc.defaultView.getComputedStyle(el);
      if (cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || cs.webkitTextFillColor === 'transparent') {
        el.style.setProperty('background', 'none', 'important');
        el.style.setProperty('-webkit-text-fill-color', '#785a0e', 'important');
        el.style.setProperty('color', '#785a0e', 'important');
      }
    });
  }

  function render(board, scale) {
    return html2canvas(board, {
      scale: scale, useCORS: true, backgroundColor: '#ffffff', logging: false,
      windowWidth: 1280,           /* همیشه چیدمان دسکتاپ، حتی روی موبایل */
      scrollX: 0, scrollY: -window.scrollY, onclone: function (d) { fixClone(d); }
    });
  }

  window.downloadHighResImage = async function () {
    var board = document.querySelector(BOARD_SEL), btn = document.getElementById('imgBtn');
    if (!board || typeof html2canvas !== 'function') { alert('ابزار رندر بارگذاری نشده است.'); return; }
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span><span>در حال رندر کیفیت بالا…</span>';
    try {
      await document.fonts.ready;
      var w = Math.max(board.offsetWidth, 1200), h = board.scrollHeight * (w / board.offsetWidth || 1);
      var scale = Math.min(3, MAX_SIDE / h, Math.sqrt(MAX_AREA / (w * h)));
      var canvas = null;
      for (var s = scale; s >= 1 && !canvas; s = s > 1 ? Math.max(1, s - 0.75) : 0) {
        try { var c = await render(board, s); if (c.width && c.height) canvas = c; } catch (e) { if (s <= 1) throw e; }
      }
      if (!canvas) throw new Error('render failed');
      var blob = await new Promise(function (r) { canvas.toBlob(r, 'image/png'); });
      var url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = document.body.dataset.png || 'poster.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    } catch (e) {
      console.error(e); alert('رندر عکس ناموفق بود. از «چاپ / ذخیره PDF» استفاده کنید.');
    } finally { btn.disabled = false; btn.innerHTML = LABEL; }
  };

  /* چاپ: لوح در یک صفحهٔ A3 عمودی جا می‌شود */
  var PAGE_W = (297 - 16) / 25.4 * 96, PAGE_H = (420 - 16) / 25.4 * 96;
  window.addEventListener('beforeprint', function () {
    var b = document.querySelector(BOARD_SEL); if (!b) return;
    b.style.zoom = '';
    var z = Math.min(1, PAGE_H / b.getBoundingClientRect().height, PAGE_W / b.getBoundingClientRect().width);
    if (z < 1) b.style.zoom = (z * 0.98).toFixed(3);
  });
  window.addEventListener('afterprint', function () {
    var b = document.querySelector(BOARD_SEL); if (b) b.style.zoom = '';
  });
})();
