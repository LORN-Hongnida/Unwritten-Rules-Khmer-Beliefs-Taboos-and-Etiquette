'use client';

import { useEffect, useState } from "react";
import collection from "../collection.config.js";
import entries from "../data/entries.js";
import EntryCard from "../components/EntryCard";
import SiteNav from "../components/SiteNav";
import HeroSection from "../components/HeroSection";
import EntryDetailModal from "../components/EntryDetailModal";
import ThemeAtmosphereBackdrop from "../components/ThemeAtmosphereBackdrop";
import themes from "../data/themes.js";
import { ThemeVibeIcon } from "../components/KbachMotifs";

const NAV_LINKS = [
  { href: "#archive-entries", label: "Browse Archive" },
  { href: "#academic-note", label: "Academic Note" },
];

// Counted from the entries themselves so the hero stat cannot drift.
const CATEGORY_COUNT = new Set(entries.map((entry) => entry.category)).size;

// The home grid is a sample; the full collection lives on the browse page.
const HOME_SAMPLE_SIZE = 6;

// How many entries sit in each category, for the filter pills.
const categoryCounts = entries.reduce(
  (acc, entry) => ({ ...acc, [entry.category]: (acc[entry.category] || 0) + 1 }),
  { all: entries.length, etiquette: 0, beliefs: 0, taboos: 0 }
);

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [openEntry, setOpenEntry] = useState(null);
  const [isDark, setIsDark] = useState(true);

  // The theme tables in globals.css key off these two attributes, so setting
  // them here retints every surface at once.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', selectedTheme);
    root.setAttribute('data-mode', isDark ? 'dark' : 'light');
  }, [selectedTheme, isDark]);

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

  const handleNavClick = (e) => {
    const id = e.currentTarget.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });

    if (history.replaceState) history.replaceState(null, "", id);
  };


  return (
    <div>
      <ThemeAtmosphereBackdrop selectedTheme={selectedTheme} />

      <div className="page-content">
      <SiteNav
        links={NAV_LINKS}
        selectedTheme={selectedTheme}
        onSelectTheme={setSelectedTheme}
        isDark={isDark}
        onToggleMode={() => setIsDark((dark) => !dark)}
      />

      <HeroSection
        entryCount={themedEntries.length}
        categoryCount={CATEGORY_COUNT}
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
                <h2 className="entries-title" lang="km">
                  {themes[selectedTheme].nameKm}
                </h2>
              </div>
              <p className="entries-subtitle">
                {themes[selectedTheme].nameEn}
                <span className="entries-subtitle-count">
                  {" "}· showing {shownEntries.length} of {themedEntries.length}
                </span>
              </p>
            </div>

            {/* The home page shows a sample; the full collection lives on the
                Browse Archive page. */}
            <a href="#archive-entries" className="entries-browse-link">
              <span>Browse the archive</span>
              <span className="entries-browse-arrow" aria-hidden="true">→</span>
            </a>
          </div>

          <div className="entries-grid">
            {shownEntries.length > 0 ? (
              shownEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onSelect={setOpenEntry} />
              ))
            ) : (
              <div className="empty-state">
                <p className="empty-state-title">No entries found</p>
                <p className="empty-state-title-km" lang="km">
                  រកមិនឃើញកំណត់ត្រា
                </p>
                <p className="empty-state-hint">
                  Try a different search term / សូមសាកល្បងពាក្យស្វែងរកផ្សេង
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="portal-footer">
        <div className="footer-container">
          <div className="footer-top-row">
            <div className="footer-brand">
              <h2 className="footer-title">KHMER LIVING ARCHIVE (បណ្ណសាររស់ខ្មែរ)</h2>
              <p className="footer-subtitle">
                A student-driven digital preservation initiative collecting Cambodian folk beliefs, taboos, and household customs.
              </p>
            </div>
            <div className="footer-academic" id="academic-note">
              <h3 className="footer-institution">American University of Phnom Penh</h3>
              <p className="footer-course">ICT 340 — Vibe Coding Project (Fall 2026)</p>
            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom-row">
            <p className="footer-copyright">
              © 2026 Khmer Living Archive. Curated by <strong>{collection.curator}</strong>. Under construction through December 2026.
            </p>
            <div className="footer-links">
              <a href="#academic-note" className="footer-link" onClick={handleNavClick}>Academic Note</a>
              <span className="footer-link-dot">•</span>
              <a href="#top" onClick={scrollToTop} className="footer-link">Back to top ↑</a>
            </div>
          </div>
        </div>
      </footer>
      </div>

      <EntryDetailModal entry={openEntry} onClose={() => setOpenEntry(null)} />
    </div>
  );
}

