'use client';

import { useLanguage } from './LanguageProvider';

// Marks a pending entry that was already public and has been edited since. The
// reviewer knows to check what changed; the author knows why it left the
// archive. Shown only when the database kept a previous version.
export default function EditedTag({ entry }) {
  const { t } = useLanguage();
  if (!entry.previous_version) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '8px',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
        border: '1px solid var(--accent)',
        color: 'var(--accent)',
      }}
    >
      <span aria-hidden="true">✎</span>
      <span>{t({ en: 'Edited after publishing', km: 'បានកែប្រែក្រោយផ្សព្វផ្សាយ' })}</span>
    </span>
  );
}
