// ---------- اردو فونٹس اسٹوڈیو — Service Worker ----------
// نوٹ: "Network First" حکمتِ عملی — جب تک انٹرنیٹ چل رہا ہو، ہمیشہ تازہ ترین فائل
// سرور سے لائی جائے گی۔ صرف آف لائن ہونے کی صورت میں cache استعمال ہوگا۔
// ہر نئی ریلیز کے ساتھ CACHE_VERSION کو بڑھایا جائے (مثلاً v1 → v2) تاکہ پرانا cache خودکار صاف ہو جائے۔

const CACHE_VERSION = 'ufs-v31';
const CACHE_NAME = `urdu-font-studio-cache-${CACHE_VERSION}`;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ایپ کا اپنا ریفریش بٹن اسی میسج کے ذریعے نئے ورژن کو فوراً فعال کر سکتا ہے
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
