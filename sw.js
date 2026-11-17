/* سرویس‌ورکر: آفلاین‌شدن کتابخانه. HTML/JS/CSS ابتدا از شبکه (همیشه تازه) و در نبود اینترنت از کش؛ فونت و تصویر از کش. */
const CACHE = 'arabic-lib-v4'; /* نسخه کش بالا رفت */
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'assets/theme.css', 'assets/deck.js', 'assets/rules.js', 'assets/fonts.css',
  'assets/poster.css', 'assets/poster-export.js', 'assets/html2canvas.min.js',
  'assets/register-sw.js', 'assets/icon.svg',
  'assets/fonts/scheherazade-arabic-400.woff2', 'assets/fonts/scheherazade-arabic-700.woff2',
  'assets/fonts/scheherazade-latin-400.woff2', 'assets/fonts/scheherazade-latin-700.woff2',
  'assets/fonts/vazirmatn-arabic.woff2', 'assets/fonts/vazirmatn-latin-ext.woff2', 'assets/fonts/vazirmatn-latin.woff2',
  'posters/afal-khamsa.html', 'posters/huruf-illat-sahih.html', 'posters/madi-14-sigha.html', 'posters/mudari-14-sigha.html',
  'posters/plural-types.html', /* فایل جدید */
  'rules/amr.html', 'rules/mufrad-muthanna-jam.html', 'rules/tadkir-taanith.html',
  'rules/plural-types.html' /* فایل جدید */
];

self.addEventListener('install', e => {
  /* اگر یک فایل پیدا نشد، نصب کل سرویس‌ورکر شکست نخورد */
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(FILES.map(f => c.add(f)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isFont = /\.(woff2?|svg|png)$/.test(req.url);
  e.respondWith(isFont ? cacheFirst(req) : networkFirst(req));
});
async function networkFirst(req) {
  try {
    const res = await fetch(req);
    /* فایل خالی یا خطا هرگز در کش ذخیره نشود */
    if (res.ok && res.status === 200 && res.headers.get('content-length') !== '0') {
      const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp));
    }
    return res;
  } catch (err) {
    return (await caches.match(req, { ignoreSearch: true })) || (await caches.match('index.html')) || Response.error();
  }
}
async function cacheFirst(req) {
  const hit = await caches.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
  return res;
}
