'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

// The reader's interface language, 'en' or 'km', remembered in this browser.
// It starts as 'en' on every load and switches once the saved choice is read:
// the server cannot see localStorage, and starting from the saved value would
// make the server's HTML and the browser's first render disagree.
export default function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('archive_language');
      if (stored === 'km' || stored === 'en') setLanguage(stored);
    } catch {}
  }, []);

  // <html lang> follows the toggle, so screen readers pronounce the page in
  // the right language and the browser picks Khmer-aware line breaking.
  useEffect(() => {
    document.documentElement.lang = language === 'km' ? 'km' : 'en';
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'km' : 'en';
      try { localStorage.setItem('archive_language', next); } catch {}
      return next;
    });
  }, []);

  // t({ en: 'Home', km: 'ទំព័រដើម' }) gives the text for the current mode. The
  // pair lives next to where it is used, so a label and its translation are
  // always reviewed together. A plain string passes through unchanged.
  const t = useCallback((pair) => {
    if (pair == null) return '';
    if (typeof pair === 'string') return pair;
    return pair[language] ?? pair.en ?? '';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
