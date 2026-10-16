/**
 * PRODUCTION BUILD SCRIPT (e-Agihan SMKTego)
 * Zero-dependency build & lint validator for production deployment (Vercel, Netlify, Docker, CI/CD).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const isCheckOnly = process.argv.includes('--check-only');

console.log('===========================================================');
console.log('🚀 Memulakan Binaan Pengeluaran (Production Build): e-Agihan');
console.log('===========================================================');

let errorCount = 0;
let warningCount = 0;

// 1. Muat pembolehubah .env jika wujud
const env = {};
const envPath = path.join(ROOT_DIR, '.env');
if (fs.existsSync(envPath)) {
  console.log('📄 Membaca pembolehubah dari .env...');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
}

// Tindih dengan process.env daripada dashboard hosting jika ada
for (const key of Object.keys(process.env)) {
  if (key.startsWith('VITE_') || ['PORT', 'NODE_ENV', 'ADMIN_PIN', 'FIREBASE_DATABASE_URL', 'API_BASE_URL', 'SCHOOL_NAME', 'SCHOOL_SESSION', 'COORDINATOR_NAME'].includes(key)) {
    env[key] = process.env[key];
  }
}

// 2. Semak integriti index.html dan import fail
console.log('\n🔍 Menyemak integriti HTML dan import fail...');
const indexPath = path.join(ROOT_DIR, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html tidak ditemui!');
  process.exit(1);
}

const htmlContent = fs.readFileSync(indexPath, 'utf8');

// Cari semua <script src="...">
const scriptSrcRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
let match;
const scriptFiles = [];
while ((match = scriptSrcRegex.exec(htmlContent)) !== null) {
  const src = match[1];
  if (!src.startsWith('http://') && !src.startsWith('https://')) {
    scriptFiles.push(src);
  }
}

// Cari semua <link href="...">
const linkHrefRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
const linkFiles = [];
while ((match = linkHrefRegex.exec(htmlContent)) !== null) {
  const href = match[1];
  if (!href.startsWith('http://') && !href.startsWith('https://')) {
    linkFiles.push(href);
  }
}

// Sahkan semua fail rujukan wujud
for (const script of scriptFiles) {
  const filePath = path.join(ROOT_DIR, script);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Ralat Import: Fail skrip [${script}] tidak wujud!`);
    errorCount++;
  } else {
    console.log(`  ✓ Skrip dikesan: ${script}`);
  }
}

for (const link of linkFiles) {
  const filePath = path.join(ROOT_DIR, link);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Ralat Import: Fail pautan [${link}] tidak wujud!`);
    errorCount++;
  } else {
    console.log(`  ✓ Pautan dikesan: ${link}`);
  }
}

// 3. Sintaks & Linting Semakan JavaScript
console.log('\n🔎 Menyemak sintaks JavaScript (Syntax & Lint Check)...');
const jsFilesToCheck = [
  'js/config.js',
  'js/data.js',
  'js/sync.js',
  'js/pdf-generator.js',
  'js/app.js',
  'sw.js'
];

for (const jsRel of jsFilesToCheck) {
  const fullPath = path.join(ROOT_DIR, jsRel);
  if (fs.existsSync(fullPath)) {
    const code = fs.readFileSync(fullPath, 'utf8');
    try {
      new vm.Script(code, { filename: jsRel });
      console.log(`  ✓ Sintaks sah: ${jsRel} (${(code.length / 1024).toFixed(1)} KB)`);
    } catch (syntaxErr) {
      console.error(`❌ Ralat Sintaks dalam [${jsRel}]: ${syntaxErr.message}`);
      errorCount++;
    }
  }
}

if (errorCount > 0) {
  console.error(`\n❌ Binaan Gagal: ${errorCount} ralat dikesan.`);
  process.exit(1);
}

if (isCheckOnly) {
  console.log('\n✅ Semakan integriti berjaya! Tiada ralat ditemui.');
  process.exit(0);
}

// 4. Salin fail ke dist/ untuk pengeluaran (Production Distribution)
console.log('\n📦 Membina direktori pengeluaran [dist/]...');
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Salin folders
['assets', 'css', 'js'].forEach(folder => {
  const src = path.join(ROOT_DIR, folder);
  if (fs.existsSync(src)) {
    copyDirRecursive(src, path.join(DIST_DIR, folder));
  }
});

// Salin fail utama
['index.html', 'manifest.json', 'sw.js'].forEach(file => {
  const src = path.join(ROOT_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST_DIR, file));
  }
});

// 5. Suntik pembolehubah persekitaran ke dist/js/config.js
console.log('💉 Menyuntik pembolehubah persekitaran ke dalam konfigurasi produksi...');
const distConfigPath = path.join(DIST_DIR, 'js', 'config.js');
const clientConfig = {
  SCHOOL_NAME: env.SCHOOL_NAME || env.VITE_SCHOOL_NAME || "SMK TENGHILAN",
  SCHOOL_SESSION: env.SCHOOL_SESSION || env.VITE_SCHOOL_SESSION || "2026/2027",
  COORDINATOR_NAME: env.COORDINATOR_NAME || env.VITE_COORDINATOR_NAME || "Steve Shilton Ating",
  ADMIN_PIN: env.ADMIN_PIN || env.VITE_ADMIN_PIN || "2026",
  FIREBASE_DATABASE_URL: env.FIREBASE_DATABASE_URL || env.VITE_FIREBASE_DATABASE_URL || "",
  API_BASE_URL: env.API_BASE_URL || env.VITE_API_BASE_URL || "",
  ENV: env.NODE_ENV || "production"
};

const injectedContent = `/**
 * KONFIGURASI PENGELUARAN (Production Build) - Dijana secara automatik
 */
window.__ENV__ = ${JSON.stringify(clientConfig, null, 2)};
` + fs.readFileSync(distConfigPath, 'utf8');

fs.writeFileSync(distConfigPath, injectedContent, 'utf8');

console.log('\n===========================================================');
console.log('✨ BINAAN PENGELUARAN BERJAYA DISIAPKAN (Exit Code: 0)');
console.log(`📁 Lokasi Output: ${DIST_DIR}`);
console.log('===========================================================');
