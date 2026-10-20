'use client';

// Every message a contributor can be shown carries both languages. The Khmer
// half is marked up with lang and its own face because the Latin fonts have no
// Khmer coverage and would fall back to whatever the system supplies.
export default function BilingualMessage({ en, km }) {
  if (!en && !km) return null;

  return (
    <>
      {en}
      {en && km ? ' ' : null}
      {km ? (
        <span className="msg-km" lang="km">
          {km}
        </span>
      ) : null}
    </>
  );
}
