import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectLanguage, t as translateFn, LANGUAGE_NAMES } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => detectLanguage());

  const setLang = (newLang) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('medleb-lang', newLang);
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = (key) => translateFn(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGE_NAMES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
