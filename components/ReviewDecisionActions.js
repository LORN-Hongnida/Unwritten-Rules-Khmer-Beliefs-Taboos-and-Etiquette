'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

// Approve / Return inside the full-entry view, so a reviewer can decide right
// after reading the whole entry. The decisions themselves (the review_entry
// call) belong to the admin page; this only collects the click and the note.
// onApprove(id) and onReturn(id, note) resolve to true when the decision saved.
// initialReturning opens straight onto the note box, for when the reviewer
// already pressed Return on a list row.
export default function ReviewDecisionActions({ entryId, onApprove, onReturn, onDone, initialReturning = false }) {
  const { t } = useLanguage();
  const [returning, setReturning] = useState(initialReturning);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const decide = async (action) => {
    if (action === 'return' && !note.trim()) {
      setError({ en: 'Write a note so the author knows what to change.', km: 'សូមសរសេរកំណត់សម្គាល់ ដើម្បីឲ្យអ្នកនិពន្ធដឹងថាត្រូវកែអ្វី។' });
      return;
    }
    setBusy(true);
    setError(null);
    const ok = action === 'approve' ? await onApprove(entryId) : await onReturn(entryId, note);
    setBusy(false);
    // Shown here, not on the page behind: that message would be hidden by the
    // very view the reviewer is looking at.
    if (ok) onDone();
    else setError({ en: "That decision wasn't saved. Please try again.", km: 'ការសម្រេចនោះមិនត្រូវបានរក្សាទុកទេ។ សូមព្យាយាមម្តងទៀត។' });
  };

  const red = 'var(--krama-red-light)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: 0, marginRight: '12px' }}>
      {returning && (
        <textarea className="auth-input" value={note} onChange={(e) => setNote(e.target.value)}
          style={{ width: '100%', minHeight: '60px', fontSize: '13px' }}
          placeholder={t({ en: 'Why is this entry being returned? (the author will see this)', km: 'ហេតុអ្វីបានជាធាតុនេះត្រូវបញ្ជូនត្រឡប់? (អ្នកនិពន្ធនឹងឃើញ)' })} />
      )}
      {error && <p style={{ margin: 0, fontSize: '12px', color: red }}>{t(error)}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {!returning ? (<>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => decide('approve')}>
            {busy ? t({ en: 'Saving…', km: 'កំពុងរក្សាទុក…' }) : `✓ ${t({ en: 'Approve', km: 'អនុម័ត' })}`}
          </button>
          <button type="button" className="btn btn-danger" disabled={busy} onClick={() => setReturning(true)}>
            ↩ {t({ en: 'Return', km: 'បញ្ជូនត្រឡប់' })}
          </button>
        </>) : (<>
          <button type="button" className="btn btn-danger" disabled={busy} onClick={() => decide('return')}>
            {busy ? t({ en: 'Sending…', km: 'កំពុងបញ្ជូន…' }) : t({ en: 'Confirm Return', km: 'បញ្ជាក់ការបញ្ជូនត្រឡប់' })}
          </button>
          <button type="button" className="btn btn-secondary" disabled={busy}
            onClick={() => { setReturning(false); setNote(''); setError(null); }}>
            {t({ en: 'Cancel', km: 'បោះបង់' })}
          </button>
        </>)}
      </div>
    </div>
  );
}
