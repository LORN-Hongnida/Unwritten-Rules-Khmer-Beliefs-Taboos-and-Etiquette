'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import SiteNav from '../../../components/SiteNav';
import ThemeAtmosphereBackdrop from '../../../components/ThemeAtmosphereBackdrop';
import { ThemeVibeIcon } from '../../../components/KbachMotifs';
import { useTheme } from '../../../components/ThemeProvider';
import { useLanguage } from '../../../components/LanguageProvider';
import { createClient } from '../../../lib/supabase/client';
import { normalizeEntry, fetchDisplayNames } from '../../../components/useEntries';
import EntryDetailModal from '../../../components/EntryDetailModal';
import EntryStatusBadge from '../../../components/EntryStatusBadge';
import ReviewStatusTabs from '../../../components/ReviewStatusTabs';
import SearchBox, { matchesSearch } from '../../../components/SearchBox';
import ReviewDecisionActions from '../../../components/ReviewDecisionActions';
import collection from '../../../collection.config.js';
import EntryCard from '../../../components/EntryCard';
import EntryListRow from '../../../components/EntryListRow';
import ReviewerNote from '../../../components/ReviewerNote';
import EditedTag from '../../../components/EditedTag';
import EntryChanges from '../../../components/EntryChanges';
import ViewModeToggle from '../../../components/ViewModeToggle';
import useViewMode from '../../../components/useViewMode';

export default function ReviewPage() {
  const { selectedTheme, setSelectedTheme, isDark, toggleMode } = useTheme();
  const { t } = useLanguage();

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [isReviewer, setIsReviewer] = useState(false);
  const [checkingReviewer, setCheckingReviewer] = useState(true);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [openEntry, setOpenEntry] = useState(null);
  // True when the full entry was opened by a list row's Return button, so it
  // opens with the note box already showing.
  const [openReturning, setOpenReturning] = useState(false);
  const [viewMode, setViewMode] = useViewMode('archive_view_admin');

  const openFull = (entry, returning = false) => {
    setOpenReturning(returning);
    setOpenEntry(entry);
  };
  const [statusFilter, setStatusFilter] = useState('pending');
  // Searches within the current tab, in the browser: the tab's entries are
  // already loaded, so there is no need to ask the database again per keystroke.
  const [searchTerm, setSearchTerm] = useState('');
  const visibleEntries = entries.filter((e) => matchesSearch(e, searchTerm));

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

        if (!reviewerStatus) setLoading(false);
      } catch (err) {
        console.error('Review page init error:', err);
        if (isMounted) setLoading(false);
      }
    }
    run();
    return () => { isMounted = false; };
  }, []);

  // Admins manage every entry, so the list follows the chosen tab rather than
  // only ever showing the queue. Pending is oldest first (first come, first
  // reviewed); the other tabs are newest first.
  useEffect(() => {
    if (!isReviewer) return;
    let isMounted = true;

    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        let query = supabase
          .from('entries')
          .select('*')
          .order('created_at', { ascending: statusFilter === 'pending' });
        if (statusFilter !== 'all') query = query.eq('status', statusFilter);

        const { data, error } = await query;
        if (!isMounted) return;
        if (error) { console.error('Failed to fetch entries:', error); return; }

        const list = data.map((item) => ({
          ...normalizeEntry(item),
          review_note: item.review_note,
          previous_version: item.previous_version,
        }));
        const names = await fetchDisplayNames(supabase, list);
        if (!isMounted) return;
        setEntries(list.map((e) => ({
          ...e,
          submittedBy: e.owner ? names[e.owner] || null : collection.curator,
        })));
      } catch (err) {
        console.error('Failed to fetch entries:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [isReviewer, statusFilter]);

  // After a decision: on the All tab the card stays and shows its new status;
  // on the Pending tab it has left the queue, so it goes.
  const applyDecision = useCallback((entryId, status, note = null) => {
    setEntries((prev) => statusFilter === 'all'
      ? prev.map((e) => (e.id === entryId ? { ...e, status, review_note: note } : e))
      : prev.filter((e) => e.id !== entryId));
  }, [statusFilter]);
const handleApprove = useCallback(async (entryId) => {
    setActionLoading(entryId);
    setActionMsg(null);
    setActionError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('review_entry', {
        entry_id: entryId, decision: 'published',
      });
      if (error) { console.error('Approve failed:', error.code, error.message, error.details, error.hint); setActionError({ en: 'Could not approve entry.', km: 'មិនអាចអនុម័តធាតុបានទេ។' }); setActionLoading(null); return false; }
      if (data === false) { setActionError({ en: 'Action refused.', km: 'សកម្មភាពត្រូវបានបដិសេធ។' }); setActionLoading(null); return false; }
      applyDecision(entryId, 'published');
      setActionMsg({ en: 'Entry published.', km: 'ធាតុត្រូវបានផ្សព្វផ្សាយ។' }); setActionLoading(null);
      return true;
    } catch (err) {
      console.error('Approve error:', err);
      setActionError({ en: 'An unexpected error occurred.', km: 'មានបញ្ហាមិនបានរំពឹងទុក។' }); setActionLoading(null);
      return false;
    }
  }, [applyDecision]);

  // The note is written in the full-entry view. Returns true on success so
  // that view knows whether to close.
  const handleReturn = useCallback(async (entryId, note) => {
    if (!note || !note.trim()) {
      setActionError({ en: 'Please write a note explaining why the entry is being returned.', km: 'សូមសរសេរកំណត់សម្គាល់ពន្យល់ពីមូលហេតុដែលធាតុត្រូវបញ្ជូនត្រឡប់។' });
      return false;
    }
    setActionLoading(entryId); setActionMsg(null); setActionError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('review_entry', {
        entry_id: entryId, decision: 'returned', note: note.trim(),
      });
      // Supabase errors print as {} because their fields are not enumerable, so
      // the useful parts are named one by one.
      if (error) { console.error('Return failed:', error.code, error.message, error.details, error.hint); setActionError({ en: 'Could not return entry.', km: 'មិនអាចបញ្ជូនធាតុត្រឡប់បានទេ។' }); setActionLoading(null); return false; }
      if (data === false) { setActionError({ en: 'Action refused.', km: 'សកម្មភាពត្រូវបានបដិសេធ។' }); setActionLoading(null); return false; }
      applyDecision(entryId, 'returned', note.trim());
      setActionMsg({ en: 'Entry returned to contributor.', km: 'ធាតុត្រូវបានបញ្ជូនត្រឡប់ទៅអ្នករួមចំណែក។' }); setActionLoading(null);
      return true;
    } catch (err) {
      console.error('Return error:', err); setActionError({ en: 'An unexpected error occurred.', km: 'មានបញ្ហាមិនបានរំពឹងទុក។' }); setActionLoading(null);
      return false;
    }
  }, [applyDecision]);

  // What sits above a card or under a row's details, in both views: the status
  // on the All tab (where statuses are mixed), the tag on an edited published
  // entry, and a returned entry's note.
  const entryExtras = (entry) => (<>
    {statusFilter === 'all' && (
      <div style={{ marginBottom: '8px' }}><EntryStatusBadge status={entry.status} /></div>
    )}
    <EditedTag entry={entry} />
    <ReviewerNote note={entry.status === 'returned' ? entry.review_note : null} />
  </>);
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
            <p>{t({ en: 'Loading…', km: 'កំពុងផ្ទុក…' })}</p>
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
              <h1 className="auth-title">{t({ en: 'Admin', km: 'ផ្ទាំងគ្រប់គ្រង' })}</h1>
              <p className="auth-description" style={{ margin: '16px 0 24px' }}>
                {t({ en: 'You need to sign in to access this page.', km: 'អ្នកត្រូវចូលគណនីដើម្បីចូលទំព័រនេះ។' })}
              </p>
              <Link href="/login" className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                {t({ en: 'Sign In', km: 'ចូលគណនី' })}
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
              <h1 className="auth-title">{t({ en: 'Admin', km: 'ផ្ទាំងគ្រប់គ្រង' })}</h1>
              <p className="auth-description" style={{ margin: '16px 0 24px' }}>
                {t({
                  en: 'You do not have reviewer access. Only designated reviewers can see and act on pending entries.',
                  km: 'អ្នកមិនមានសិទ្ធិជាអ្នកពិនិត្យទេ។ មានតែអ្នកពិនិត្យដែលបានកំណត់ប៉ុណ្ណោះ ដែលអាចមើល និងសម្រេចលើធាតុដែលកំពុងរង់ចាំ។',
                })}
              </p>
              <Link href="/browse" className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                {t({ en: 'Browse the Archive', km: 'រុករកបណ្ណសារ' })}
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
                <span>{t({ en: 'Back to Browse Archive', km: 'ត្រឡប់ទៅបណ្ណសារ' })}</span>
              </Link>
              <div className="browse-heading">
                <span className="browse-motif" aria-hidden="true"><ThemeVibeIcon motif="crown" size={20} /></span>
                <h1 className="browse-title">{t({ en: 'Review & Manage Entries', km: 'ពិនិត្យ និងគ្រប់គ្រងធាតុ' })}</h1>
              </div>
              <p className="browse-subtitle">
                {t({
                  en: 'Review waiting entries, and open any entry to edit or delete it.',
                  km: 'ពិនិត្យធាតុដែលកំពុងរង់ចាំ ហើយបើកធាតុណាមួយដើម្បីកែប្រែ ឬលុប។',
                })}
              </p>
            </div>
            <div className="browse-volume">
              <div>
                <span className="browse-volume-label">{t({ en: 'Showing', km: 'បង្ហាញ' })}</span>
                <span className="browse-volume-count">{visibleEntries.length}</span>
              </div>
              <span className="browse-volume-motif" aria-hidden="true"><ThemeVibeIcon motif="crown" size={16} /></span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '0 12px' }}>
            <ReviewStatusTabs value={statusFilter} onChange={(next) => { setStatusFilter(next); setActionMsg(null); setActionError(null); }} />
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
          <SearchBox value={searchTerm} onChange={setSearchTerm}
            placeholder={t({
              en: 'Search by title, Khmer, place, source or submitter...',
              km: 'ស្វែងរកតាមចំណងជើង ភាសាខ្មែរ ទីកន្លែង ប្រភព ឬអ្នកដាក់ស្នើ...',
            })} />

          {actionMsg && (
            <div style={{ padding: '12px 16px', marginBottom: '20px', borderRadius: '8px', background: 'rgba(229, 193, 88, 0.12)', border: '1px solid rgba(229, 193, 88, 0.3)', color: 'var(--accent)', fontSize: '14px' }}>
              {t(actionMsg)}
            </div>
          )}
          {actionError && (
            <div style={{ padding: '12px 16px', marginBottom: '20px', borderRadius: '8px', background: 'rgba(164, 74, 56, 0.1)', border: '1px solid rgba(164, 74, 56, 0.3)', color: 'var(--krama-red, #a44a38)', fontSize: '14px' }}>
              {t(actionError)}
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <p className="empty-state-title">{t({ en: 'Loading entries…', km: 'កំពុងផ្ទុកកំណត់ត្រា…' })}</p>
            </div>
          ) : searchTerm && entries.length > 0 && visibleEntries.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">{t({ en: 'No entries match your search', km: 'គ្មានធាតុត្រូវនឹងការស្វែងរករបស់អ្នកទេ' })}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">
                {t(statusFilter === 'pending'
                  ? { en: 'No entries waiting for review', km: 'គ្មានធាតុកំពុងរង់ចាំការពិនិត្យទេ' }
                  : { en: 'No entries here', km: 'គ្មានធាតុនៅទីនេះទេ' })}
              </p>
              {statusFilter === 'pending' && (
                <p className="empty-state-hint">
                  {t({
                    en: 'All caught up! New entries from contributors will appear here.',
                    km: 'រួចរាល់ហើយ! ធាតុថ្មីពីអ្នករួមចំណែកនឹងបង្ហាញនៅទីនេះ។',
                  })}
                </p>
              )}
            </div>
          ) : viewMode === 'list' ? (
            // List: compact rows for working through the queue. A pending row
            // keeps Approve one click away; Return opens the full entry with
            // the note box ready, because a return always needs a reason.
            <div className="entry-list">
              {visibleEntries.map((entry) => (
                <EntryListRow key={entry.id} entry={entry} onSelect={() => openFull(entry)}
                  actions={entry.status === 'pending' ? (<>
                    <button type="button" className="btn btn-primary"
                      onClick={() => handleApprove(entry.id)} disabled={actionLoading === entry.id}>
                      {actionLoading === entry.id ? t({ en: 'Saving…', km: 'កំពុងរក្សាទុក…' }) : `✓ ${t({ en: 'Approve', km: 'អនុម័ត' })}`}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => openFull(entry, true)}>
                      ↩ {t({ en: 'Return', km: 'បញ្ជូនត្រឡប់' })}
                    </button>
                  </>) : null}>
                  {entryExtras(entry)}
                </EntryListRow>
              ))}
            </div>
          ) : (
            // Cards: the same cards the public sees on Browse, so the reviewer
            // judges an entry as it will actually appear. Decisions are made in
            // the full entry, which a card opens.
            <div className="entries-grid">
              {visibleEntries.map((entry) => (
                <div key={entry.id} className="my-entry-row">
                  {entryExtras(entry)}
                  <EntryCard entry={entry} onSelect={() => openFull(entry)} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* A pending entry is waiting on a decision, so its full view offers
          Approve / Return. Any other entry gets the usual Edit / Delete. The
          key starts the note box fresh for each entry it is opened on. */}
      <EntryDetailModal
        entry={openEntry}
        onClose={() => setOpenEntry(null)}
        shareHref={null}
        notice={<EntryChanges entry={openEntry} />}
        actions={openEntry?.status === 'pending' ? (
          <ReviewDecisionActions key={`${openEntry.id}-${openReturning}`} entryId={openEntry.id}
            initialReturning={openReturning}
            onApprove={handleApprove} onReturn={handleReturn} onDone={() => setOpenEntry(null)} />
        ) : null}
      />
    </div>
  );
}
