'use client';

import { useLanguage } from './LanguageProvider';

// [ EN | KH ] with a pill that slides behind the current language. The
// tooltip and accessible name stay bilingual on purpose: someone who cannot
// read the current language must still find the way back to theirs.
export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const isKhmer = language === 'km';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isKhmer}
      aria-label="ភាសាខ្មែរ / Khmer language"
      className={`lang-switch ${isKhmer ? 'is-km' : ''}`}
      onClick={toggleLanguage}
      title={isKhmer ? 'Switch to English (ប្តូរទៅភាសាអង់គ្លេស)' : 'Switch to Khmer (ប្តូរទៅភាសាខ្មែរ)'}
    >
      <span className="lang-switch-pill" aria-hidden="true" />
      <span className="lang-switch-label lang-switch-en" aria-hidden="true">EN</span>
      <span className="lang-switch-label lang-switch-km" aria-hidden="true">KH</span>
    </button>
  );
}
