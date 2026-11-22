'use client';

import Link from "next/link";
import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard";
import SiteNav from "../components/SiteNav";
import HeroSection from "../components/HeroSection";
import EntryDetailModal from "../components/EntryDetailModal";
import ThemeAtmosphereBackdrop from "../components/ThemeAtmosphereBackdrop";
import themes from "../data/themes.js";
import { ThemeVibeIcon } from "../components/KbachMotifs";
import { useTheme } from "../components/ThemeProvider";
import { useLanguage } from "../components/LanguageProvider";
import useEntryRoute from "../components/useEntryRoute";
import useEntries from "../components/useEntries";

// The home grid is a sample; the full collection lives on the browse page.
const HOME_SAMPLE_SIZE = 6;

export default function Home() {
  const { t } = useLanguage();
  const { selectedTheme, setSelectedTheme, isDark, toggleMode } = useTheme();
  const { entries, loading } = useEntries();
  const { openEntry, setOpenEntry, buildHref } = useEntryRoute(entries);

  const categoryCount = new Set(entries.map((entry) => entry.category)).size;

  // The theme doubles as a category filter: picking a theme narrows the
  // archive to that category, and "all" leaves it whole.
  const themedEntries =
    selectedTheme === 'all'
      ? entries
      : entries.filter((entry) => entry.category === selectedTheme);

  // The home page is a window onto the archive, not the archive itself.
  const shownEntries = themedEntries.slice(0, HOME_SAMPLE_SIZE);

  const scrollToArchive = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .querySelector("#archive-entries")
      .scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  const scrollToTop = (e) => {
    e.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    if (history.replaceState) {
      history.replaceState(null, "", window.location.pathname);
    }
  };



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

      <HeroSection
        entryCount={themedEntries.length}
        categoryCount={categoryCount}
        curator={collection.curator}
        onBrowse={scrollToArchive}
        selectedTheme={selectedTheme}
      />

      <div className="portal-container">
        <div className="portal-grid">

          <main className="main-panel" />

        </div>

        <section className="entries-section" id="archive-entries">
          <div className="entries-header">
            <div className="entries-heading">
              <div className="entries-heading-top">
                <span className="entries-motif" aria-hidden="true">
                  <ThemeVibeIcon motif={themes[selectedTheme].motifType} size={20} />
                </span>
                <h2 className="entries-title">
                  {t({ en: themes[selectedTheme].nameEn, km: themes[selectedTheme].nameKm })}
                </h2>
              </div>
              <p className="entries-subtitle">
                <span className="entries-subtitle-count">
                  {t({
                    en: `Showing ${shownEntries.length} of ${themedEntries.length}`,
                    km: `បង្ហាញ ${shownEntries.length} ក្នុងចំណោម ${themedEntries.length}`,
                  })}
                </span>
              </p>
            </div>

            {/* The home page shows a sample; the full collection lives on the
                Browse Archive page. The theme rides along, so this reads as
                "see the rest of these" rather than a reset. */}
            <Link
              href={
                selectedTheme === "all" ? "/browse" : `/browse?theme=${selectedTheme}`
              }
              className="entries-browse-link"
            >
              <span>{t({ en: 'Browse the archive', km: 'រុករកបណ្ណសារ' })}</span>
              <span className="entries-browse-arrow" aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="entries-grid">
            {loading ? (
              /* Until the fetch settles there is nothing to conclude: saying
                 "no entries" would read as an empty archive. */
              <div className="empty-state">
                <p className="empty-state-title">
                  {t({ en: 'Loading entries…', km: 'កំពុងផ្ទុកកំណត់ត្រា…' })}
                </p>
              </div>
            ) : shownEntries.length > 0 ? (
              shownEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onSelect={setOpenEntry} />
              ))
            ) : (
              <div className="empty-state">
                <p className="empty-state-title">
                  {t({ en: 'No entries found', km: 'រកមិនឃើញកំណត់ត្រា' })}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="site-footer" id="academic-note">
        <div className="site-footer-inner">
          <div className="site-footer-columns">
            <div className="site-footer-col">
              <div className="site-footer-crest">
                <span className="site-footer-motif" aria-hidden="true">
                  <ThemeVibeIcon motif={themes[selectedTheme].motifType} size={20} />
                </span>
                <span className="site-footer-khmer" lang="km">
                  បណ្ណសារទំនៀមទម្លាប់ខ្មែរ
                </span>
              </div>

              <p className="site-footer-wordmark">{collection.name}</p>

              <p className="site-footer-dedication">
                {t({
                  en: 'Dedicated with gratitude to the grandmothers, grandfathers, and oral storytellers who preserved these customs.',
                  km: 'ឧទ្ទិសដោយការដឹងគុណចំពោះលោកយាយ លោកតា និងអ្នកនិទានរឿងតាមមាត់ ដែលបានថែរក្សាទំនៀមទម្លាប់ទាំងនេះ។',
                })}
              </p>
            </div>

            <div className="site-footer-col site-footer-col-academic">
              <h3 className="site-footer-col-title">{t({ en: 'Academic Note', km: 'កំណត់សម្គាល់សិក្សា' })}</h3>
              <p className="site-footer-institution">
                American University of Phnom Penh
              </p>
              <p className="site-footer-course">
                ICT 340 — Vibe Coding Project (Fall 2026)
              </p>
              <p className="site-footer-source">{collection.source.trim()}</p>
            </div>
          </div>

          <div className="site-footer-bottom">
            <p className="site-footer-copyright">
              © 2026 {collection.name}. {t({ en: 'Curated by', km: 'រៀបចំដោយ' })} <strong>{collection.curator}</strong>.
            </p>
            <a href="#top" className="site-footer-top" onClick={scrollToTop}>
              {t({ en: 'Back to top', km: 'ត្រឡប់ទៅខាងលើ' })} ↑
            </a>
          </div>
        </div>
      </footer>
      </div>

      <EntryDetailModal
        entry={openEntry}
        onClose={() => setOpenEntry(null)}
        shareHref={openEntry ? buildHref(openEntry.id) : null}
      />
    </div>
  );
}

