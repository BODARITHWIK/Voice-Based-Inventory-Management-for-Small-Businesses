import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, detectLanguage, supportedLanguages } from '../i18n';
import { INDIAN_LANGUAGES, getLanguageByCode } from '../services/indianLanguages';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Layer 1: UI Language
  const [uiLanguage, setUiLanguageState] = useState(() => {
    try {
      return localStorage.getItem('swaranidhi_ui_language') || localStorage.getItem('swaranidhi_language') || 'en';
    } catch (e) {
      return 'en';
    }
  });

  // Layer 2: Speech & Text Input Understanding Language
  const [inputLanguage, setInputLanguageState] = useState(() => {
    try {
      return localStorage.getItem('swaranidhi_input_language') || 'auto';
    } catch (e) {
      return 'auto';
    }
  });

  // Layer 3: System Response Language
  const [responseLanguage, setResponseLanguageState] = useState(() => {
    try {
      return localStorage.getItem('swaranidhi_response_language') || 'same_as_input';
    } catch (e) {
      return 'same_as_input';
    }
  });

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

  // UI Effective Language
  const effectiveLang = uiLanguage === 'auto' ? detectLanguage() : (uiLanguage.split('-')[0] || 'en');

  // Persistence helpers
  const setUiLanguage = (lang) => {
    setUiLanguageState(lang);
    try {
      localStorage.setItem('swaranidhi_ui_language', lang);
      localStorage.setItem('swaranidhi_language', lang);
    } catch (e) {}
  };

  const setInputLanguage = (lang) => {
    setInputLanguageState(lang);
    try {
      localStorage.setItem('swaranidhi_input_language', lang);
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

  // BCP 47 Speech Recognition / Synthesis language code
  const getSpeechLangCode = (overrideLang = null) => {
    const target = overrideLang || inputLanguage;
    if (target === 'auto') {
      const langObj = getLanguageByCode(effectiveLang);
      return langObj ? langObj.code : 'en-IN';
    }
    const langObj = getLanguageByCode(target);
    return langObj ? langObj.code : 'en-IN';
  };

  return (
    <LanguageContext.Provider
      value={{
        // 3 Independent Layers
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

        // Backward compatibility
        language: uiLanguage,
        effectiveLang,
        setLanguage,
        t,
        supportedLanguages,
        indianLanguages: INDIAN_LANGUAGES,
        getSpeechLangCode,
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

export const useTranslation = () => {
  const { t, effectiveLang, language, setLanguage } = useLanguage();
  return { t, effectiveLang, language, setLanguage };
};

export default LanguageContext;
