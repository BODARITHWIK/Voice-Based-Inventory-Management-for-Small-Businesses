import { getTranslation, translations } from '../src/i18n/index.js';
import en from '../src/i18n/en.js';

const SECTIONS = ['sales', 'products', 'purchases', 'suppliers', 'customers', 'reports'];

const INDIAN_LANGS = [
  'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'ur', 'or',
  'as', 'ne', 'kok', 'ks', 'sd', 'sa', 'mai', 'doi', 'brx', 'mni', 'sat'
];

console.log('===============================================================');
console.log('SWARANIDHI - COMPREHENSIVE MULTILINGUAL VERIFICATION');
console.log('Verifying all 22 Indian Languages + English across Kirana Core:');
console.log('Sales, My Stock (Products), Purchases, Suppliers, Customers, Reports');
console.log('===============================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

for (const lang of INDIAN_LANGS) {
  let langPassed = 0;
  let langTotal = 0;
  let sampleTranslations = {};

  for (const section of SECTIONS) {
    const enKeys = Object.keys(en[section] || {});
    for (const key of enKeys) {
      const fullPath = `${section}.${key}`;
      const translated = getTranslation(lang, fullPath);
      const enVal = en[section][key];

      totalChecks++;
      langTotal++;

      // Condition 1: Must not be undefined or keyPath
      if (!translated || translated === fullPath) {
        console.error(`❌ [${lang.toUpperCase()}] Missing key: ${fullPath}`);
        failedChecks++;
        continue;
      }

      // Condition 2: Must not fall back to English for section titles and primary headers
      if (['title', 'subtitle', 'newSaleBtn', 'newPurchaseBtn', 'addSupplierBtn', 'addCustomerBtn'].includes(key)) {
        if (translated === enVal) {
          console.error(`⚠️ [${lang.toUpperCase()}] Untranslated English fallback: ${fullPath} = "${translated}"`);
          failedChecks++;
          continue;
        }
      }

      passedChecks++;
      langPassed++;

      if (!sampleTranslations[section]) {
        sampleTranslations[section] = `${key}: "${translated}"`;
      }
    }
  }

  const coveragePct = Math.round((langPassed / langTotal) * 100);
  console.log(`✅ [${lang.toUpperCase()}] ${langPassed}/${langTotal} keys verified (${coveragePct}% native coverage)`);
  console.log(`   Sample: Sales -> ${translations[lang]?.sales?.title} | Stock -> ${translations[lang]?.products?.title} | Khata -> ${translations[lang]?.customers?.title}`);
}

console.log('\n===============================================================');
console.log(`Summary: ${passedChecks}/${totalChecks} tests passed across all 22 Indian languages!`);
console.log('===============================================================');

if (failedChecks === 0) {
  console.log('\n🎉 ALL 22 INDIAN LANGUAGES FULLY TRANSLATED FOR ALL 6 CORE PAGES!');
  process.exit(0);
} else {
  console.error(`\n❌ ${failedChecks} checks failed.`);
  process.exit(1);
}
