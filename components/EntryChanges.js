'use client';

import { useLanguage } from './LanguageProvider';

// previous_version is stored with the database's column names; the entry on
// the page has been through normalizeEntry. Each row pairs the two up.
const FIELDS = [
  { stored: 'title', current: 'title', en: 'Title', km: 'ចំណងជើង' },
  { stored: 'title_km', current: 'titleKm', en: 'Khmer title', km: 'ចំណងជើងខ្មែរ' },
  { stored: 'category', current: 'category', en: 'Category', km: 'ជំពូក' },
  { stored: 'description', current: 'description', en: 'Description', km: 'ការពិពណ៌នា' },
  { stored: 'reason', current: 'reason', en: 'Reason', km: 'មូលហេតុ' },
  { stored: 'still_believed', current: 'stillBelieved', en: 'Still believed', km: 'នៅតែជឿ' },
  { stored: 'place', current: 'place', en: 'Place', km: 'ទីកន្លែង' },
  { stored: 'contributor', current: 'contributor', en: 'Source', km: 'ប្រភព' },
  { stored: 'photo_url', current: 'photo_url', en: 'Photo', km: 'រូបថត', photo: true },
];

const clean = (value) => (value == null ? '' : String(value).trim());

function Value({ value, photo, old, emptyLabel }) {
  if (!value) return <em style={{ opacity: 0.7 }}>{emptyLabel}</em>;
  if (photo) {
    return <img src={value} alt="" style={{ width: '96px', height: '64px', objectFit: 'cover', borderRadius: '8px', opacity: old ? 0.6 : 1 }} />;
  }
  return <span style={old ? { textDecoration: 'line-through', opacity: 0.7 } : null}>{value}</span>;
}

// "What changed" at the top of the full entry, for a published entry that its
// author edited. Only changed fields are listed: the reviewer's question is
// "what is different?", not "what does it say?" (the rest of the view says that).
export default function EntryChanges({ entry }) {
  const { t } = useLanguage();
  const before = entry?.previous_version;
  if (!before) return null;

  const changed = FIELDS.filter((f) => clean(before[f.stored]) !== clean(entry[f.current]));

  return (
    <section style={{ margin: '0 0 20px', padding: '14px 16px', borderRadius: '12px',
      border: '1px solid var(--accent)', background: 'var(--input-bg)', overflowWrap: 'anywhere' }}>
      <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--accent)' }}>
        ✎ {t({ en: 'What changed since it was published', km: 'អ្វីដែលបានកែប្រែតាំងពីផ្សព្វផ្សាយ' })}
      </h4>
      {changed.length === 0 ? (
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-muted)' }}>
          {t({ en: 'The entry was saved again without visible changes.', km: 'ធាតុនេះត្រូវបានរក្សាទុកម្តងទៀត ដោយគ្មានការផ្លាស់ប្តូរដែលមើលឃើញ។' })}
        </p>
      ) : changed.map((f) => (
        <div key={f.stored} style={{ padding: '8px 0', borderTop: '1px solid var(--card-border)', fontSize: '13px' }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--ink)' }}>
            {t(f)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 10px', color: 'var(--ink-muted)' }}>
            <span>{t({ en: 'Before', km: 'មុន' })}</span>
            <Value value={clean(before[f.stored])} photo={f.photo} old emptyLabel={t({ en: '(empty)', km: '(ទទេ)' })} />
            <span style={{ color: 'var(--accent)' }}>{t({ en: 'Now', km: 'ឥឡូវ' })}</span>
            <Value value={clean(entry[f.current])} photo={f.photo} emptyLabel={t({ en: '(empty)', km: '(ទទេ)' })} />
          </div>
        </div>
      ))}
    </section>
  );
}
