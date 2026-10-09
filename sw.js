const VERSION='1.0.1';
const PREFIX=`to-limpo:${new URL(self.registration.scope).pathname}:`;
const CACHE=PREFIX+VERSION;
const ASSETS=['./','./index.html','./styles.css','./app.js','./model.js','./storage.js','./updates.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); });
self.addEventListener('activate',event => {
  event.waitUntil((async () => {
    const names=await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(PREFIX) && name!==CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event => { if(event.data?.type==='SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch',event => {
  const url=new URL(event.request.url), scope=new URL(self.registration.scope);
  if(event.request.method!=='GET' || url.origin!==scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  event.respondWith((async () => {
    const cache=await caches.open(CACHE);
    const cached=await cache.match(event.request,{ignoreSearch:true});
    if(cached) return cached;
    try { return await fetch(event.request); }
    catch(error) { if(event.request.mode==='navigate') return await cache.match('./index.html'); throw error; }
  })());
});
