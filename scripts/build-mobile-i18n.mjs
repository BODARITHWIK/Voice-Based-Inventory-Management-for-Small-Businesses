import fs from 'fs';
import path from 'path';
import { translations as webTranslations } from '../src/i18n/index.js';

const mobileIndexPath = path.resolve('mobile/src/i18n/index.js');
const currentContent = fs.readFileSync(mobileIndexPath, 'utf8');

// The 29 mobile keys
const keys = [
  'appName', 'tagline', 'home', 'stock', 'sales', 'purchases',
  'suppliers', 'customers', 'reports', 'alerts', 'settings',
  'login', 'logout', 'scanStock', 'voiceAssistant', 'todaySales',
  'itemsInStock', 'lowStock', 'outOfStock', 'addStock', 'recordSale',
  'totalPurchases', 'outstanding', 'save', 'cancel', 'offline',
  'online', 'syncNow', 'pendingSync'
];

// Helper to map web language object to mobile 29 keys
function mapWebToMobile(w, langCode) {
  return {
    appName: w.appName || 'Swaranidhi',
    tagline: w.tagline || 'Speak. Manage. Grow.',
    home: w.nav?.dashboard || 'Home',
    stock: w.nav?.products || 'Stock',
    sales: w.nav?.sales || 'Sales',
    purchases: w.nav?.purchases || 'Purchases',
    suppliers: w.nav?.suppliers || 'Suppliers',
    customers: w.nav?.customers || 'Khata',
    reports: w.nav?.reports || 'Reports',
    alerts: w.nav?.notifications || 'Alerts',
    settings: w.nav?.settings || 'Settings',
    login: w.auth?.loginTitle || 'Login',
    logout: w.auth?.logout || 'Logout',
    scanStock: w.quickActions?.scanStock || 'Scan Stock',
    voiceAssistant: w.aiAssistant || 'Voice Assistant',
    todaySales: w.stats?.todaySales || "Today's Sales",
    itemsInStock: w.stats?.itemsInStock || 'Items in Stock',
    lowStock: w.stats?.runningLow || 'Low Stock',
    outOfStock: w.stats?.outOfStock || 'Out of Stock',
    addStock: w.quickActions?.addItem || 'Add Stock',
    recordSale: w.quickActions?.recordSale || 'New Sale',
    totalPurchases: w.reports?.purchaseReport || 'Total Purchases',
    outstanding: w.stats?.creditSales || 'Khata Balance',
    save: w.common?.save || 'Save',
    cancel: w.common?.cancel || 'Cancel',
    offline: w.common?.offline || 'Offline',
    online: w.common?.online || 'Online',
    syncNow: w.common?.syncNow || 'Sync Now',
    pendingSync: '{count} ' + (w.common?.pending || 'pending sync'),
  };
}

// Read existing mobile translations if possible
const allCodes = [
  'en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'ur',
  'or', 'as', 'ne', 'kok', 'ks', 'sd', 'sa', 'mai', 'doi', 'brx', 'mni', 'sat'
];

// Parse existing mobile translations by evaluating the existing file
const existingMobile = {};
const transBlockMatch = currentContent.match(/const translations = \{([\s\S]*?)\n\};/);
if (transBlockMatch) {
  const transBlock = transBlockMatch[1];
  const langBlocks = transBlock.split(/\n  ([a-z]{2,3}): \{/);
  for (let i = 1; i < langBlocks.length; i += 2) {
    const code = langBlocks[i];
    const block = langBlocks[i + 1];
    existingMobile[code] = {};
    for (const key of keys) {
      const m = block.match(new RegExp(`${key}:\\s*'([^']*)'`));
      if (m) {
        existingMobile[code][key] = m[1];
      }
    }
  }
}

const finalTranslations = {};
for (const code of allCodes) {
  if (existingMobile[code] && Object.keys(existingMobile[code]).length >= 25) {
    // Preserve existing mobile translations and fill any missing keys
    finalTranslations[code] = { ...mapWebToMobile(webTranslations[code] || {}, code), ...existingMobile[code] };
  } else {
    finalTranslations[code] = mapWebToMobile(webTranslations[code] || {}, code);
  }
}

// Generate new translations object string
let newTransStr = 'const translations = {\n';
for (const code of allCodes) {
  newTransStr += `  ${code}: {\n`;
  for (const k of keys) {
    const val = (finalTranslations[code][k] || '').replace(/'/g, "\\'");
    newTransStr += `    ${k}: '${val}',\n`;
  }
  newTransStr += '  },\n';
}
newTransStr += '};';

const updatedContent = currentContent.replace(/const translations = \{[\s\S]*?\n\};/, newTransStr);
fs.writeFileSync(mobileIndexPath, updatedContent, 'utf8');
console.log(`Successfully updated ${mobileIndexPath} with all ${allCodes.length} languages!`);
