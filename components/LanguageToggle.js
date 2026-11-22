'use client';
import { useLanguage } from './LanguageProvider';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button
      type="button"
      className="site-nav-lang-toggle"
      onClick={toggleLanguage}
      title={language === 'en' ? 'Switch to Khmer (ប្តូរទៅភាសាខ្មែរ)' : 'Switch to English (ប្តូរទៅភាសាអង់គ្លេស)'}
      aria-label="Toggle language"
    >
      <span className="site-nav-lang-label">
        {language === 'en' ? 'KH' : 'EN'}
      </span>
    </button>
  );
}