// Swaranidhi Language & Natural Multilingual Detection Service
// Supports: All 22 Eighth Schedule Indian Languages + English, Scripts, Romanized Indian Languages, and Code-Switching

import { getLanguageByCode } from './indianLanguages.js';

/**
 * Common Romanized Telugu Markers
 */
const TELUGU_ROMANIZED_KEYWORDS = [
  'cheyyi', 'cheyi', 'chey', 'add cheyyi', 'chupinchu', 'choopinchu', 'chupiyi',
  'entha', 'yentha', 'undi', 'undhi', 'ichanu', 'icchanu', 'ivvu', 'iyyandi',
  'biyyam', 'kilo', 'kilolu', 'packetlu', 'packettlu', 'dabba', 'pettu',
  'stock lo', 'lo', 'gariki', 'khata lo', 'ammeyyi', 'ammanu', 'ammindi',
  'takkuva', 'aipoyindi', 'vellindi', 'ee roju', 'eroju', 'repu', 'naku',
  'chaladhu', 'inka', 'inko'
];

/**
 * Common Romanized Hindi (Hinglish) Markers
 */
const HINDI_ROMANIZED_KEYWORDS = [
  'karo', 'kar do', 'kar do ji', 'kijiye', 'dikhao', 'dekho', 'batao',
  'kitna', 'kitni', 'hai', 'hain', 'diye', 'diya', 'de do',
  'chawal', 'packet', 'dabba', 'daalo', 'dal do', 'jodo', 'jod do',
  'stock mein', 'mein', 'ko', 'ka', 'ki', 'ke', 'udhaar', 'khata',
  'becho', 'becha', 'bikri', 'kam', 'khatam', 'aaj', 'aaj ki', 'kal',
  'hatao', 'nikalo', 'aur', 'chahiye'
];

/**
 * Romanized Kannada Markers
 */
const KANNADA_ROMANIZED_KEYWORDS = [
  'haaki', 'serisi', 'kodbeku', 'eshtu', 'aayitu', 'maaratav', 'illa', 'beku',
  'ge', 'alli', 'thogo', 'kodi', 'ivatthu'
];

/**
 * Romanized Tamil Markers
 */
const TAMIL_ROMANIZED_KEYWORDS = [
  'serunga', 'podunga', 'evvalavu', 'aachu', 'kudunga', 'venum', 'la', 'irukku',
  'inniku', 'kaattu'
];

/**
 * Romanized Malayalam Markers
 */
const MALAYALAM_ROMANIZED_KEYWORDS = [
  'cherkkoo', 'cherkkuka', 'ethra', 'aayi', 'kodukkoo', 'kuravullath', 'il', 'undo',
  'innu', 'kaanikku'
];

/**
 * Common Shopkeeper Typo & Colloquial Normalization Dictionary
 */
const TYPO_REPLACEMENTS = [
  // Units & Packets
  { pattern: /\b(pakets?|pakkets?|pkt|pkts|pckts?|packts?)\b/gi, replacement: 'packets' },
  { pattern: /\b(packetlu|packettlu|pyaaketlu|ప్యాకెట్లు|पैकेट|பாக்கெட்|প্যাকেট|ਪੈਕਟ|پیکٹ|পেকেট|ପ୍ୟାକେଟ୍)\b/gi, replacement: 'packets' },
  { pattern: /\b(kilolu|kilos?|kg|kgs|కేజీలు|కిలోలు|किलो|கிலோ|কিলো)\b/gi, replacement: 'kg' },
  { pattern: /\b(litres?|liters?|ltr|ltrs|లీటర్లు|लीटर|லிட்டர்)\b/gi, replacement: 'litres' },
  { pattern: /\b(dabbas?|dabbaalu|డబ్బా|डिब्बा|டப்பா)\b/gi, replacement: 'boxes' },

  // Brand names & Common products
  { pattern: /\b(maggie|magi|మేగి|మ్యాగీ|मैगी|மகி|ম্যাগি|ਮੈਗੀ|میگی)\b/gi, replacement: 'Maggi' },
  { pattern: /\b(heritage\s*milk|హెరిటేజ్\s*మిల్క్|हेरिटेज\s*मिल्क)\b/gi, replacement: 'Heritage Milk' },
  { pattern: /\b(parle g|parleg|parle-g|పార్లే జి|पारले जी)\b/gi, replacement: 'Parle-G' },
  { pattern: /\b(colgat|kolgate|కోల్గేట్|कोलगेट)\b/gi, replacement: 'Colgate' },
  { pattern: /\b(chawal|chaawal|biyyam|బియ్యం|चावल|அரிசி|চাল)\b/gi, replacement: 'Rice' },
  { pattern: /\b(cheeni|sakkar|panchadara|పంచదార|चीनी|சர்க்கரை|চিনি)\b/gi, replacement: 'Sugar' },
  { pattern: /\b(tel|nune|నూనె|तेल|எண்ணெய்|তেল)\b/gi, replacement: 'Oil' },
  { pattern: /\b(dal|pappu|పప్పు|दाल|பருப்பு|ডাল)\b/gi, replacement: 'Dal' },
  { pattern: /\b(atta|pindi|పిండి|आटा|மாவு|আটা)\b/gi, replacement: 'Atta' },

  // Verbs & Commands
  { pattern: /\b(cheyi|chey|ceyyi|సేయి)\b/gi, replacement: 'cheyyi' },
  { pattern: /\b(choopinchu|chupiyi|chupi|చూపించు)\b/gi, replacement: 'chupinchu' },
  { pattern: /\b(entha|yentha|యెంత|ఎంత)\b/gi, replacement: 'entha' },
  { pattern: /\b(undhi|undi|ఉంది)\b/gi, replacement: 'undi' },
  { pattern: /\b(stok|stck|stoc)\b/gi, replacement: 'stock' },
  { pattern: /\b(sel|sael)\b/gi, replacement: 'sale' },
  { pattern: /\b(ad|aadd)\b/gi, replacement: 'add' },
  { pattern: /\b(kar|krdo|krna)\b/gi, replacement: 'karo' },
  { pattern: /\b(dikhaye|dekho)\b/gi, replacement: 'dikhao' },
  { pattern: /\b(btao|btaye)\b/gi, replacement: 'batao' },
];

/**
 * Normalize Indian script numerals into standard Arabic digits (0-9)
 */
export const normalizeIndianDigits = (text = '') => {
  if (!text) return '';
  return text
    .replace(/[\u0966-\u096F]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0966 + 48)) // Devanagari ०-९
    .replace(/[\u09E6-\u09EF]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x09E6 + 48)) // Bengali ০-৯
    .replace(/[\u0A66-\u0A6F]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0A66 + 48)) // Gurmukhi ੦-੯
    .replace(/[\u0AE6-\u0AEF]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0AE6 + 48)) // Gujarati ૦-૯
    .replace(/[\u0B66-\u0B6F]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0B66 + 48)) // Odia ୦-୯
    .replace(/[\u0BE6-\u0BEF]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0BE6 + 48)) // Tamil ௦-௯
    .replace(/[\u0C66-\u0C6F]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0C66 + 48)) // Telugu ౦-౯
    .replace(/[\u0CE6-\u0CEF]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0CE6 + 48)) // Kannada ೦-೯
    .replace(/[\u0D66-\u0D6F]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0D66 + 48)) // Malayalam ൦-൯
    .replace(/[\u1C50-\u1C59]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x1C50 + 48)); // Santali ᱐-᱙
};

/**
 * Detect Language and Script from speech or text input (Section 7, 31)
 * Returns detailed metadata object
 */
export const detectLanguageDetails = (text = '') => {
  if (!text || typeof text !== 'string') {
    return { code: 'en-IN', shortCode: 'en', name: 'English', nativeName: 'English', confidence: 0.6, isIndianLanguage: false };
  }

  const str = text.trim();
  const lower = str.toLowerCase();

  // 1. Unicode Script Matching
  // Telugu: \u0C00-\u0C7F
  if (/[\u0C00-\u0C7F]/.test(str)) {
    const hasEnglish = /[a-zA-Z]{3,}/.test(str);
    return { code: 'te-IN', shortCode: hasEnglish ? 'te-en' : 'te', name: 'Telugu', nativeName: 'తెలుగు', confidence: 0.98, isIndianLanguage: true };
  }
  // Tamil: \u0B80-\u0BFF
  if (/[\u0B80-\u0BFF]/.test(str)) {
    return { code: 'ta-IN', shortCode: 'ta', name: 'Tamil', nativeName: 'தமிழ்', confidence: 0.98, isIndianLanguage: true };
  }
  // Kannada: \u0C80-\u0CFF
  if (/[\u0C80-\u0CFF]/.test(str)) {
    return { code: 'kn-IN', shortCode: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', confidence: 0.98, isIndianLanguage: true };
  }
  // Malayalam: \u0D00-\u0D7F
  if (/[\u0D00-\u0D7F]/.test(str)) {
    return { code: 'ml-IN', shortCode: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', confidence: 0.98, isIndianLanguage: true };
  }
  // Gurmukhi (Punjabi): \u0A00-\u0A7F
  if (/[\u0A00-\u0A7F]/.test(str)) {
    return { code: 'pa-IN', shortCode: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', confidence: 0.98, isIndianLanguage: true };
  }
  // Gujarati: \u0A80-\u0AFF
  if (/[\u0A80-\u0AFF]/.test(str)) {
    return { code: 'gu-IN', shortCode: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', confidence: 0.98, isIndianLanguage: true };
  }
  // Odia: \u0B00-\u0B7F
  if (/[\u0B00-\u0B7F]/.test(str)) {
    return { code: 'or-IN', shortCode: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', confidence: 0.98, isIndianLanguage: true };
  }
  // Bengali / Assamese: \u0980-\u09FF
  if (/[\u0980-\u09FF]/.test(str)) {
    if (str.includes('ৰ') || str.includes('ৱ') || str.includes('ষ্টকত')) {
      return { code: 'as-IN', shortCode: 'as', name: 'Assamese', nativeName: 'অসমীয়া', confidence: 0.97, isIndianLanguage: true };
    }
    return { code: 'bn-IN', shortCode: 'bn', name: 'Bengali', nativeName: 'বাংলা', confidence: 0.98, isIndianLanguage: true };
  }
  // Perso-Arabic (Urdu, Kashmiri, Sindhi): \u0600-\u06FF, \uFB50-\uFDFF
  if (/[\u0600-\u06FF\uFB50-\uFDFF]/.test(str)) {
    return { code: 'ur-IN', shortCode: 'ur', name: 'Urdu', nativeName: 'اردو', confidence: 0.98, isIndianLanguage: true };
  }
  // Ol Chiki (Santali): \u1C50-\u1C7F
  if (/[\u1C50-\u1C7F]/.test(str)) {
    return { code: 'sat-IN', shortCode: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', confidence: 0.98, isIndianLanguage: true };
  }
  // Devanagari: Hindi, Marathi, Nepali, Sanskrit, Maithili, Konkani, etc.
  if (/[\u0900-\u097F]/.test(str)) {
    if (/करा|जोडा|स्टॉकमध्ये|आहे|विक्री/.test(str)) {
      return { code: 'mr-IN', shortCode: 'mr', name: 'Marathi', nativeName: 'मराठी', confidence: 0.96, isIndianLanguage: true };
    }
    if (/थप्नुहोस्|स्टकमा/.test(str)) {
      return { code: 'ne-IN', shortCode: 'ne', name: 'Nepali', nativeName: 'नेपाली', confidence: 0.95, isIndianLanguage: true };
    }
    const hasEnglish = /[a-zA-Z]{3,}/.test(str);
    return { code: 'hi-IN', shortCode: hasEnglish ? 'hi-en' : 'hi', name: 'Hindi', nativeName: 'हिन्दी', confidence: 0.96, isIndianLanguage: true };
  }

  // 2. Romanized Indian Languages & Code-Switching (Section 25, 26)
  let teScore = 0;
  for (const kw of TELUGU_ROMANIZED_KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) teScore += 2;
  }
  if (/\b\w+(?:ki|lo|gariki)\b/i.test(lower)) teScore += 1.5;

  let hiScore = 0;
  for (const kw of HINDI_ROMANIZED_KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) hiScore += 2;
  }
  if (/\b(?:mein|ke|ko|ka|ki)\b/i.test(lower)) hiScore += 1;

  let knScore = 0;
  for (const kw of KANNADA_ROMANIZED_KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) knScore += 2;
  }

  let taScore = 0;
  for (const kw of TAMIL_ROMANIZED_KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) taScore += 2;
  }

  let mlScore = 0;
  for (const kw of MALAYALAM_ROMANIZED_KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) mlScore += 2;
  }

  if (teScore >= 2 && teScore > hiScore && teScore > knScore) {
    return { code: 'te-IN', shortCode: 'te-en', name: 'Telugu (Romanized)', nativeName: 'తెలుగు', confidence: 0.92, isIndianLanguage: true };
  }
  if (hiScore >= 2 && hiScore > teScore) {
    return { code: 'hi-IN', shortCode: 'hi-en', name: 'Hindi (Hinglish)', nativeName: 'हिन्दी', confidence: 0.92, isIndianLanguage: true };
  }
  if (knScore >= 2) {
    return { code: 'kn-IN', shortCode: 'kn-en', name: 'Kannada (Romanized)', nativeName: 'ಕನ್ನಡ', confidence: 0.90, isIndianLanguage: true };
  }
  if (taScore >= 2) {
    return { code: 'ta-IN', shortCode: 'ta-en', name: 'Tamil (Romanized)', nativeName: 'தமிழ்', confidence: 0.90, isIndianLanguage: true };
  }
  if (mlScore >= 2) {
    return { code: 'ml-IN', shortCode: 'ml-en', name: 'Malayalam (Romanized)', nativeName: 'മലയാളം', confidence: 0.90, isIndianLanguage: true };
  }

  // Default English
  return { code: 'en-IN', shortCode: 'en', name: 'English', nativeName: 'English', confidence: 0.88, isIndianLanguage: false };
};

/**
 * Detect Language from speech or text input (short string format for legacy callers)
 */
export const detectLanguageFromText = (text = '') => {
  const details = detectLanguageDetails(text);
  return details.shortCode;
};

/**
 * Normalize colloquial shopkeeper text (correct typos and standardise keywords)
 */
export const normalizeText = (text = '') => {
  if (!text) return '';
  // 1. Convert Indian digits first
  let normalized = normalizeIndianDigits(text.trim());

  // 2. Apply replacement rules
  for (const { pattern, replacement } of TYPO_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  // 3. Clean excessive spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  return normalized;
};

/**
 * Generate friendly conversational confirmation strings tailored to the shopkeeper's language style (Section 9-20)
 */
export const generateFriendlyResponse = (intent, entities = {}, detectedLang = 'en') => {
  const { product = 'Item', quantity = '', unit = '', customer = '', amount = '' } = entities;
  const qtyStr = quantity ? `${quantity} ${unit || 'packets'}`.trim() : '';
  const lang = String(detectedLang || 'en').toLowerCase();

  switch (intent) {
    case 'ADD_STOCK': {
      if (lang.startsWith('te')) return `అర్థమైంది 👍 ${product} ${qtyStr || ''} స్టాక్లో యాడ్ చేయాలా?`;
      if (lang.startsWith('hi')) return `समझ गया 👍 ${product} के ${qtyStr || ''} स्टॉक में जोड़ दूँ?`;
      if (lang.startsWith('kn')) return `ಅರ್ಥವಾಯಿತು 👍 ${qtyStr || ''} ${product} ಪ್ಯಾಕೆಟ್ಗಳನ್ನು ಸ್ಟಾಕ್ಗೆ ಸೇರಿಸಬೇಕೆ?`;
      if (lang.startsWith('ta')) return `புரிந்தது 👍 ${qtyStr || ''} ${product} இருப்பில் சேர்க்கவா?`;
      if (lang.startsWith('ml')) return `മനസ്സിലായി 👍 ${qtyStr || ''} ${product} സ്റ്റോക്കിൽ ചേർക്കണോ?`;
      if (lang.startsWith('bn')) return `বুঝেছি 👍 ${product} ${qtyStr || ''} স্টকে যোগ করব?`;
      if (lang.startsWith('mr')) return `समजले 👍 ${product} चे ${qtyStr || ''} स्टॉकमध्ये जोडू का?`;
      if (lang.startsWith('gu')) return `સમજી ગયો 👍 ${product} ના ${qtyStr || ''} સ્ટોકમાં ઉમેરું?`;
      if (lang.startsWith('pa')) return `ਸਮਝ ਗਿਆ 👍 ${product} ਦੇ ${qtyStr || ''} ਸਟਾਕ ਵਿੱਚ ਪਾ ਦੇਵਾਂ?`;
      if (lang.startsWith('ur')) return `سمجھ گیا 👍 ${product} کے ${qtyStr || ''} اسٹاک میں شامل کریں؟`;
      if (lang.startsWith('or')) return `ବୁଝିଗଲି 👍 ${product} ର ${qtyStr || ''} ଷ୍ଟକ୍ରେ ଯୋଡ଼ିବି?`;
      if (lang.startsWith('as')) return `বুজি পালোঁ 👍 ${product} ৰ ${qtyStr || ''} ষ্টকত যোগ কৰিম নে?`;
      return `Got it 👍 Add ${qtyStr ? qtyStr + ' of ' : ''}${product} to stock?`;
    }

    case 'SALE':
    case 'RECORD_SALE': {
      if (customer) {
        if (lang.startsWith('te')) return `${customer} కి ${product} ${qtyStr || ''} సేల్ రికార్డ్ చేయాలా?`;
        if (lang.startsWith('hi')) return `${customer} को ${product} ${qtyStr || ''} की बिक्री दर्ज करें?`;
        if (lang.startsWith('kn')) return `${customer} ಗೆ ${product} ಮಾರಾಟ ದಾಖಲಿಸಬೇಕೆ?`;
        if (lang.startsWith('ta')) return `${customer} க்கு ${product} விற்பனை பதிவு செய்யவா?`;
        return `Record sale of ${qtyStr ? qtyStr + ' of ' : ''}${product} for ${customer}?`;
      }
      if (lang.startsWith('te')) return `${product} ${qtyStr || ''} సేల్ రికార్డ్ చేయాలా?`;
      if (lang.startsWith('hi')) return `${product} ${qtyStr || ''} की बिक्री दर्ज करें?`;
      return `Record sale of ${qtyStr ? qtyStr + ' of ' : ''}${product}?`;
    }

    case 'CUSTOMER_PAYMENT': {
      if (lang.startsWith('te')) return `${customer} ఇచ్చిన ₹${amount} పేమెంట్ రికార్డ్ చేయాలా?`;
      if (lang.startsWith('hi')) return `समझ गया। ${customer} ने ₹${amount} का भुगतान किया है। इसे खाते में दर्ज कर दूँ?`;
      if (lang.startsWith('kn')) return `${customer} ನೀಡಿದ ₹${amount} ಪಾವತಿ ದಾಖಲಿಸಬೇಕೆ?`;
      if (lang.startsWith('ta')) return `${customer} அளித்த ₹${amount} கட்டணம் பதிவு செய்யவா?`;
      return `Record payment of ₹${amount} received from ${customer}?`;
    }

    case 'CUSTOMER_KHATA':
    case 'KHATA_CREDIT': {
      if (lang.startsWith('te')) {
        return amount ? `${customer} ఖాతాలో ₹${amount} యాడ్ చేయాలా?` : `${customer} ఖాతా వివరాలు తెరుస్తున్నాను...`;
      }
      if (lang.startsWith('hi')) {
        return amount ? `${customer} के खाते में ₹${amount} जोड़ें?` : `${customer} का खाता खोल रहा हूँ...`;
      }
      return amount ? `Add ₹${amount} to ${customer}'s Khata?` : `Opening account for ${customer}...`;
    }

    case 'REMOVE_STOCK': {
      if (lang.startsWith('te')) return `${product} ${qtyStr || ''} స్టాక్ నుంచి తీసివేయాలా?`;
      if (lang.startsWith('hi')) return `${product} ${qtyStr || ''} स्टॉक से हटाएं?`;
      return `Remove ${qtyStr ? qtyStr + ' of ' : ''}${product} from stock?`;
    }

    case 'CHECK_STOCK': {
      if (lang.startsWith('te')) return `${product} స్టాక్ వివరాలు చూస్తున్నాను...`;
      if (lang.startsWith('hi')) return `${product} का स्टॉक देख रहा हूँ...`;
      if (lang.startsWith('kn')) return `${product} ದಾಸ್ತಾನು ವಿವರಗಳನ್ನು ನೋಡುತ್ತಿದ್ದೇನೆ...`;
      return `Checking current stock for ${product}...`;
    }

    case 'LOW_STOCK': {
      if (lang.startsWith('te')) return `తక్కువ స్టాక్ ఉన్న వస్తువుల వివరాలు చూపిస్తున్నాను.`;
      if (lang.startsWith('hi')) return `कम स्टॉक वाले सामान दिखा रहा हूँ.`;
      if (lang.startsWith('kn')) return `ಕಡಿಮೆ ಸ್ಟಾಕ್ ಇರುವ ವಸ್ತುಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇನೆ.`;
      return `Showing low stock items that need restocking.`;
    }

    case 'TODAY_SALES':
    case 'TODAY_SUMMARY':
    case 'SALES_REPORT': {
      if (lang.startsWith('te')) return `ఈరోజు సేల్స్ రిపోర్ట్ వివరాలు ఇక్కడ ఉన్నాయి.`;
      if (lang.startsWith('hi')) return `आज की बिक्री का विवरण यह रहा.`;
      if (lang.startsWith('kn')) return `ಇಂದಿನ ಒಟ್ಟು ಮಾರಾಟ ವಿವರಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇನೆ.`;
      if (lang.startsWith('ta')) return `இன்றைய விற்பனை அறிக்கை இதோ.`;
      return `Showing today's sales summary.`;
    }

    default:
      return `I understood: "${product}". Shall I proceed?`;
  }
};

/**
 * Generate friendly follow-up query when vital information is missing (Section 28)
 */
export const generateFollowUpQuestion = (missingField, context = {}, detectedLang = 'en') => {
  const lang = String(detectedLang || 'en').toLowerCase();

  if (missingField === 'product') {
    if (lang.startsWith('te')) return `ఖచ్చితంగా. ఏ వస్తువు స్టాక్లో యాడ్ చేయాలి?`;
    if (lang.startsWith('hi')) return `ज़रूर। कौन सा आइटम जोड़ना है?`;
    if (lang.startsWith('kn')) return `ಖಂಡಿತ. ಯಾವ ವಸ್ತುವನ್ನು ಸೇರಿಸಬೇಕು?`;
    if (lang.startsWith('ta')) return `நிச்சயமாக. எந்த பொருளை சேர்க்க வேண்டும்?`;
    return `Sure. Which product should I add?`;
  }

  if (missingField === 'quantity') {
    const prod = context.product || 'item';
    if (lang.startsWith('te')) return `${prod} ఎన్ని ప్యాకెట్లు లేదా యూనిట్లు యాడ్ చేయాలి?`;
    if (lang.startsWith('hi')) return `${prod} के कितने पैकेट जोड़ने हैं?`;
    if (lang.startsWith('kn')) return `${prod} ಎಷ್ಟು ಪ್ರಮಾಣ ಸೇರಿಸಬೇಕು?`;
    if (lang.startsWith('ta')) return `${prod} எவ்வளவு அளவு சேர்க்க வேண்டும்?`;
    return `How many ${prod} should I add?`;
  }

  if (missingField === 'customer') {
    if (lang.startsWith('te')) return `ఏ కస్టమర్ ఖాతా?`;
    if (lang.startsWith('hi')) return `किस ग्राहक के खाते में?`;
    return `For which customer?`;
  }

  return `Could you please provide more details?`;
};

/**
 * Localized buttons for confirmation modal
 */
export const getLocalizedActionButtons = (langCode = 'en') => {
  const langObj = getLanguageByCode(langCode);
  return {
    confirm: langObj?.confirmText || 'Yes, Confirm',
    cancel: langObj?.cancelText || 'Cancel',
  };
};

export default {
  detectLanguageDetails,
  detectLanguageFromText,
  normalizeIndianDigits,
  normalizeText,
  generateFriendlyResponse,
  generateFollowUpQuestion,
  getLocalizedActionButtons,
};
