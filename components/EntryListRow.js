'use client';

import { ThemeVibeIcon } from './KbachMotifs';
import { useLanguage } from './LanguageProvider';

// Same motifs and words as the cards, so an entry is recognisable in both views.
const CATEGORY = {
  etiquette: { motif: 'crown', en: 'Etiquette', km: 'សុជីវធម៌' },
  beliefs: { motif: 'lantern', en: 'Belief', km: 'ជំនឿ' },
  taboos: { motif: 'moon', en: 'Taboo', km: 'ការហាមប្រាម' },
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;

// One entry as a compact row: enough to recognise it and act on it. Clicking
// the row opens the full entry; clicks on the buttons in `actions` do not.
// `children` is for anything a page adds under the details (a status badge, a
// reviewer's note).
export default function EntryListRow({ entry, onSelect, actions = null, children = null }) {
  const { t } = useLanguage();
  const category = CATEGORY[entry.category] || CATEGORY.beliefs;
  const details = [
    t(category),
    entry.submittedBy && `${t({ en: 'Submitted by', km: 'ដាក់ស្នើដោយ' })} ${entry.submittedBy}`,
    entry.place,
    formatDate(entry.created_at),
  ].filter(Boolean);

  return (
    <div
      className="entry-list-row"
      role="button"
      tabIndex={0}
      aria-label={`${entry.title} — ${t({ en: 'open full entry', km: 'មើលធាតុពេញ' })}`}
      onClick={(e) => { if (!e.target.closest('.entry-list-actions')) onSelect(entry); }}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect(entry);
        }
      }}
    >
      <span className="entry-list-icon" aria-hidden="true">
        <ThemeVibeIcon motif={category.motif} size={16} />
      </span>

      <div className="entry-list-main">
        <p className="entry-list-title">{entry.title}</p>
        {entry.titleKm && <p className="entry-list-title-km" lang="km">{entry.titleKm}</p>}
        <p className="entry-list-meta">{details.join(' · ')}</p>
        {children}
      </div>

      {actions && <div className="entry-list-actions">{actions}</div>}
    </div>
  );
}
