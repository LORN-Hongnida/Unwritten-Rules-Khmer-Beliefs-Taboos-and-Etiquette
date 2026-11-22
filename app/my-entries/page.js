'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EntryCard from '../../components/EntryCard';
import EntryDetailModal from '../../components/EntryDetailModal';
import EntryListRow from '../../components/EntryListRow';
import EntryOwnerActions from '../../components/EntryOwnerActions';
import EditedTag from '../../components/EditedTag';
import EntryChanges from '../../components/EntryChanges';
import ReviewerNote from '../../components/ReviewerNote';
import ViewModeToggle from '../../components/ViewModeToggle';
import useViewMode from '../../components/useViewMode';
import ReviewStatusTabs from '../../components/ReviewStatusTabs';
import SearchBox, { matchesSearch } from '../../components/SearchBox';
import SiteNav from '../../components/SiteNav';
import ThemeAtmosphereBackdrop from '../../components/ThemeAtmosphereBackdrop';
import { ThemeVibeIcon } from '../../components/KbachMotifs';
import { useTheme } from '../../components/ThemeProvider';
import { useLanguage } from '../../components/LanguageProvider';
import { normalizeEntry } from '../../components/useEntries';
import { createClient } from '../../lib/supabase/client';

// One list per state rather than a badge on every card. Returned entries get
// their own tab: they are waiting on the author, not on the reviewer, and
// mixing them in with Pending hid the ones that need something done.
const AUTHOR_TABS = [
  { value: 'pending', en: 'Waiting for review', km: 'កំពុងរង់ចាំការពិនិត្យ' },
  { value: 'returned', en: 'Needs changes', km: 'ត្រូវកែប្រែ' },
  { value: 'published', en: 'Public', km: 'សាធារណៈ' },
];
const EMPTY = {
  pending: { en: 'Nothing waiting for review', km: 'គ្មានធាតុកំពុងរង់ចាំការពិនិត្យទេ' },
  returned: { en: 'Nothing needs changes', km: 'គ្មានធាតុត្រូវកែប្រែទេ' },
  published: { en: 'None of your entries are public yet', km: 'មិនទាន់មានធាតុរបស់អ្នកជាសាធារណៈនៅឡើយទេ' },
};

export default function MyEntriesPage() {
  const { selectedTheme, setSelectedTheme, isDark, toggleMode } = useTheme();
  const { t } = useLanguage();

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEntry, setOpenEntry] = useState(null);
  const [tab, setTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useViewMode('archive_view_my_entries');

  const counts = Object.fromEntries(
    AUTHOR_TABS.map((t) => [t.value, entries.filter((e) => e.status === t.value).length])
  );
  const visibleEntries = entries.filter((e) => e.status === tab && matchesSearch(e, searchTerm));

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
          setLoading(false);
          return;
        }

        // No status filter: this is the one page that shows all three. The read
        // policy already limits this to rows the caller owns; the owner filter
        // is here so the query says out loud what it means.
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .eq('owner', currentUser.id)
          .order('created_at', { ascending: false });

        if (!isMounted) return;
        if (error) {
          console.error('Failed to load your entries:', error);
        } else if (data) {
          setEntries(data.map((item) => ({
            ...normalizeEntry(item),
            review_note: item.review_note,
            previous_version: item.previous_version,
          })));
        }
      } catch (err) {
        console.error('Failed to load your entries:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    run();
    return () => {
      isMounted = false;
    };
  }, []);

  const chrome = (
    <>
      <ThemeAtmosphereBackdrop selectedTheme={selectedTheme} />
      <SiteNav
        selectedTheme={selectedTheme}
        onSelectTheme={setSelectedTheme}
        isDark={isDark}
        onToggleMode={toggleMode}
      />
    </>
  );

  if (userLoading) {
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

  // Signed out, this page has nothing to show and nothing to say, so it offers
  // the door rather than redirecting somewhere the reader did not ask for.
  if (!user) {
    return (
      <div>
        <div className="page-content">
          {chrome}
          <main className="browse-page">
            <div className="contribute-card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '560px', margin: '40px auto' }}>
              <div className="auth-motif" aria-hidden="true" style={{ marginBottom: '12px' }}>
                <ThemeVibeIcon motif="etiquette" size={28} />
              </div>
              <h1 className="auth-title">{t({ en: 'Sign in required', km: 'ត្រូវចូលគណនី' })}</h1>
              <p className="auth-description" style={{ margin: '16px 0 24px' }}>
                {t({
                  en: 'Sign in to see the entries you have shared and where each one stands.',
                  km: 'ចូលគណនីដើម្បីមើលធាតុដែលអ្នកបានចែករំលែក និងស្ថានភាពរបស់វា។',
                })}
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
                <span className="browse-motif" aria-hidden="true">
                  <ThemeVibeIcon motif="lantern" size={20} />
                </span>
                <h1 className="browse-title">{t({ en: 'My Entries', km: 'ធាតុរបស់ខ្ញុំ' })}</h1>
              </div>
              <p className="browse-subtitle">
                {t({
                  en: 'Everything you have shared, and where each one stands.',
                  km: 'អ្វីៗទាំងអស់ដែលអ្នកបានចែករំលែក និងស្ថានភាពរបស់ធាតុនីមួយៗ។',
                })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '0 12px' }}>
            <ReviewStatusTabs value={tab} onChange={setTab} tabs={AUTHOR_TABS} counts={counts} />
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
          <SearchBox value={searchTerm} onChange={setSearchTerm}
            placeholder={t({
              en: 'Search your entries by English, Khmer, place or source...',
              km: 'ស្វែងរកធាតុរបស់អ្នកជាភាសាខ្មែរ អង់គ្លេស តាមទីកន្លែង ឬប្រភព...',
            })} />

          <div className={viewMode === 'list' ? 'entry-list' : 'entries-grid'}>
            {loading ? (
              <div className="empty-state">
                <p className="empty-state-title">{t({ en: 'Loading your entries…', km: 'កំពុងផ្ទុកធាតុរបស់អ្នក…' })}</p>
              </div>
            ) : visibleEntries.length > 0 ? (
              // Only a returned entry carries a note; an edited published entry
              // carries the tag that explains why it left the archive.
              visibleEntries.map((entry) => {
                const extras = (<>
                  <EditedTag entry={entry} />
                  <ReviewerNote note={entry.status === 'returned' ? entry.review_note : null} />
                </>);
                return viewMode === 'list' ? (
                  <EntryListRow key={entry.id} entry={entry} onSelect={setOpenEntry}
                    actions={<EntryOwnerActions entryId={entry.id} ownerId={entry.owner} entryTitle={entry.title} knownOwner />}>
                    {extras}
                  </EntryListRow>
                ) : (
                  <div key={entry.id} className="my-entry-row">
                    {extras}
                    <EntryCard entry={entry} onSelect={setOpenEntry} />
                  </div>
                );
              })
            ) : entries.length > 0 ? (
              // They have entries, just none in this tab or matching the search.
              <div className="empty-state">
                <p className="empty-state-title">
                  {t(searchTerm ? { en: 'No entries match your search', km: 'គ្មានធាតុត្រូវនឹងការស្វែងរករបស់អ្នកទេ' } : EMPTY[tab])}
                </p>
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state-title">{t({ en: 'You have not shared an entry yet', km: 'អ្នកមិនទាន់បានចែករំលែកធាតុណាមួយទេ' })}</p>
                <p className="empty-state-hint">
                  <Link href="/contribute" className="auth-link">
                    {t({ en: 'Contribute one', km: 'រួមចំណែកមួយ' })}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* The author sees the same "what changed" as the reviewer, so they can
          check their edit is what they meant before it is reviewed. */}
      <EntryDetailModal entry={openEntry} onClose={() => setOpenEntry(null)} shareHref={null}
        notice={<EntryChanges entry={openEntry} />} />
    </div>
  );
}
