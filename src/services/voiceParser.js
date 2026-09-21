// =============================================================================
// Swaranidhi Voice & Text Command Parser v3.0 (India-Wide Multilingual Intelligence)
// =============================================================================
// Core Principle: "Speak naturally in your own language. Swaranidhi understands what you mean."
// Supports: All 22 Eighth Schedule Indian Languages + English, Romanized Indian scripts,
//           Code-switching (mixed-languages), and Universal NormalizedCommand mapping.
// =============================================================================

import {
  detectLanguageDetails,
  detectLanguageFromText,
  normalizeText,
  normalizeIndianDigits,
  generateFriendlyResponse,
  generateFollowUpQuestion,
  getLocalizedActionButtons,
} from './languageService.js';
import { getLanguageByCode } from './indianLanguages.js';

// ---------------------------------------------------------------------------
// Dev Logging Helper
// ---------------------------------------------------------------------------
const IS_DEV = typeof process !== 'undefined' ? (process.env?.NODE_ENV !== 'production') : true;

function dbg(...args) {
  if (IS_DEV) console.debug('[VoiceParser]', ...args);
}

// ---------------------------------------------------------------------------
// Conversational Context (cross-turn memory)
// ---------------------------------------------------------------------------
let activeConversationContext = {
  lastProduct: null,
  lastProductId: null,
  lastQuantity: null,
  lastUnit: null,
  lastCustomer: null,
  awaitingFollowUp: null,
};

export const getConversationContext = () => ({ ...activeConversationContext });

export const setConversationContext = (updates) => {
  activeConversationContext = { ...activeConversationContext, ...updates };
};

export const clearConversationContext = () => {
  activeConversationContext = {
    lastProduct: null,
    lastProductId: null,
    lastQuantity: null,
    lastUnit: null,
    lastCustomer: null,
    awaitingFollowUp: null,
  };
};

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------
function titleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function normalizeForMatch(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s\u0C00-\u0D7F\u0900-\u097F\u0980-\u0B7F\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveUnit(rawStr, productUnit) {
  const u = (rawStr || '').toLowerCase();
  if (/\b(kg|kilo|kilolu|kilos?|కేజీ|కిలో|किलो|கிலோ|কিলো)\b/i.test(u)) return 'kg';
  if (/\b(litre|liter|ltr|ltrs|లీటర్|लीटर|லிட்டர்)\b/i.test(u)) return 'litres';
  if (/\b(box|boxes|dabba|డబ్బా|डिब्बा|டப்பா)\b/i.test(u)) return 'boxes';
  if (/\b(bottle|bottles|బాటిల్|बोतल)\b/i.test(u)) return 'bottles';
  if (/\b(piece|pieces|pcs?)\b/i.test(u)) return 'pieces';
  if (/\b(packet|packets|pkt|pkts?|pack|packetlu|packettlu|ప్యాకెట్|पैकेट|பாக்கெட்|প্যাকেট|ਪੈਕਟ|پیکٹ|পেকেট|ପ୍ୟାକେଟ୍|पाकिटां|पुटकम्)\b/i.test(u)) return 'packets';
  return productUnit || 'packets';
}

function parseQuantity(str) {
  if (!str) return null;
  const normalizedStr = normalizeIndianDigits(str);
  const lower = normalizedStr.toLowerCase().trim();

  const WORD_NUMS = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
    eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
    ek: 1, do: 2, teen: 3, char: 4, paanch: 5, chhe: 6, saat: 7, aath: 8, nau: 9, das: 10,
    bees: 20, tees: 30, chalis: 40, pachas: 50,
    okati: 1, rendu: 2, moodhu: 3, naalu: 4, aidu: 5, aru: 6, edu: 7, enimidi: 8, tommidi: 9, padi: 10,
    iravai: 20,
    ondhu: 1, eradu: 2, mooru: 3, naalku: 4, aidu: 5, aaru: 6, eelu: 7, entu: 8, ombattu: 9, hattu: 10,
    ondru: 1, irandu: 2, moondru: 3, naangu: 4, ainthu: 5, aaru_ta: 6, yezhu: 7, ettu: 8, onpathu: 9, pathu: 10,
  };

  const digitMatch = lower.match(/\b(\d+)\b/);
  if (digitMatch) return parseInt(digitMatch[1], 10);

  for (const [word, val] of Object.entries(WORD_NUMS)) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) return val;
  }
  return null;
}

// ---------------------------------------------------------------------------
// MULTILINGUAL INTENT PATTERNS (Covers all 22 Eighth Schedule Indian Languages + English)
// ---------------------------------------------------------------------------
const INTENT_PATTERNS = {
  ADD_STOCK: [
    // English & Romanized
    /\b(add|adds|adding|put|puts|putting|increase[d]?|restock(?:ed)?|purchase[d]?|receive[d]?)\b/i,
    /\b(jodo|jod\s*do|daalo|dal\s*do|pettu|petti|veyyandi|penchandi|haaki|serisi|serunga|cherkkoo|cherkkuka)\b/i,
    /\b(add\s*cheyyi|add\s*cheyi|stock\s*lo\s*(add|pettu)|add\s*karo|stock\s*mein\s*(daalo|add|jodo)|stock\s*ge\s*haaki|stock\s*la\s*serunga|stock-?il\s*add)\b/i,
    // Telugu
    /(?:స్టాక్\s*లో|స్టాక్|స్టాక్లో)\s*(?:పెట్టు|యాడ్|చేయి|చేయ్|కలుపు|చేర్చు|జోడించండి|జోడించు)/i,
    /(?:యాడ్\s*చేయి|యాడ్\s*చేయ్|స్టాక్లో\s*పెట్టు|జోడించండి|జోడించు)/i,
    /(?:జోడించండి|జోడించు)/i,
    // Hindi & Devanagari (Marathi, Nepali, Konkani, Sanskrit, Maithili, Dogri, Bodo)
    /(?:स्टॉक\s*में|स्टॉक|स्टॉकमध्ये|स्टॉकांत|स्टकमा|स्टकाव|स्टाक)\s*(?:डालो|जोड़ो|जोड़\s*दूँ|जोडू|जोडा|करा|थप्नुहोस्|पाओ|पा|दाजाब|योजयतु|एड)/i,
    /(?:जोड़ो|जोड़\s*दूँ|जोडा|स्टॉकमध्ये\s*जोडा|थप्नुहोस्|योजयतु|दाजाब)/i,
    // Tamil
    /(?:ஸ்டாக்கில்|இருப்பில்)\s*(?:சேர்க்கவும்|சேர்|போடுங்கள்)/i,
    /(?:சேர்க்கவும்|சேர்)/i,
    // Kannada
    /(?:ಸ್ಟಾಕ್ಗೆ|ದಾಸ್ತಾನು)\s*(?:ಸೇರಿಸಿ|ಹಾಕಿ)/i,
    /(?:ಸೇರಿಸಿ|ಹಾಕಿ)/i,
    // Malayalam
    /(?:സ്റ്റോക്കിൽ|സ്റ്റോക്ക്)\s*(?:ചേർക്കൂ|ചേർക്കുക)/i,
    /(?:ചേർക്കൂ|ചേർക്കുക)/i,
    // Bengali & Assamese
    /(?:স্টকে|ষ্টকত)\s*(?:যোগ\s*করো|যোগ\s*কৰক|যোগ\s*করুন)/i,
    /(?:যোগ\s*করো|যোগ\s*কৰক|যোগ\s*করুন)/i,
    // Gujarati
    /(?:સ્ટોકમાં)\s*(?:ઉમેરો|નાખો)/i,
    /(?:ઉમેરો)/i,
    // Punjabi
    /(?:ਸਟਾਕ\s*ਵਿੱਚ)\s*(?:ਪਾ\s*ਦਿਓ|ਪਾਓ|ਜੋੜੋ)/i,
    /(?:ਪਾ\s*ਦਿਓ|ਪਾਓ|ਜੋੜੋ)/i,
    // Urdu, Kashmiri, Sindhi
    /(?:اسٹاک\s*میں|سٹاکس|اسٽاڪ)\s*(?:شامل\s*کریں|تھاوِو|شامل\s*ڪريو)/i,
    /(?:شامل\s*کریں|تھاوِو|شامل\s*ڪريو)/i,
    // Odia
    /(?:ଷ୍ଟକ୍ରେ)\s*(?:ଯୋଡନ୍ତୁ|ରଖନ୍ତୁ)/i,
    /(?:ଯୋଡନ୍ତୁ)/i,
    // Manipuri
    /(?:স্তোক্তা)\s*(?:হাপচিল্লু)/i,
    /(?:হাপচিল্লু)/i,
    // Santali
    /(?:ᱤᱥᱴᱚᱠ\s*ᱨᱮ)\s*(?:ᱡᱩᱲᱟᱹᱭ\s*ᱢᱮ)/i,
    /(?:ᱡᱩᱲᱟᱹᱭ\s*ᱢᱮ)/i,
  ],
  REMOVE_STOCK: [
    /\b(remove[d]?|reduce[d]?|deduct|damage[d]?|kharab|hatao|nikalo|theseyyi|teesey|wastage|expired?)\b/i,
  ],
  SALE: [
    /\b(sell|sold|sale|becho|becha|ammanu|ammeyyi|ammindi|bikri|ichanu|icchanu|ivvu|kodutha|dile)\b/i,
    /(?:అమ్మాను|అమ్మేయి|ఇచ్చాను)/i,
    /(?:बेचा|बेचो|दिए|दिया|विक्री)/i,
    /(?:விற்பனை|விற்றேன்)/i,
    /(?:ಮಾರಾಟ)/i,
    /(?:വിൽപ്പന)/i,
    /(?:বিক্রি)/i,
  ],
  CUSTOMER_PAYMENT: [
    /\b(paid|ichadu|diye|diya|payment|bheja|kodutha|dile)\b.*\b(rupees?|rupaye|rs\.?|₹|రూపాయలు|रुपये|ரூபாய்)\b/i,
    /\b(ne|ki|ko)\b.*\b(\d+)\b.*\b(diye|diya|ichadu|paid|rupaye|rupees)\b/i,
    /(?:ఇచ్చాడు|చెల్లించాడు)/i,
    /(?:भुगतान|दिए|दिया)/i,
  ],
  CHECK_STOCK: [
    /\b(how\s*(much|many)|check|availability|stock\s*entha|entha\s*undi|kitna\s*(hai|bacha|stock)|eshtu\s*ide|evvalavu\s*irukku)\b/i,
    /(?:ఎంత\s*ఉంది|ఎంత|స్టాక్\s*ఎంత)/i,
    /(?:कितना\s*है|कितना\s*स्टॉक|कितना\s*बचा)/i,
    /(?:ಎಷ್ಟು\s*ಇದೆ)/i,
    /(?:எவ்வளவு\s*இருக்கிறது)/i,
    /(?:কত\s*আছে)/i,
  ],
  TODAY_SUMMARY: [
    /\b(today|ee\s*roju|eroju|aaj|inniku|ivatthu|innu)\b.*\b(sales?|bikri|ammalu|report|summary|entha|show|maaratav|aachu)\b/i,
    /\b(sales?\s*report|aaj\s*ki\s*bikri|today\s*sales?)\b/i,
    /(?:ఈరోజు\s*సేల్స్|ఈరోజు\s*రిపోర్ట్|ఈరోజు\s*అమ్మకాలు)/i,
    /(?:आज\s*की\s*बिक्री|आज\s*की\s*सेल)/i,
    /(?:ಇಂದಿನ\s*ಮಾರಾಟ|ಇಂದು\s*ಮಾರಾಟ)/i,
    /(?:இன்றைய\s*விற்பனை)/i,
  ],
  LOW_STOCK: [
    /\b(low\s*stock|takkuva|kam\s*stock|khatam|running\s*low|out\s*of\s*stock|kadime\s*stock|kuraivu)\b/i,
    /(?:తక్కువ\s*స్టాక్)/i,
    /(?:कम\s*स्टॉक)/i,
    /(?:ಕಡಿಮೆ\s*ಸ್ಟಾಕ್)/i,
    /(?:குறைந்த\s*இருப்பு)/i,
    /(?:കുറഞ്ഞ\s*സ്റ്റോക്ക്)/i,
  ],
  CUSTOMER_KHATA: [
    /\b(khata|account|balance|udhaar|khatabook)\b.*\b(chupinchu|dikhao|show|check|batao|entha|kitna|kaattu|torisu)\b/i,
    /\b(show|check|open)\b.*\b(khata|account|balance)\b/i,
    /(?:ఖాతా|ఖాతాలో)/i,
    /(?:खाता|खाते)/i,
  ],
  PROFIT_REPORT: [
    /\b(profit|munafa|labham)\b.*\b(report|entha|kitna|chupinchu|dikhao)\b/i,
  ],
  HELP: [
    /\b(help|sahayam|madad|what\s*can\s*you\s*do|kaise\s*use\s*karein)\b/i,
  ],
};

function detectIntent(lower) {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pat of patterns) {
      if (pat.test(lower)) {
        dbg('Intent matched:', intent);
        return intent;
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// PRODUCT MATCHING (Preserves exact product identity across languages - Section 35)
// ---------------------------------------------------------------------------
const UNIT_RE = /(?<![\p{L}\p{N}])(packets?|packetlu|packettlu|pyaaketlu|kg|kilos?|kilolu|litres?|liters?|ltr|boxes?|bottles?|pieces?|pcs?|packs?|units?|bags?|dozens?|ప్యాకెట్లు|ప్యాకెట్ల|ప్యాకెట్|పాకెట్లను|పాకెట్లు|పాకెట్ల|కిలోలు|కిలో|पैकेटों|पैकेट|पॅकेट|पॅकेट्स|पाकिटां|पाकिटे|पाकीट|किलो|பாக்கெட்டுகளைச்|பாக்கெட்டுகளை|பாக்கெட்டுகள்|பாக்கெட்|கிலோ|প্যাকেটস|প্যাকেট|পেকেট|কিলো|ਪੈਕਟਾਂ|ਪੈਕਟ|ਪੈਕੇਟ|ਕਿਲੋ|પેકેટો|પેકેટ|પેકેટ્સ|કિલો|پیکٹوں|پیکٹ|ପ୍ୟାକେଟ୍|ପ୍ୟାକେଟ|କିଲୋ|പാക്കറ്റുകൾ|പാക്കറ്റുകളെ|പാക്കറ്റ്|കിലോ|ಪ್ಯಾಕೆಟ್ಗಳು|ಪ್ಯಾಕೆಟ್ಗಳನ್ನು|ಪ್ಯಾಕೆಟ್|ಪುಟಕಮ್|पुटकम्)(?![\p{L}\p{N}])/gui;

const COMMON_MULTILINGUAL_WORDS = /(?<![\p{L}\p{N}])(add|adds|adding|put|puts|putting|increase|stock|in|to|of|the|a|an|please|more|new|few|my|our|from|by|lo|mein|ge|la|il|ke|ki|ko|ka|cheyyi|cheyi|pettu|jodo|karo|daalo|serisi|haaki|serunga|cherkkoo|జోడించండి|జోడించు|యాడు|చేయి|పెట్టు|స్టాక్లో|స్టాక్|జోడో|కరో|డాల్లో|जोड़ो|जोडा|डालो|स्टॉक|में|के|की|का|को|சேர்க்கவும்|சேர்|இருப்பில்|சர்க்கவும்|ಸೇರಿಸಿ|ಹಾಕಿ|ಸ್ಟಾಕ್ಗೆ|ದಾಸ್ತಾನು|ചേർക്കൂ|ചേർക്കുക|സ്റ്റോക്കിൽ|സ്റ്റോക്ക്|যোগ|করুন|করো|ষ্টকত|ষ্টক|ઉમેરો|નાખો|સ્ટોકમાં|સ્ટોક|ਜੋੜੋ|ਪਾ|ਦਿਓ|ਪਾਓ|ਸਟਾਕ|ਸਟਾਕਾਂ|شامل|کریں|اسٹاک|سٹاک|ଯୋଡନ୍ତু|ଷ୍ଟକ୍ରੇ|থप्नुहोस्|दाजाब|হাপচিল্লু|ᱡᱩੜᱟᱹᱭ|packets?|kg|litres?|boxes?)(?![\p{L}\p{N}])/gui;

function jaroWinkler(s1, s2) {
  if (s1 === s2) return 1.0;
  const l1 = s1.length, l2 = s2.length;
  if (l1 === 0 || l2 === 0) return 0.0;
  const matchDist = Math.max(Math.floor(Math.max(l1, l2) / 2) - 1, 0);
  const s1m = new Array(l1).fill(false), s2m = new Array(l2).fill(false);
  let matches = 0, transpositions = 0;
  for (let i = 0; i < l1; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, l2);
    for (let j = start; j < end; j++) {
      if (s2m[j] || s1[i] !== s2[j]) continue;
      s1m[i] = true; s2m[j] = true; matches++; break;
    }
  }
  if (matches === 0) return 0.0;
  let k = 0;
  for (let i = 0; i < l1; i++) {
    if (!s1m[i]) continue;
    while (!s2m[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  const jaro = (matches / l1 + matches / l2 + (matches - transpositions / 2) / matches) / 3;
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(l1, l2)); i++) {
    if (s1[i] === s2[i]) prefix++; else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

function matchProductsInText(inputText, products) {
  if (!products || !products.length || !inputText) return [];
  const normalInput = normalizeForMatch(inputText);
  const results = [];

  for (const p of products) {
    let bestScore = 0;
    const candidates = [p.name];
    if (p.aliases && Array.isArray(p.aliases)) candidates.push(...p.aliases);
    const words = p.name.split(/\s+/);
    if (words.length > 2) candidates.push(words.slice(0, 2).join(' '));

    for (const candidate of candidates) {
      const nc = normalizeForMatch(candidate);
      if (normalInput === nc) { bestScore = Math.max(bestScore, 1.0); break; }
      if (normalInput.includes(nc)) {
        bestScore = Math.max(bestScore, 0.78 + Math.min(nc.length / Math.max(normalInput.length, 1), 0.21));
      }
      if (nc.includes(normalInput)) {
        bestScore = Math.max(bestScore, 0.60 + Math.min((normalInput.length / Math.max(nc.length, 1)) * 0.35, 0.35));
      }
      const candWords = nc.split(/\s+/).filter(w => w.length > 2);
      if (candWords.length > 0) {
        const found = candWords.filter(w => normalInput.includes(w));
        const ws = found.length / candWords.length;
        if (ws >= 0.5) bestScore = Math.max(bestScore, 0.50 + ws * 0.40);
      }
      const jw = jaroWinkler(normalInput, nc);
      if (jw > 0.80) bestScore = Math.max(bestScore, jw * 0.82);
    }

    if (bestScore > 0.35) results.push({ product: p, score: bestScore });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

function extractProductCandidate(text) {
  const digitsNormalized = normalizeIndianDigits(text);
  let cleaned = digitsNormalized
    .replace(UNIT_RE, ' ')
    .replace(COMMON_MULTILINGUAL_WORDS, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Clean remaining small particles
  cleaned = cleaned.replace(/(?<![\p{L}\p{N}])(ke|ki|ko|ka|lo|ge|la|il|me|di|de|da|ra|ৰ|ৰা|के|की|का|को|చే|ను|ని|కి|తో|లు|ల|च्या|चे|ची)(?![\p{L}\p{N}])/gui, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || '';
}

// ---------------------------------------------------------------------------
// MAIN MULTILINGUAL PARSER
// ---------------------------------------------------------------------------
export const parseNaturalVoiceCommand = (rawText, languageHint = 'auto', products = []) => {
  if (!rawText || !rawText.trim()) {
    return {
      success: false,
      rawText: '',
      normalizedText: '',
      language: 'en',
      intent: 'UNKNOWN',
      confidence: 0,
      entities: {},
      message: "Please speak or type a command.",
      response: "Please speak or type a command.",
      requiresConfirmation: false,
      status: 'UNKNOWN',
    };
  }

  const originalText = rawText.trim();
  const digitsNormalized = normalizeIndianDigits(originalText);
  const normalizedText = normalizeText(digitsNormalized);
  const lower = normalizedText.toLowerCase();

  // Language & script detection
  const detectedDetails = detectLanguageDetails(originalText);
  const langCode = (languageHint && languageHint !== 'auto') ? languageHint : detectedDetails.shortCode;
  const canonicalCode = detectedDetails.code;
  const actionButtons = getLocalizedActionButtons(canonicalCode);

  dbg('Multilingual Input:', originalText);
  dbg('Detected Language:', detectedDetails.name, `(${langCode})`, 'Conf:', detectedDetails.confidence);

  // =========================================================================
  // STEP A: Multi-turn Follow-Up Resolution
  // =========================================================================
  const pending = activeConversationContext.awaitingFollowUp;

  if (pending) {
    // 1. Confirm / Yes
    if (isAffirmative(lower)) {
      clearConversationContext();
      return {
        success: true,
        rawText: originalText,
        normalizedText,
        language: langCode,
        languageName: detectedDetails.name,
        intent: pending.intent || 'ADD_STOCK',
        action: formatActionName(pending.intent || 'ADD_STOCK'),
        confidence: 0.98,
        product: pending.product,
        productId: pending.productId,
        quantity: pending.quantity,
        unit: pending.unit,
        customer: pending.customer,
        amount: pending.amount,
        entities: {
          product: pending.product,
          productId: pending.productId,
          quantity: pending.quantity,
          unit: pending.unit,
          customer: pending.customer,
          amount: pending.amount,
        },
        requiresConfirmation: false,
        executed: true,
        response: `Done! 👍 Confirmed.`,
        message: `Done! 👍 Confirmed.`,
        actionButtons,
        status: 'EXECUTED',
      };
    }

    // 2. Deny / Cancel
    if (isNegative(lower)) {
      clearConversationContext();
      return {
        success: true,
        cancelled: true,
        rawText: originalText,
        normalizedText,
        language: langCode,
        intent: 'CANCEL',
        action: 'Cancelled',
        confidence: 0.99,
        entities: {},
        response: 'Action cancelled.',
        message: 'Action cancelled.',
        requiresConfirmation: false,
        actionButtons,
        status: 'CANCELLED',
      };
    }

    // 3. User provides missing quantity
    if (pending.missingField === 'quantity') {
      const q = parseQuantity(lower);
      if (q !== null && q > 0) {
        const unit = resolveUnit(lower, pending.unit || 'packets');
        const prod = pending.product || activeConversationContext.lastProduct || 'Item';
        const entities = { product: prod, productId: pending.productId, quantity: q, unit };

        setConversationContext({ lastProduct: prod, lastQuantity: q, lastUnit: unit });
        activeConversationContext.awaitingFollowUp = { intent: pending.intent, missingField: 'confirm', ...entities };

        const prompt = generateFriendlyResponse(pending.intent, entities, langCode);
        return {
          success: true,
          rawText: originalText,
          normalizedText,
          language: langCode,
          languageName: detectedDetails.name,
          intent: pending.intent,
          action: formatActionName(pending.intent),
          confidence: 0.95,
          product: prod,
          productId: pending.productId,
          quantity: q,
          unit,
          entities,
          response: prompt,
          message: prompt,
          requiresConfirmation: true,
          resolvedFromFollowUp: true,
          actionButtons,
          status: 'AWAITING_CONFIRMATION',
        };
      }
    }

    // 4. User provides missing product
    if (pending.missingField === 'product') {
      const candidate = extractProductCandidate(normalizedText) || normalizedText;
      const matches = matchProductsInText(candidate, products);
      const top = matches[0];
      const prodObj = (top && top.score > 0.35) ? top.product : { name: titleCase(candidate), id: null, unit: 'packets' };

      if (prodObj.name) {
        setConversationContext({ lastProduct: prodObj.name, lastProductId: prodObj.id });
        const qty = pending.quantity;
        const unit = resolveUnit(lower, prodObj.unit || pending.unit || 'packets');

        if (qty) {
          const entities = { product: prodObj.name, productId: prodObj.id, quantity: qty, unit };
          activeConversationContext.awaitingFollowUp = { intent: pending.intent, missingField: 'confirm', ...entities };
          const prompt = generateFriendlyResponse(pending.intent, entities, langCode);
          return {
            success: true,
            rawText: originalText,
            normalizedText,
            language: langCode,
            languageName: detectedDetails.name,
            intent: pending.intent,
            action: formatActionName(pending.intent),
            confidence: 0.94,
            product: prodObj.name,
            productId: prodObj.id,
            quantity: qty,
            unit,
            entities,
            response: prompt,
            message: prompt,
            requiresConfirmation: true,
            resolvedFromFollowUp: true,
            actionButtons,
            status: 'AWAITING_CONFIRMATION',
          };
        } else {
          activeConversationContext.awaitingFollowUp = { intent: pending.intent, missingField: 'quantity', product: prodObj.name, productId: prodObj.id, unit };
          const question = generateFollowUpQuestion('quantity', { product: prodObj.name }, langCode);
          return {
            success: true,
            rawText: originalText,
            normalizedText,
            language: langCode,
            languageName: detectedDetails.name,
            intent: pending.intent,
            requiresFollowUp: true,
            missingField: 'quantity',
            followUpQuestion: question,
            response: question,
            message: question,
            confidence: 0.88,
            entities: { product: prodObj.name, productId: prodObj.id },
            requiresConfirmation: false,
            actionButtons,
            status: 'AWAITING_INPUT',
          };
        }
      }
    }
  }

  // =========================================================================
  // STEP B: Detect intent
  // =========================================================================
  const intent = detectIntent(lower);
  dbg('Detected intent:', intent);

  // =========================================================================
  // STEP C: Simple Informational Intents
  // =========================================================================
  if (intent === 'TODAY_SUMMARY') {
    const fr = generateFriendlyResponse('TODAY_SUMMARY', {}, langCode);
    return {
      success: true, rawText: originalText, normalizedText, language: langCode, languageName: detectedDetails.name,
      intent: 'TODAY_SALES', action: 'Show Today Sales', confidence: 0.98,
      entities: {}, response: fr, message: fr, requiresConfirmation: false, actionButtons, status: 'READY',
    };
  }

  if (intent === 'LOW_STOCK') {
    const fr = generateFriendlyResponse('LOW_STOCK', {}, langCode);
    return {
      success: true, rawText: originalText, normalizedText, language: langCode, languageName: detectedDetails.name,
      intent: 'LOW_STOCK', action: 'Show Low Stock Items', confidence: 0.96,
      entities: {}, response: fr, message: fr, requiresConfirmation: false, actionButtons, status: 'READY',
    };
  }

  if (intent === 'HELP') {
    const fr = "Speak naturally in your language! Example: 'Heritage Milk 20 packets add cheyyi' or 'Today sales'.";
    return {
      success: true, rawText: originalText, normalizedText, language: langCode, languageName: detectedDetails.name,
      intent: 'HELP', action: 'Voice Help', confidence: 0.99,
      entities: {}, response: fr, message: fr, requiresConfirmation: false, actionButtons, status: 'READY',
    };
  }

  if (intent === 'CUSTOMER_PAYMENT') {
    const custMatch = normalizedText.match(/([a-zA-Z\u0900-\u0D7F]+)\s+(?:paid|ne|ichadu|diye|diya|kodutha)?\s*(?:rs\.?|rupees|rupaye|రూపాయలు|रुपये|₹)?\s*(\d+)/i);
    const customer = custMatch ? titleCase(custMatch[1].replace(/\b(ne|ki|ko|gaariki|kku|ge)\b/i, '').trim()) : 'Customer';
    const amount = custMatch ? parseInt(custMatch[2], 10) : (parseQuantity(lower) || 500);
    const entities = { customer, amount, currency: 'INR' };
    setConversationContext({ lastCustomer: customer });
    const fr = generateFriendlyResponse('CUSTOMER_PAYMENT', entities, langCode);
    activeConversationContext.awaitingFollowUp = { intent: 'CUSTOMER_PAYMENT', missingField: 'confirm', ...entities };
    return {
      success: true, rawText: originalText, normalizedText, language: langCode, languageName: detectedDetails.name,
      intent: 'CUSTOMER_PAYMENT', action: 'Record Customer Payment', confidence: 0.95,
      customer, amount, entities, response: fr, message: fr, requiresConfirmation: true, actionButtons, status: 'AWAITING_CONFIRMATION',
    };
  }

  if (intent === 'CUSTOMER_KHATA') {
    const custMatch = normalizedText.match(/([a-zA-Z\u0900-\u0D7F]+)\s*(?:ki|ko|ku|gariki|ka)?\s*(?:khata|account|balance|ఖాతా|खाता)/i) ||
                      normalizedText.match(/(?:show|check|open)\s+([a-zA-Z\u0900-\u0D7F]+)(?:'s)?\s*(?:khata|account)/i);
    const customer = custMatch ? titleCase(custMatch[1].replace(/khata|account|ఖాతా|खाता/i, '').trim()) : 'Customer';
    setConversationContext({ lastCustomer: customer });
    const fr = generateFriendlyResponse('CUSTOMER_KHATA', { customer }, langCode);
    return {
      success: true, rawText: originalText, normalizedText, language: langCode, languageName: detectedDetails.name,
      intent: 'CUSTOMER_KHATA', action: 'Show Customer Khata', confidence: 0.95,
      customer, entities: { customer }, response: fr, message: fr, requiresConfirmation: false, actionButtons, status: 'READY',
    };
  }

  if (intent === 'CHECK_STOCK') {
    const candidate = extractProductCandidate(normalizedText);
    const matches = matchProductsInText(candidate || normalizedText, products);
    const top = matches[0];
    const prodName = (top && top.score > 0.35) ? top.product.name : (candidate ? titleCase(candidate) : 'this item');
    const prodId = (top && top.score > 0.35) ? top.product.id : null;
    if (prodName && prodName !== 'Item') setConversationContext({ lastProduct: prodName, lastProductId: prodId });
    const fr = generateFriendlyResponse('CHECK_STOCK', { product: prodName }, langCode);
    return {
      success: true, rawText: originalText, normalizedText, language: langCode, languageName: detectedDetails.name,
      intent: 'CHECK_STOCK', action: 'Check Stock', confidence: 0.95,
      product: prodName, productId: prodId, entities: { product: prodName, productId: prodId },
      response: fr, message: fr, requiresConfirmation: false, actionButtons, status: 'READY',
    };
  }

  // =========================================================================
  // STEP D: ADD_STOCK / SALE / REMOVE_STOCK with Product & Quantity
  // =========================================================================
  if (intent === 'ADD_STOCK' || intent === 'SALE' || intent === 'REMOVE_STOCK') {
    const qty = parseQuantity(lower);
    const unitRawMatches = lower.match(UNIT_RE);
    const rawUnit = unitRawMatches ? unitRawMatches[0] : '';
    const candidate = extractProductCandidate(normalizedText);

    dbg('Extracted Qty:', qty, 'Candidate:', candidate);

    let matchedProduct = null;
    let matchedProductObj = null;

    if (products.length > 0) {
      let matches = matchProductsInText(normalizedText, products);
      if (!matches.length || matches[0].score < 0.38) {
        matches = matchProductsInText(candidate, products);
      }
      if (matches.length > 0 && matches[0].score > 0.35) {
        matchedProductObj = matches[0].product;
        matchedProduct = matches[0].product.name;
      }
    }

    // Fallback to candidate string if no DB product matched directly
    if (!matchedProduct && candidate) {
      matchedProduct = titleCase(candidate);
      matchedProductObj = { name: matchedProduct, id: null, unit: 'packets' };
    }

    const unit = resolveUnit(rawUnit, matchedProductObj?.unit || 'packets');

    // Case 1: Complete command (Product + Qty)
    if (matchedProduct && qty !== null && qty > 0) {
      setConversationContext({
        lastProduct: matchedProduct,
        lastProductId: matchedProductObj?.id || null,
        lastQuantity: qty,
        lastUnit: unit,
      });

      const entities = {
        product: matchedProduct,
        productId: matchedProductObj?.id || null,
        quantity: qty,
        unit,
      };

      if (intent === 'SALE') {
        const custMatch = normalizedText.match(/([a-zA-Z\u0900-\u0D7F]+)\s*(?:ki|ko|ku|kku|ge|gariki)/i);
        if (custMatch) {
          entities.customer = titleCase(custMatch[1]);
          setConversationContext({ lastCustomer: entities.customer });
        }
        entities.paymentMethod = lower.includes('credit') || lower.includes('udhaar') || lower.includes('khata') ? 'Credit' : 'Cash';
      }

      activeConversationContext.awaitingFollowUp = { intent, missingField: 'confirm', ...entities };
      const prompt = generateFriendlyResponse(intent, entities, langCode);

      return {
        success: true,
        rawText: originalText,
        normalizedText,
        language: langCode,
        languageName: detectedDetails.name,
        intent,
        action: formatActionName(intent),
        confidence: 0.96,
        product: matchedProduct,
        productId: matchedProductObj?.id || null,
        quantity: qty,
        unit,
        customer: entities.customer || null,
        paymentMethod: entities.paymentMethod || null,
        entities,
        response: prompt,
        message: prompt,
        requiresConfirmation: true,
        executed: false,
        actionButtons,
        status: 'AWAITING_CONFIRMATION',
      };
    }

    // Case 2: Product found, but Missing Quantity
    if (matchedProduct && (qty === null || qty <= 0)) {
      setConversationContext({ lastProduct: matchedProduct, lastProductId: matchedProductObj?.id || null });
      activeConversationContext.awaitingFollowUp = { intent, missingField: 'quantity', product: matchedProduct, productId: matchedProductObj?.id || null, unit };
      const question = generateFollowUpQuestion('quantity', { product: matchedProduct }, langCode);

      return {
        success: true,
        rawText: originalText,
        normalizedText,
        language: langCode,
        languageName: detectedDetails.name,
        intent,
        action: formatActionName(intent),
        requiresFollowUp: true,
        missingField: 'quantity',
        followUpQuestion: question,
        response: question,
        message: question,
        confidence: 0.88,
        product: matchedProduct,
        productId: matchedProductObj?.id || null,
        entities: { product: matchedProduct, productId: matchedProductObj?.id || null },
        requiresConfirmation: false,
        actionButtons,
        status: 'AWAITING_INPUT',
      };
    }

    // Case 3: Quantity found, but Missing Product
    if (!matchedProduct && qty !== null && qty > 0) {
      activeConversationContext.awaitingFollowUp = { intent, missingField: 'product', quantity: qty, unit };
      const question = generateFollowUpQuestion('product', {}, langCode);

      return {
        success: true,
        rawText: originalText,
        normalizedText,
        language: langCode,
        languageName: detectedDetails.name,
        intent,
        action: formatActionName(intent),
        requiresFollowUp: true,
        missingField: 'product',
        followUpQuestion: question,
        response: question,
        message: question,
        confidence: 0.82,
        quantity: qty,
        unit,
        entities: { quantity: qty, unit },
        requiresConfirmation: false,
        actionButtons,
        status: 'AWAITING_INPUT',
      };
    }
  }

  // =========================================================================
  // STEP E: Contextual follow-up ("Add 20 more", "ఇంకా 20 పెట్టు")
  // =========================================================================
  const ctxQtyMatch = lower.match(/^(?:add|plus|inko|aur|inka)?\s*(\d+)\s*(more|packets?|kg|units?|litres?)?\s*(?:add|more|please|pettu|jodo)?\s*$/i);
  if (ctxQtyMatch && activeConversationContext.lastProduct) {
    const qty = parseInt(ctxQtyMatch[1], 10);
    const unit = resolveUnit(ctxQtyMatch[2] || activeConversationContext.lastUnit || '', 'packets');
    const entities = {
      product: activeConversationContext.lastProduct,
      productId: activeConversationContext.lastProductId,
      quantity: qty,
      unit,
    };
    activeConversationContext.awaitingFollowUp = { intent: 'ADD_STOCK', missingField: 'confirm', ...entities };
    setConversationContext({ lastQuantity: qty, lastUnit: unit });
    const prompt = generateFriendlyResponse('ADD_STOCK', entities, langCode);

    return {
      success: true,
      rawText: originalText,
      normalizedText,
      language: langCode,
      languageName: detectedDetails.name,
      intent: 'ADD_STOCK',
      action: 'Add Stock',
      confidence: 0.95,
      product: entities.product,
      productId: entities.productId,
      quantity: qty,
      unit,
      entities,
      response: prompt,
      message: prompt,
      requiresConfirmation: true,
      contextApplied: true,
      actionButtons,
      status: 'AWAITING_CONFIRMATION',
    };
  }

  // =========================================================================
  // STEP F: Fallback / Unknown
  // =========================================================================
  return {
    success: false,
    rawText: originalText,
    normalizedText,
    language: langCode,
    languageName: detectedDetails.name,
    intent: 'UNKNOWN',
    confidence: 0.35,
    entities: {},
    response: "I didn't quite understand that. Try speaking naturally in your language, e.g., 'Heritage Milk 20 packets add cheyyi' or 'Show today sales'.",
    message: "I didn't quite understand that. Try speaking naturally in your language, e.g., 'Heritage Milk 20 packets add cheyyi' or 'Show today sales'.",
    requiresConfirmation: false,
    actionButtons,
    status: 'UNKNOWN',
  };
};

function isAffirmative(lower) {
  return /^(yes|yeah|yep|correct|ha|haan|avunu|kavale|sare|theek|ho|hou|shuru|proceed|confirm|done|hloy|hlo|ঠিক|ಹೌದು|ஆம்|அതെ|होయ్|అవును)\b/i.test(lower) ||
         lower.includes('avunu') || lower.includes('haan') || lower.includes('yes') || lower.includes('సరే') || lower.includes('హೌದು');
}

function isNegative(lower) {
  return /^(no|nope|cancel|vద్దు|vaddu|nahi|na|nakko|beda|venda|naa|bada|రద్దు|వద్దు|nahin|বাতিল|ರದ್ದು|ரத்து)\b/i.test(lower) ||
         lower.includes('vaddu') || lower.includes('cancel') || lower.includes('nahi') || lower.includes('రద్దు');
}

function formatActionName(intent) {
  switch (intent) {
    case 'ADD_STOCK': return 'Add Stock';
    case 'REMOVE_STOCK': return 'Remove Stock';
    case 'SALE': return 'Record Sale';
    case 'CHECK_STOCK': return 'Check Stock';
    case 'CUSTOMER_PAYMENT': return 'Record Payment';
    case 'CUSTOMER_KHATA': return 'Open Khata';
    case 'TODAY_SALES': return 'Today Sales';
    case 'LOW_STOCK': return 'Low Stock';
    default: return 'Voice Action';
  }
}

export default {
  parseNaturalVoiceCommand,
  getConversationContext,
  setConversationContext,
  clearConversationContext,
};
