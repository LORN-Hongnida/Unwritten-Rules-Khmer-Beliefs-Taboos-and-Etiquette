'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import SiteNav from '../../../components/SiteNav';
import ThemeAtmosphereBackdrop from '../../../components/ThemeAtmosphereBackdrop';
import { ThemeVibeIcon } from '../../../components/KbachMotifs';
import { useTheme } from '../../../components/ThemeProvider';
import { createClient } from '../../../lib/supabase/client';
import { normalizeEntry } from '../../../components/useEntries';

const CATEGORY_META = {
  beliefs:   { en: 'Belief',       km: 'ជំនឿ',          motif: 'lantern' },
  taboos:    { en: 'Taboo',        km: 'ការហាមប្រាម',   motif: 'moon'    },
  etiquette: { en: 'Etiquette',    km: 'សុជីវធម៌',      motif: 'crown'   },
};
export default function ReviewPage() {
  const { selectedTheme, setSelectedTheme, isDark, toggleMode } = useTheme();

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [isReviewer, setIsReviewer] = useState(false);
  const [checkingReviewer, setCheckingReviewer] = useState(true);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [returningId, setReturningId] = useState(null);
  const [returnNote, setReturnNote] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!isMounted) return;
        setUser(currentUser);
        setUserLoading(false);

        if (!currentUser) {
          setCheckingReviewer(false);
          setLoading(false);
          return;
        }

        const { data: reviewerStatus } = await supabase.rpc('is_reviewer');
        if (!isMounted) return;
        setIsReviewer(!!reviewerStatus);
        setCheckingReviewer(false);

        if (!reviewerStatus) { setLoading(false); return; }

        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: true });

        if (!isMounted) return;
        if (error) console.error('Failed to fetch pending entries:', error);
        else if (data) setEntries(data.map(normalizeEntry));
      } catch (err) {
        console.error('Review page init error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    run();
    return () => { isMounted = false; };
  }, []);
const handleApprove = useCallback(async (entryId) => {
    setActionLoading(entryId);
    setActionMsg(null);
    setActionError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('review_entry', {
        entry_id: entryId, decision: 'published',
      });
      if (error) { console.error('Approve failed:', error); setActionError('Could not approve entry.'); setActionLoading(null); return; }
      if (data === false) { setActionError('Action refused.'); setActionLoading(null); return; }
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setActionMsg('Entry published.'); setActionLoading(null);
    } catch (err) {
      console.error('Approve error:', err);
      setActionError('An unexpected error occurred.'); setActionLoading(null);
    }
  }, []);

  const handleReturn = useCallback(async (entryId) => {
    if (!returnNote.trim()) {
      setActionError('Please write a note explaining why the entry is being returned.');
      return;
    }
    setActionLoading(entryId); setActionMsg(null); setActionError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('review_entry', {
        entry_id: entryId, decision: 'returned', note: returnNote.trim(),
      });
      if (error) { console.error('Return failed:', error); setActionError('Could not return entry.'); setActionLoading(null); return; }
      if (data === false) { setActionError('Action refused.'); setActionLoading(null); return; }
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setReturningId(null); setReturnNote('');
      setActionMsg('Entry returned to contributor.'); setActionLoading(null);
    } catch (err) {
      console.error('Return error:', err); setActionError('An unexpected error occurred.'); setActionLoading(null);
    }
  }, [returnNote]);
const chrome = (
    <>
      <ThemeAtmosphereBackdrop selectedTheme={selectedTheme} />
      <SiteNav selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} isDark={isDark} onToggleMode={toggleMode} />
    </>
  );

  if (userLoading || checkingReviewer) {
    return (
      <div>
        <div className="page-content">
          {chrome}
          <main className="browse-page" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>Loading… / កំពុងផ្ទុក…</p>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <div className="page-content">
          {chrome}
          <main className="browse-page">
            <div className="contribute-card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '560px', margin: '40px auto' }}>
              <div className="auth-motif" aria-hidden="true" style={{ marginBottom: '12px' }}>
                <ThemeVibeIcon motif="crown" size={28} />
              </div>
              <h1 className="auth-title">Review Queue</h1>
              <p className="auth-description" style={{ margin: '16px 0 24px' }}>You need to sign in to access the review queue.</p>
              <Link href="/login" className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Sign In / ចូលគណនី
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isReviewer) {
    return (
      <div>
        <div className="page-content">
          {chrome}
          <main className="browse-page">
            <div className="contribute-card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '560px', margin: '40px auto' }}>
              <div className="auth-motif" aria-hidden="true" style={{ marginBottom: '12px' }}>
                <ThemeVibeIcon motif="crown" size={28} />
              </div>
              <h1 className="auth-title">Review Queue</h1>
              <p className="auth-description" style={{ margin: '16px 0 24px' }}>
                You do not have reviewer access. Only designated reviewers can see and act on pending entries.
              </p>
              <Link href="/browse" className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Browse the Archive / រុករកបណ្ណសារ
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }
return (
    <div>
      <div className="page-content">
        {chrome}
        <main className="browse-page">
          <div className="browse-header">
            <div>
              <Link href="/browse" className="browse-back">
                <span aria-hidden="true">←</span>
                <span lang="km">ត្រឡប់ទៅប័ណ្ណសារ</span>
                <span>(Back to Browse Archive)</span>
              </Link>
              <div className="browse-heading">
                <span className="browse-motif" aria-hidden="true"><ThemeVibeIcon motif="crown" size={20} /></span>
                <h1 className="browse-title" lang="km">ការពិនិត្យធាតុ</h1>
              </div>
              <p className="browse-subtitle">Review Queue — approve or return entries waiting for review.</p>
            </div>
            <div className="browse-volume">
              <div>
                <span className="browse-volume-label">Pending</span>
                <span className="browse-volume-count">{entries.length}</span>
              </div>
              <span className="browse-volume-motif" aria-hidden="true"><ThemeVibeIcon motif="crown" size={16} /></span>
            </div>
          </div>

          {actionMsg && (
            <div style={{ padding: '12px 16px', marginBottom: '20px', borderRadius: '8px', background: 'rgba(229, 193, 88, 0.12)', border: '1px solid rgba(229, 193, 88, 0.3)', color: 'var(--accent)', fontSize: '14px' }}>
              {actionMsg}
            </div>
          )}
          {actionError && (
            <div style={{ padding: '12px 16px', marginBottom: '20px', borderRadius: '8px', background: 'rgba(164, 74, 56, 0.1)', border: '1px solid rgba(164, 74, 56, 0.3)', color: 'var(--krama-red, #a44a38)', fontSize: '14px' }}>
              {actionError}
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <p className="empty-state-title">Loading entries…</p>
              <p className="empty-state-title-km" lang="km">កំពុងផ្ទុកកំណត់ត្រា…</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No entries waiting for review</p>
              <p className="empty-state-title-km" lang="km">គ្មានធាតុកំពុងរង់ចាំការពិនិត្យ</p>
              <p className="empty-state-hint">All caught up! New entries from contributors will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {entries.map((entry) => {
                const cat = CATEGORY_META[entry.category] || CATEGORY_META.beliefs;
                return (
                  <div key={entry.id} className="entry-card" data-category={entry.category}
                    style={{ border: '1px solid var(--card-border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div className="entry-card-body" style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span className="entry-card-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(229, 193, 88, 0.12)', color: 'var(--accent)', border: '1px solid rgba(229, 193, 88, 0.25)' }}>
                          <ThemeVibeIcon motif={cat.motif} size={11} />
                          <span lang="km">{cat.km}</span>
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)' }}>{cat.en}</span>
                        <span style={{ fontSize: '11px', color: 'var(--ink-muted)', marginLeft: 'auto' }}>
                          {new Date(entry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: 'var(--ink)' }}>{entry.title}</h3>
                      <p style={{ fontSize: '14px', margin: '0 0 12px', color: 'var(--ink-muted)' }} lang="km">{entry.titleKm}</p>
                      <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--ink-muted)', margin: '0 0 12px' }}>
                        {entry.description && entry.description.length > 200 ? entry.description.slice(0, 200) + '…' : entry.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '16px' }}>
                        {entry.contributor && <span>From: <strong>{entry.contributor}</strong></span>}
                        {entry.place && <span>Place: <strong>{entry.place}</strong></span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--card-border)', flexWrap: 'wrap' }}>
                        <button type="button" className="auth-submit" style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: actionLoading === entry.id ? 'not-allowed' : 'pointer', opacity: actionLoading === entry.id ? 0.6 : 1 }}
                          onClick={() => handleApprove(entry.id)} disabled={actionLoading === entry.id}>
                          {actionLoading === entry.id ? 'Processing…' : '✓ Approve / អនុម័ត'}
                        </button>
                        {returningId === entry.id ? (
                          <div style={{ flex: 1, minWidth: '280px' }}>
                            <textarea className="auth-input" style={{ width: '100%', minHeight: '70px', fontSize: '13px', marginBottom: '8px' }}
                              placeholder="Explain why this entry is being returned (visible to the contributor)…"
                              value={returnNote} onChange={(e) => setReturnNote(e.target.value)} />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button type="button" style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: '1px solid var(--krama-red, #a44a38)', color: 'var(--krama-red, #a44a38)', background: 'transparent', cursor: actionLoading === entry.id ? 'not-allowed' : 'pointer', opacity: actionLoading === entry.id ? 0.6 : 1 }}
                                onClick={() => handleReturn(entry.id)} disabled={actionLoading === entry.id}>
                                {actionLoading === entry.id ? 'Sending…' : 'Confirm Return / បញ្ជាក់'}
                              </button>
                              <button type="button" style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: '1px solid var(--card-border)', color: 'var(--ink-muted)', background: 'transparent', cursor: 'pointer' }}
                                onClick={() => { setReturningId(null); setReturnNote(''); }}>
                                Cancel / បោះបង់
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button type="button" style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1px solid var(--krama-red, #a44a38)', color: 'var(--krama-red, #a44a38)', background: 'transparent', cursor: 'pointer' }}
                            onClick={() => setReturningId(entry.id)}>
                            ↩ Return / បញ្ជូនត្រឡប់
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
