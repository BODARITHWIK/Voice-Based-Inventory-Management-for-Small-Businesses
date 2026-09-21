// Automated Mobile Translation Completeness Validator for Swaranidhi
// Compares English translation keys against all 22 Eighth Schedule Indian language translations in mobile.

import mobileI18n from '../mobile/src/i18n/index.js';
const { INDIAN_LANGUAGES, getTranslation } = mobileI18n;

// Read the translations dictionary from the mobile i18n file
import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.resolve('mobile/src/i18n/index.js'), 'utf8');
const match = content.match(/const translations = (\{[\s\S]*?\n\});/);
if (!match) {
  console.error('Could not find translations object in mobile/src/i18n/index.js');
  process.exit(1);
}

// Evaluate translations
const translations = eval(`(${match[1]})`);

const enKeys = Object.keys(translations.en);
console.log(`[Mobile i18n Audit] Base English keys count: ${enKeys.length}`);

let totalFailures = 0;
const expectedCodes = INDIAN_LANGUAGES.map((l) => l.code);

for (const code of expectedCodes) {
  if (code === 'en') continue;

  const dict = translations[code];
  if (!dict) {
    console.error(`❌ [FAIL] Missing translation dictionary for language: ${code}`);
    totalFailures++;
    continue;
  }

  const langKeys = Object.keys(dict);
  const missing = enKeys.filter((k) => !dict[k] || dict[k].trim() === '');

  if (missing.length > 0) {
    console.error(`❌ [FAIL] ${code} is missing ${missing.length} keys: ${missing.join(', ')}`);
    totalFailures++;
  } else {
    console.log(`✅ [PASS] ${code} has 100% key parity (${langKeys.length}/${enKeys.length})`);
  }
}

if (totalFailures > 0) {
  console.error(`\n❌ Mobile Translation Audit Failed: ${totalFailures} languages have errors.`);
  process.exit(1);
} else {
  console.log(`\n🎉 All ${expectedCodes.length} mobile languages have 100% key parity!`);
  process.exit(0);
}
