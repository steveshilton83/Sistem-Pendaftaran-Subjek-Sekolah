/**
 * SERVICE WORKER (e-Agihan SMKTego)
 * Membolehkan aplikasi dipasang ke skrin utama telefon pintar (PWA)
 * dan berfungsi dalam mod luar talian (Offline Support).
 */

const CACHE_NAME = "e-agihan-smktego-v1.2.0";

// Senarai aset teras aplikasi yang disimpan ke dalam cache peranti
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./css/print.css",
  "./js/config.js",
  "./js/data.js",
  "./js/sync.js",
  "./js/pdf-generator.js",
  "./js/app.js",
  "./js/logo-base64.js",
  "./js/jspdf.umd.min.js",
  "./js/jspdf.plugin.autotable.min.js",
  "./js/qrcode.min.js",
  "./assets/logo.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

// 1. Pemasangan Service Worker (Install Event)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Menyimpan fail aplikasi ke cache peranti...");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Aktifkan service worker dengan segera tanpa menunggu sesi semasa ditutup
  self.skipWaiting();
});

// 2. Pengaktifan & Pembersihan Cache Lama (Activate Event)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Membersihkan versi cache lama:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Ambil alih kawalan halaman dengan serta-merta
  self.clients.claim();
});

// 3. Pengendalian Permintaan Rangkaian (Fetch Event)
self.addEventListener("fetch", (event) => {
  // Hanya proses permintaan kaedah GET
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // Jangan simpan cache bagi panggilan API backend tempatan atau pangkalan data awan
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("firebasedatabase.app") ||
    url.hostname.includes("googleapis.com")
  ) {
    return;
  }

  // Strategi: Stale-While-Revalidate untuk kelajuan maksimum & sokongan luar talian
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika fail ada dalam cache, hantar fail tersebut terlebih dahulu
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Jika rangkaian terputus dan pengguna meminta halaman HTML, pulangkan index.html dari cache
          if (event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html")) {
            return caches.match("./index.html");
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
