import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INDIAN_LANGUAGES, getTranslation } from '../i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [locale, setLocaleState] = useState('en-IN');

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('@user_language');
      if (savedLang) {
        setLanguageState(savedLang);
        const match = INDIAN_LANGUAGES.find((l) => l.code === savedLang);
        if (match) setLocaleState(match.locale);
      }
    } catch (e) {
      console.warn('Failed to load language', e);
    }
  };

  const setLanguage = async (langCode) => {
    try {
      setLanguageState(langCode);
      const match = INDIAN_LANGUAGES.find((l) => l.code === langCode);
      if (match) setLocaleState(match.locale);
      await AsyncStorage.setItem('@user_language', langCode);
    } catch (e) {
      console.warn('Failed to set language', e);
    }
  };

  const t = (key, params = {}) => {
    return getTranslation(language, key, params);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        locale,
        setLanguage,
        t,
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
