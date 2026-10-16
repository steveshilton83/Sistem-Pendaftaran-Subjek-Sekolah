/**
 * KONFIGURASI PERSEKITARAN APLIKASI (e-Agihan SMKTego)
 * Memuatkan nilai konfigurasi dan pembolehubah persekitaran (Environment Variables).
 * Nilai ini boleh ditindih melalui fail .env semasa pra-binaan (pre-build)
 * atau disuntik ke dalam window.__ENV__ oleh platform hosting.
 */
(function () {
  const env = (typeof window !== "undefined" && window.__ENV__) || {};

  window.__APP_CONFIG__ = {
    // 1. Maklumat Asas Sekolah
    SCHOOL_NAME: env.SCHOOL_NAME || env.VITE_SCHOOL_NAME || "SMK TENGHILAN",
    SCHOOL_SESSION: env.SCHOOL_SESSION || env.VITE_SCHOOL_SESSION || "2026/2027",
    COORDINATOR_NAME: env.COORDINATOR_NAME || env.VITE_COORDINATOR_NAME || "Steve Shilton Ating",

    // 2. Kod Keselamatan / PIN Kebenaran Khas Penyelaras & GKMP (Override PIN)
    ADMIN_PIN: env.ADMIN_PIN || env.VITE_ADMIN_PIN || "2026",

    // 3. Pangkalan Data Awan (Firebase Realtime Database)
    // Jika dikonfigurasikan di .env / dashboard hosting, Cloud Sync diaktifkan secara automatik
    FIREBASE_DATABASE_URL: env.FIREBASE_DATABASE_URL || env.VITE_FIREBASE_DATABASE_URL || "",

    // 4. URL Asas Pelayan API (Kosongkan jika frontend dan backend berada pada origin yang sama)
    API_BASE_URL: env.API_BASE_URL || env.VITE_API_BASE_URL || "",

    // 5. Mod Persekitaran
    ENV: env.NODE_ENV || env.MODE || "production"
  };
})();
