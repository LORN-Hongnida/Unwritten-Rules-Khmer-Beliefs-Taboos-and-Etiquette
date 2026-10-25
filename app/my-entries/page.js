'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EntryCard from '../../components/EntryCard';
import EntryDetailModal from '../../components/EntryDetailModal';
import EntryStatusBadge from '../../components/EntryStatusBadge';
import SiteNav from '../../components/SiteNav';
import ThemeAtmosphereBackdrop from '../../components/ThemeAtmosphereBackdrop';
import { ThemeVibeIcon } from '../../components/KbachMotifs';
import { useTheme } from '../../components/ThemeProvider';
import { normalizeEntry } from '../../components/useEntries';
import { createClient } from '../../lib/supabase/client';

export default function MyEntriesPage() {
  const { selectedTheme, setSelectedTheme, isDark, toggleMode } = useTheme();

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEntry, setOpenEntry] = useState(null);

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
          setEntries(data.map((item) => ({ ...normalizeEntry(item), review_note: item.review_note })));
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
            <p>Loading session… / កំពុងផ្ទុក…</p>
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
              <h1 className="auth-title">ចូលប្រើប្រាស់គណនី</h1>
              <div className="auth-title-sub">Contributor Authentication Required</div>
              <p className="auth-description" style={{ margin: '16px 0 24px' }}>
                Sign in to see the entries you have shared and where each one stands.
                <span className="msg-km" lang="km">
                  ចូលគណនីដើម្បីមើលធាតុដែលអ្នកបានចែករំលែក និងស្ថានភាពរបស់វា។
                </span>
              </p>
              <Link href="/login" className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Sign In / ចូលគណនី
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
                <span className="browse-motif" aria-hidden="true">
                  <ThemeVibeIcon motif="lantern" size={20} />
                </span>
                <h1 className="browse-title" lang="km">ធាតុរបស់ខ្ញុំ</h1>
              </div>
              <p className="browse-subtitle">
                My entries — everything you have shared, and where each one stands.
              </p>
            </div>
          </div>

          <div className="entries-grid">
            {loading ? (
              <div className="empty-state">
                <p className="empty-state-title">Loading your entries…</p>
                <p className="empty-state-title-km" lang="km">កំពុងផ្ទុកធាតុរបស់អ្នក…</p>
              </div>
            ) : entries.length > 0 ? (
              entries.map((entry) => (
                <div key={entry.id} className="my-entry-row">
                  <div style={{ marginBottom: '8px' }}>
                    <EntryStatusBadge status={entry.status} />
                  </div>
                  {/* Only a returned entry carries a note, and a return without
                      a reason is just a door closing. Plain text in a <p>: a
                      reviewer's words are words, not markup. */}
                  {entry.status === 'returned' && entry.review_note && (
                    <p className="my-entry-note">
                      <span className="my-entry-note-label" lang="km">
                        សំណើពីអ្នកពិនិត្យ
                      </span>
                      <span className="my-entry-note-label">A note from the reviewer</span>
                      {entry.review_note}
                    </p>
                  )}
                  <EntryCard entry={entry} onSelect={setOpenEntry} />
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p className="empty-state-title">You have not shared an entry yet</p>
                <p className="empty-state-title-km" lang="km">អ្នកមិនទាន់បានចែករំលែកធាតុណាមួយទេ</p>
                <p className="empty-state-hint">
                  <Link href="/contribute" className="auth-link">
                    Contribute one / រួមចំណែកមួយ
                  </Link>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <EntryDetailModal entry={openEntry} onClose={() => setOpenEntry(null)} shareHref={null} />
    </div>
  );
}
