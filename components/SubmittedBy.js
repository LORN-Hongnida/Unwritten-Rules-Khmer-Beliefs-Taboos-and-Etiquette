'use client';

import { useLanguage } from './LanguageProvider';

// Who put this entry into the archive. Not the same as the contributor field:
// that names the source (a grandmother, a village elder), this names the
// account that typed it in. An entry with no known submitter shows nothing
// rather than a placeholder that would read as a real name.
export default function SubmittedBy({ name }) {
  const { t } = useLanguage();
  if (!name) return null;

  return (
    <p
      style={{
        margin: '0 0 10px',
        overflowWrap: 'anywhere',
        fontSize: '11px',
        color: 'var(--ink-muted)',
      }}
    >
      {t({ en: 'Submitted by', km: 'ដាក់ស្នើដោយ' })}{' '}
      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{name}</span>
    </p>
  );
}
