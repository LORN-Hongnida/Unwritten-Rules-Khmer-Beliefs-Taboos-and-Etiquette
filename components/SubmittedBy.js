'use client';

import { useLanguage } from './LanguageProvider';

// Who put this entry into the archive, shown right beside the category tag.
// Not the same as the contributor field: that names the source (a grandmother,
// a village elder), this names the account that typed it in. An entry with no
// known submitter shows nothing rather than a placeholder that would read as a
// real name. A long name is cut with an ellipsis; hovering shows all of it.
export default function SubmittedBy({ name }) {
  const { t } = useLanguage();
  if (!name) return null;

  const label = t({ en: 'by', km: 'ដោយ' });

  return (
    <span className="entry-author" title={`${t({ en: 'Submitted by', km: 'ដាក់ស្នើដោយ' })} ${name}`}>
      {label} <strong>{name}</strong>
    </span>
  );
}
