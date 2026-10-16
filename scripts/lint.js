/**
 * LINT SCRIPT (e-Agihan SMKTego)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const files = [
  'js/config.js',
  'js/data.js',
  'js/sync.js',
  'js/pdf-generator.js',
  'js/app.js',
  'sw.js'
];

let errors = 0;
console.log('🔍 Menjalankan pemeriksaan sintaks & linting JS...');
for (const file of files) {
  const p = path.join(ROOT_DIR, file);
  if (fs.existsSync(p)) {
    try {
      new vm.Script(fs.readFileSync(p, 'utf8'), { filename: file });
      console.log(`  ✓ ${file} [OK]`);
    } catch (e) {
      console.error(`  ❌ ${file} [RALAT]: ${e.message}`);
      errors++;
    }
  }
}

if (errors > 0) {
  process.exit(1);
} else {
  console.log('✅ Semua fail JavaScript mematuhi sintaks yang sah.');
  process.exit(0);
}
