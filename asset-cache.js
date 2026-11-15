// Scoped, bounded visual cache. Never intercept analytics, video ranges, or game code.
const CACHE = 'hardigan-visuals-20261115';
const ROOT = new URL('./', self.location.href);
const WARM = ['promo/title-intro-card.png', 'assets/backgrounds/bg_hardigan_livingroom_night_02.png',
    'assets/menu_dialogue/dialogue-bubble-large-left.png', 'assets/menu_dialogue/dialogue-bubble-large-right.png'];
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(WARM.map(p => cache.add(new URL(p, ROOT).href)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('hardigan-visuals-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
    const req = event.request, url = new URL(req.url);
    if (req.method !== 'GET' || req.headers.has('range') || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname) || !/\.(png|jpg|jpeg|webp|svg)$/i.test(url.pathname)) return;
    event.respondWith((async () => {
        let cache;
        try { cache = await caches.open(CACHE); } catch (_) { return fetch(req); }
        const saved = await cache.match(req).catch(() => null);
        if (saved) return saved;
        const response = await fetch(req);
        if (response.ok) event.waitUntil((async () => {
            await cache.put(req, response.clone());
            const keys = await cache.keys();
            for (const key of keys.slice(0, Math.max(0, keys.length - 80))) await cache.delete(key);
        })().catch(() => {}));
        return response;
    })());
});
