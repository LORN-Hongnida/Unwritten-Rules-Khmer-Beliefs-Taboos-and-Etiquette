'use client';

import { useLanguage } from './LanguageProvider';

// "Posted 22 Nov 2026 · Updated 24 Nov 2026" at the foot of the entry view.
// Dates are written in the reader's language (Khmer numerals and month names
// in Khmer mode). Updated only appears once the content has actually changed.
export default function EntryDates({ createdAt, updatedAt }) {
  const { t, language } = useLanguage();
  if (!createdAt) return null;

  const format = (iso) =>
    new Date(iso).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <p className="entry-dates">
      <span>{t({ en: 'Posted', km: 'បានដាក់ស្នើ' })} {format(createdAt)}</span>
      {updatedAt && (
        <>
          <span aria-hidden="true"> · </span>
          <span>{t({ en: 'Updated', km: 'បានកែប្រែ' })} {format(updatedAt)}</span>
        </>
      )}
    </p>
  );
}
