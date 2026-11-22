'use client';

import { useLanguage } from './LanguageProvider';

// Every message a contributor can be shown is written in both languages, and
// shows the one the reader chose with the language toggle. If a message only
// has one half, that half is shown rather than nothing.
export default function BilingualMessage({ en, km }) {
  const { language } = useLanguage();
  if (!en && !km) return null;

  return <>{language === 'km' ? (km || en) : (en || km)}</>;
}
