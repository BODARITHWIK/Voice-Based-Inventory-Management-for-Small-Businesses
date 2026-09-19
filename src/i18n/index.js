import en from './en';
import te from './te';
import hi from './hi';

export const translations = {
  en,
  te,
  hi,
};

export const supportedLanguages = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'auto', label: 'Auto Detect', nativeLabel: 'ఆటో / स्वतः', flag: '🌐' },
];

/**
 * Nested key lookup with parameter replacement
 * e.g., t('toast.stockAdded', { item: 'Maggi', qty: 20, unit: 'packets' })
 */
export const getTranslation = (langCode, keyPath, params = {}) => {
  const activeLang = langCode === 'auto' ? detectLanguage() : (translations[langCode] ? langCode : 'en');
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
    if (browserLang.startsWith('te')) return 'te';
    if (browserLang.startsWith('hi')) return 'hi';
  } catch (e) {
    // ignore
  }
  return 'en';
};
