'use client';

import { useLanguage } from './LanguageProvider';

const MODES = [
  {
    value: 'cards', en: 'Cards', km: 'កាត',
    icon: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  },
  {
    value: 'list', en: 'List', km: 'បញ្ជី',
    icon: <path d="M4 6h16M4 12h16M4 18h16" />,
  },
];

// Two buttons that switch how entries are laid out. Same button family as the
// rest of the page: the chosen mode is the filled one.
export default function ViewModeToggle({ value, onChange }) {
  const { t } = useLanguage();
  return (
    <div role="group" aria-label={t({ en: 'Choose how entries are shown', km: 'ជ្រើសរើសរបៀបបង្ហាញធាតុ' })}
      style={{ display: 'flex', gap: '8px', marginLeft: 'auto', marginBottom: '20px' }}>
      {MODES.map((mode) => {
        const active = mode.value === value;
        return (
          <button
            key={mode.value}
            type="button"
            className={`btn ${active ? 'btn-primary' : 'btn-secondary'}`}
            aria-pressed={active}
            onClick={() => onChange(mode.value)}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mode.icon}
            </svg>
            <span>{t(mode)}</span>
          </button>
        );
      })}
    </div>
  );
}
