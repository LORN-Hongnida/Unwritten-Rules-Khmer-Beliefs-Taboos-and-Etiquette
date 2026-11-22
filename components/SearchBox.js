'use client';

import { useLanguage } from './LanguageProvider';

// The text an entry can be found by. Ids, owner ids and photo URLs are left
// out: searching "png" or part of a uuid should not match every entry.
const SEARCH_FIELDS = [
  'title', 'titleKm', 'description', 'reason', 'place',
  'contributor', 'submittedBy', 'review_note', 'category',
];

// Plain includes(), no transliteration: a Khmer term matches Khmer text as
// typed, an English term matches case-insensitively.
export function matchesSearch(entry, term) {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return SEARCH_FIELDS.some((field) => {
    const value = entry[field];
    return value != null && value.toString().toLowerCase().includes(needle);
  });
}

// Same look as the Browse search (it reuses its classes), without the category
// pills: on Browse those also change the site theme, which these pages should
// not do.
export default function SearchBox({ value, onChange, placeholder }) {
  const { t } = useLanguage();
  return (
    <div className="search-row" style={{ marginBottom: '20px' }}>
      <span className="search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="search"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={t({ en: 'Search entries', km: 'ស្វែងរកធាតុ' })}
      />
      {value && (
        <button type="button" className="search-clear" onClick={() => onChange('')}
          title={t({ en: 'Clear search', km: 'សម្អាតការស្វែងរក' })} aria-label={t({ en: 'Clear search', km: 'សម្អាតការស្វែងរក' })}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
