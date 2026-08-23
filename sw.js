/* اردو فونٹ اسٹوڈیو — سروس ورکر
   ورژن: UF238Su0652PM
   مقصد: ایپ آن لائن اور آف لائن دونوں حالتوں میں بغیر کسی رکاوٹ کے چلے۔ */

const APP_VERSION   = "UF238Su0652PM";
const CACHE_NAME    = "urdu-font-studio-" + APP_VERSION;
const CORE_ASSETS   = [
  "./",
  "./index.html",
  "./UF238Su0652PM.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-180.png"
];

/* نصب ہوتے ہی بنیادی فائلیں محفوظ کر لو — اگر کوئی فائل موجود نہ ہو تو باقی انسٹال روکے نہیں */
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch(() => {})
        )
      );
    })
  );
});

/* پرانے ورژن کی کیش صاف کر دو تاکہ ہمیشہ تازہ ترین نسخہ فعال رہے */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("urdu-font-studio-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/* صفحہ کھولنے کی درخواست (navigation): پہلے نیٹ ورک آزمائیں تاکہ تازہ ترین ورژن ملے،
   نیٹ ورک نہ ہو تو فوراً محفوظ شدہ (آف لائن) نسخہ دکھا دیں — ایپ کبھی خالی/ناکام نہیں ہوگی۔ */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, resClone)).catch(() => {});
          return res;
        })
        .catch(async () => {
          const cached =
            (await caches.match(req)) ||
            (await caches.match("./index.html")) ||
            (await caches.match("./UF238Su0652PM.html"));
          return cached || Response.error();
        })
    );
    return;
  }

  /* باقی فائلیں (فونٹس، CSS، JS، آئیکنز، CDN اسکرپٹس): پہلے کیش دیکھیں (تیز رفتار + آف لائن)،
     ساتھ ہی پس منظر میں نیٹ ورک سے تازہ کاپی لا کر کیش اپڈیٹ کر دیں۔ */
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, resClone)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

/* ایپ خود چاہے تو نئے ورژن کی فوری اطلاع لے سکتی ہے */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
