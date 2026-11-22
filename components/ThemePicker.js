'use client';

import { useState } from 'react';
import themes from '../data/themes.js';
import { ThemeVibeIcon } from './KbachMotifs';
import ThemeDropdown from './ThemeDropdown';
import { useLanguage } from './LanguageProvider';

// The theme button and its popover, for visitors who are not signed in. A
// signed-in reader picks the theme inside the account menu instead (see
// UserNavAuth), so this only appears beside "Sign In".
export default function ThemePicker({ selectedTheme, onSelectTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const theme = themes[selectedTheme];

  return (
    <div className="site-nav-theme">
      <button
        type="button"
        className="site-nav-theme-trigger"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={t({ en: 'Change theme and category', km: 'ប្តូររចនាបថ និងប្រភេទ' })}
      >
        <ThemeVibeIcon motif={theme.motifType} size={15} />
        <span className="site-nav-theme-label">
          {selectedTheme === 'all'
            ? t({ en: 'Theme', km: 'រចនាបថ' })
            : t({ en: theme.nameEn.split(' ')[0], km: theme.nameKm.split(' ')[0] })}
        </span>
        <span className="site-nav-theme-caret" aria-hidden="true">▾</span>
      </button>

      <ThemeDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedTheme={selectedTheme}
        onSelectTheme={onSelectTheme}
      />
    </div>
  );
}
