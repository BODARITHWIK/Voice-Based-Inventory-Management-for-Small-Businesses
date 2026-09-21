import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, detectLanguage, supportedLanguages } from '../i18n';
import {
  INDIAN_LANGUAGES,
  getLanguageByCodeOrLocale,
  getLanguageLocale,
  getLanguageCode,
} from '../config/languages';
import axios from 'axios';
import { resolveApiBaseUrl } from '../services/api';

const BASE_URL = resolveApiBaseUrl();
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Layer 1: UI Language Code (e.g. 'ta', 'te', 'hi', 'en')
  const [uiLanguage, setUiLanguageState] = useState(() => {
    try {
      return (
        localStorage.getItem('swaranidhi_ui_language') ||
        localStorage.getItem('swaranidhi_language') ||
        'en'
      );
    } catch (e) {
      return 'en';
    }
  });

  // Layer 2: Selected Exact Locale (e.g. 'ta-IN', 'kn-IN', 'hi-IN', 'en-IN')
  const [selectedLocale, setSelectedLocaleState] = useState(() => {
    try {
      const savedLocale = localStorage.getItem('swaranidhi_locale');
      if (savedLocale) return savedLocale;
      const savedLang = localStorage.getItem('swaranidhi_ui_language') || 'en';
      return getLanguageLocale(savedLang);
    } catch (e) {
      return 'en-IN';
    }
  });

  // Layer 3: Speech & Text Input Understanding Language (locale or 'auto')
  const [inputLanguage, setInputLanguageState] = useState(() => {
    try {
      return localStorage.getItem('swaranidhi_input_language') || 'auto';
    } catch (e) {
      return 'auto';
    }
  });

  // Layer 4: System Response Language
  const [responseLanguage, setResponseLanguageState] = useState(() => {
    try {
      return localStorage.getItem('swaranidhi_response_language') || 'same_as_input';
    } catch (e) {
      return 'same_as_input';
    }
  });

  // Cloud/Backend Language Capabilities
  const [backendCapabilities, setBackendCapabilities] = useState([]);

  // Voice & AI Config
  const [voiceResponseEnabled, setVoiceResponseEnabled] = useState(() => {
    return localStorage.getItem('swaranidhi_voice_response') !== 'false';
  });

  const [mixedLanguageEnabled, setMixedLanguageEnabled] = useState(() => {
    return localStorage.getItem('swaranidhi_mixed_lang') !== 'false';
  });

  const [languageConfirmationEnabled, setLanguageConfirmationEnabled] = useState(() => {
    return localStorage.getItem('swaranidhi_lang_confirm') !== 'false';
  });

  const [developerMode, setDeveloperMode] = useState(() => {
    return localStorage.getItem('swaranidhi_dev_mode') === 'true';
  });

  // Load backend capabilities on mount
  useEffect(() => {
    const loadBackendCapabilities = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/voice/languages`, { timeout: 3000 });
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          setBackendCapabilities(list);
        }
      } catch (e) {
        // Backend offline — rely on local browser capability declarations
      }
    };
    loadBackendCapabilities();
  }, []);

  // UI Effective Language Code for Translations
  const effectiveLang = uiLanguage === 'auto' ? detectLanguage() : getLanguageCode(uiLanguage);

  // Persistence helpers
  const setUiLanguage = (langCodeOrLocale) => {
    const code = getLanguageCode(langCodeOrLocale);
    const locale = getLanguageLocale(langCodeOrLocale);
    setUiLanguageState(code);
    setSelectedLocaleState(locale);
    try {
      localStorage.setItem('swaranidhi_ui_language', code);
      localStorage.setItem('swaranidhi_language', code);
      localStorage.setItem('swaranidhi_locale', locale);
    } catch (e) {}
  };

  const setSelectedLanguageAndLocale = (code, locale) => {
    const safeCode = code || getLanguageCode(locale);
    const safeLocale = locale || getLanguageLocale(code);
    setUiLanguageState(safeCode);
    setSelectedLocaleState(safeLocale);
    setInputLanguageState(safeLocale);
    try {
      localStorage.setItem('swaranidhi_ui_language', safeCode);
      localStorage.setItem('swaranidhi_language', safeCode);
      localStorage.setItem('swaranidhi_locale', safeLocale);
      localStorage.setItem('swaranidhi_input_language', safeLocale);
    } catch (e) {}
  };

  const setInputLanguage = (localeOrAuto) => {
    setInputLanguageState(localeOrAuto);
    try {
      localStorage.setItem('swaranidhi_input_language', localeOrAuto);
    } catch (e) {}
  };

  const setResponseLanguage = (lang) => {
    setResponseLanguageState(lang);
    try {
      localStorage.setItem('swaranidhi_response_language', lang);
    } catch (e) {}
  };

  const toggleVoiceResponse = () => {
    setVoiceResponseEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('swaranidhi_voice_response', String(next));
      return next;
    });
  };

  const toggleMixedLanguage = () => {
    setMixedLanguageEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('swaranidhi_mixed_lang', String(next));
      return next;
    });
  };

  const toggleLanguageConfirmation = () => {
    setLanguageConfirmationEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('swaranidhi_lang_confirm', String(next));
      return next;
    });
  };

  const toggleDeveloperMode = () => {
    setDeveloperMode((prev) => {
      const next = !prev;
      localStorage.setItem('swaranidhi_dev_mode', String(next));
      return next;
    });
  };

  // Backwards compatibility for components calling setLanguage
  const setLanguage = (newLang) => {
    setUiLanguage(newLang);
  };

  const t = (keyPath, params = {}) => {
    return getTranslation(effectiveLang, keyPath, params);
  };

  // Resolve dynamic BCP-47 Speech Recognition locale
  const getSpeechLangCode = (overrideLocaleOrCode = null) => {
    if (overrideLocaleOrCode && overrideLocaleOrCode !== 'auto') {
      return getLanguageLocale(overrideLocaleOrCode);
    }
    if (inputLanguage && inputLanguage !== 'auto') {
      return getLanguageLocale(inputLanguage);
    }
    return selectedLocale || getLanguageLocale(effectiveLang);
  };

  return (
    <LanguageContext.Provider
      value={{
        // Core Selection State
        selectedLanguage: effectiveLang,
        selectedLocale,
        setSelectedLanguageAndLocale,

        // Layers
        uiLanguage,
        setUiLanguage,
        inputLanguage,
        setInputLanguage,
        responseLanguage,
        setResponseLanguage,

        // Voice & AI Config
        voiceResponseEnabled,
        toggleVoiceResponse,
        mixedLanguageEnabled,
        toggleMixedLanguage,
        languageConfirmationEnabled,
        toggleLanguageConfirmation,
        developerMode,
        toggleDeveloperMode,

        // Backend capabilities
        backendCapabilities,

        // Helpers
        effectiveLang,
        setLanguage,
        t,
        getSpeechLangCode,
        supportedLanguages,
        indianLanguages: INDIAN_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
