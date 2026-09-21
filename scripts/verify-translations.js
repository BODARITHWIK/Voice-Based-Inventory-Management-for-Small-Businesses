// Automated Translation Completeness Validator for Swaranidhi
// Compares English translation keys against all 22 Eighth Schedule Indian language files.

import en from '../src/i18n/en.js';
import { translations } from '../src/i18n/index.js';
import { INDIAN_LANGUAGES } from '../src/config/languages.js';

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], prefix ? `${prefix}.${k}` : k));
    } else {
      keys.push(prefix ? `${prefix}.${k}` : k);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(en));
console.log(`[i18n Audit] Base English keys count: ${enKeys.size}`);

const expectedCodes = INDIAN_LANGUAGES.map((l) => l.code);
let totalFailures = 0;

for (const code of expectedCodes) {
  if (code === 'en') continue;

  const dict = translations[code];
  if (!dict) {
    console.error(`❌ [FAIL] Missing translation module in src/i18n/index.js for language: ${code}`);
    totalFailures++;
    continue;
  }

  const langKeys = new Set(getKeys(dict));
  const missing = [...enKeys].filter((k) => !langKeys.has(k));

  if (missing.length > 0) {
    console.error(`❌ [FAIL] ${code} is missing ${missing.length} keys:`);
    console.error(`   Sample missing: ${missing.slice(0, 10).join(', ')}`);
    totalFailures++;
  } else {
    console.log(`✅ [PASS] ${code} has 100% key parity (${langKeys.size}/${enKeys.size})`);
  }
}

if (totalFailures > 0) {
  console.error(`\n❌ Translation Completeness Check Failed: ${totalFailures} languages have errors.`);
  process.exit(1);
} else {
  console.log(`\n🎉 All ${expectedCodes.length} languages are 100% complete and validated!`);
  process.exit(0);
}
