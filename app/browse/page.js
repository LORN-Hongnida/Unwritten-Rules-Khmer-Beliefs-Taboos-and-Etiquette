'use client';

import { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import themes from "../../data/themes.js";
import EntryCard from "../../components/EntryCard";
import EntryDetailModal from "../../components/EntryDetailModal";
import SearchAndFilter from "../../components/SearchAndFilter";
import SiteNav from "../../components/SiteNav";
import ThemeAtmosphereBackdrop from "../../components/ThemeAtmosphereBackdrop";
import { ThemeVibeIcon } from "../../components/KbachMotifs";
import { useTheme } from "../../components/ThemeProvider";
import useEntryRoute from "../../components/useEntryRoute";
import useEntries from "../../components/useEntries";
import { useLanguage } from "../../components/LanguageProvider";

export default function BrowsePage() {
  const { selectedTheme, setSelectedTheme, isDark, toggleMode } = useTheme();
  const { t } = useLanguage();
  const { entries, loading } = useEntries();
  const { openEntry, setOpenEntry, buildHref } = useEntryRoute(entries);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // How many entries sit in each category, for the filter pills.
  const categoryCounts = entries.reduce(
    (acc, entry) => ({ ...acc, [entry.category]: (acc[entry.category] || 0) + 1 }),
    { all: entries.length, etiquette: 0, beliefs: 0, taboos: 0 }
  );

  // The search term rides in the URL so a filtered view can be linked to and
  // survives a trip to an entry and back.
  const searchTerm = searchParams.get("q") ?? "";

  const setSearchTerm = useCallback(
    (term) => {
      const params = new URLSearchParams(searchParams);
      if (term) params.set("q", term);
      else params.delete("q");

      // A new search invalidates whichever entry was open.
      params.delete("entry");

      const query = params.toString();
      // replace, not push: typing would otherwise bury the page in history.
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const themedEntries =
    selectedTheme === "all"
      ? entries
      : entries.filter((entry) => entry.category === selectedTheme);

  // Match any field, so a Khmer title or a place name both find the entry.
  const filteredEntries = themedEntries.filter((entry) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return Object.values(entry).some(
      (value) => value != null && value.toString().toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <ThemeAtmosphereBackdrop selectedTheme={selectedTheme} />

      <div className="page-content">
        <SiteNav
          selectedTheme={selectedTheme}
          onSelectTheme={setSelectedTheme}
          isDark={isDark}
          onToggleMode={toggleMode}
        />

        <main className="browse-page">
          <div className="browse-header">
            <div>
              {/* Carries the theme home, so going back does not reset the view. */}
              <Link
                href={selectedTheme === "all" ? "/" : `/?theme=${selectedTheme}`}
                className="browse-back"
              >
                <span aria-hidden="true">←</span>
                <span>{t({ en: 'Back to Home', km: 'ត្រឡប់ទៅទំព័រដើម' })}</span>
              </Link>

              <div className="browse-heading">
                <span className="browse-motif" aria-hidden="true">
                  <ThemeVibeIcon motif={themes[selectedTheme].motifType} size={20} />
                </span>
                <h1 className="browse-title">
                  {t({ en: themes[selectedTheme].browse.titleEn, km: themes[selectedTheme].browse.titleKm })}
                </h1>
              </div>
              <p className="browse-subtitle">
                {t({ en: themes[selectedTheme].browse.subtitle, km: themes[selectedTheme].browse.subtitleKm })}
              </p>
            </div>

            <div className="browse-volume">
              <div>
                <span className="browse-volume-label">{t({ en: 'Archive Volume', km: 'ចំនួនក្នុងបណ្ណសារ' })}</span>
                <span className="browse-volume-count">
                  {filteredEntries.length} / {entries.length}
                </span>
              </div>
              <span className="browse-volume-motif" aria-hidden="true">
                <ThemeVibeIcon motif={themes[selectedTheme].motifType} size={16} />
              </span>
            </div>
          </div>

          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTheme={selectedTheme}
            onSelectTheme={setSelectedTheme}
            counts={categoryCounts}
            resultCount={filteredEntries.length}
          />

          <div className="entries-grid">
            {loading ? (
              /* Until the fetch settles there is nothing to conclude: saying
                 "no entries" would read as an empty archive. */
              <div className="empty-state">
                <p className="empty-state-title">
                  {t({ en: 'Loading entries…', km: 'កំពុងផ្ទុកកំណត់ត្រា…' })}
                </p>
              </div>
            ) : filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onSelect={setOpenEntry} />
              ))
            ) : (
              <div className="empty-state">
                <p className="empty-state-title">
                  {t({ en: 'No entries found', km: 'រកមិនឃើញកំណត់ត្រា' })}
                </p>
                <p className="empty-state-hint">
                  {t({ en: 'Try a different search term', km: 'សូមសាកល្បងពាក្យស្វែងរកផ្សេង' })}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <EntryDetailModal
        entry={openEntry}
        onClose={() => setOpenEntry(null)}
        shareHref={openEntry ? buildHref(openEntry.id) : null}
      />
    </div>
  );
}
