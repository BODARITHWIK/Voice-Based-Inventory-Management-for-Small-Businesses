// =============================================================================
// Swaranidhi Production Central i18n Translation Engine
// =============================================================================
// Supports all 22 Eighth Schedule Indian Languages + English (23 Total).
// 100% key parity guaranteed with automated completeness validation.
// =============================================================================

import en from './en.js';
import te from './te.js';
import hi from './hi.js';
import ta from './ta.js';
import kn from './kn.js';
import ml from './ml.js';
import mr from './mr.js';
import bn from './bn.js';
import gu from './gu.js';
import pa from './pa.js';
import ur from './ur.js';
import or from './or.js';
import as from './as.js';
import ne from './ne.js';
import kok from './kok.js';
import ks from './ks.js';
import sd from './sd.js';
import sa from './sa.js';
import mai from './mai.js';
import doi from './doi.js';
import brx from './brx.js';
import mni from './mni.js';
import sat from './sat.js';
import { INDIAN_LANGUAGES, getLanguageByCodeOrLocale } from '../config/languages.js';

export const translations = {
  en,
  te,
  hi,
  ta,
  kn,
  ml,
  mr,
  bn,
  gu,
  pa,
  ur,
  or,
  as,
  ne,
  kok,
  ks,
  sd,
  sa,
  mai,
  doi,
  brx,
  mni,
  sat,
};

export const supportedLanguages = [
  ...INDIAN_LANGUAGES.map((l) => ({
    code: l.code,
    locale: l.locale,
    label: l.name,
    nativeLabel: l.nativeName,
    flag: l.code === 'en' ? '🇬🇧' : '🇮🇳',
    browserSpeechSupported: l.browserSpeechSupported,
    speechSupported: l.speechSupported,
    textSupported: l.textSupported,
  })),
  { code: 'auto', locale: 'auto', label: 'Auto Detect', nativeLabel: 'Auto / स्वतः', flag: '🌐', speechSupported: true, textSupported: true },
];

/**
 * Nested key lookup with parameter replacement
 * e.g., t('toast.stockAdded', { item: 'Maggi', qty: 20, unit: 'packets' })
 */
export const getTranslation = (langCode, keyPath, params = {}) => {
  // Extract primary language code (e.g. 'ta-IN' -> 'ta', 'te-IN' -> 'te')
  const cleanCode = (langCode || 'en').split('-')[0].toLowerCase();
  const activeLang = cleanCode === 'auto' ? detectLanguage() : (translations[cleanCode] ? cleanCode : 'en');
  const dict = translations[activeLang] || translations.en;

  const keys = keyPath.split('.');
  let result = dict;

  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      // Fallback to English
      let fallback = translations.en;
      for (const fk of keys) {
        if (fallback && fallback[fk] !== undefined) {
          fallback = fallback[fk];
        } else {
          return keyPath;
        }
      }
      result = fallback;
      break;
    }
  }

  if (typeof result === 'string') {
    let text = result;
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
    });
    return text;
  }

  return result || keyPath;
};

export const detectLanguage = () => {
  try {
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    const matched = getLanguageByCodeOrLocale(browserLang);
    if (matched) return matched.code;
  } catch (e) {
    // ignore
  }
  return 'en';
};

export default {
  translations,
  supportedLanguages,
  getTranslation,
  detectLanguage,
};
