'use client';

import { useLanguage } from './LanguageProvider';

// The reviewer's reason for returning an entry. A return without a reason is
// just a door closing, so wherever a returned entry appears, this goes with it.
// Plain text in a <p>: a reviewer's words are words, not markup.
export default function ReviewerNote({ note }) {
  const { t } = useLanguage();
  if (!note) return null;

  return (
    <p className="my-entry-note">
      <span className="my-entry-note-label">{t({ en: 'A note from the reviewer', km: 'កំណត់សម្គាល់ពីអ្នកពិនិត្យ' })}</span>
      {note}
    </p>
  );
}
