const CACHE='arabic-lib-v2';
const FILES=["./", "assets/deck.js", "assets/fonts.css", "assets/fonts/scheherazade-arabic-400.woff2", "assets/fonts/scheherazade-arabic-700.woff2", "assets/fonts/scheherazade-latin-400.woff2", "assets/fonts/scheherazade-latin-700.woff2", "assets/fonts/vazirmatn-arabic.woff2", "assets/fonts/vazirmatn-latin-ext.woff2", "assets/fonts/vazirmatn-latin.woff2", "assets/html2canvas.min.js", "assets/icon.svg", "assets/register-sw.js", "assets/rules.js", "assets/theme.css", "index.html", "manifest.webmanifest", "posters/afal-khamsa.html", "posters/huruf-illat-sahih.html", "posters/madi-14-sigha.html", "posters/mudari-14-sigha.html", "rules/amr.html", "rules/mufrad-muthanna-jam.html", "rules/tadkir-taanith.html"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{
    if(res.ok&&new URL(e.request.url).origin===location.origin){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}
    return res}).catch(()=>caches.match('./index.html'))));
});
