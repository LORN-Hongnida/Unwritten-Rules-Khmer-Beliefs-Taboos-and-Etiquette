'use client';

import { useState } from "react";
import collection from "../collection.config.js";
import entries from "../data/entries.js";
import EntryCard from "../components/EntryCard";
import SiteNav from "../components/SiteNav";
import HeroSection from "../components/HeroSection";

const NAV_LINKS = [
  { href: "#archive-entries", label: "Browse Archive" },
  { href: "#academic-note", label: "Academic Note" },
];

// Counted from the entries themselves so the hero stat cannot drift.
const CATEGORY_COUNT = new Set(entries.map((entry) => entry.category)).size;

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter entries based on search term: match any field containing the term
  const filteredEntries = entries.filter((entry) => {
    const lowerSearchTerm = searchTerm.trim().toLowerCase();
    if (!lowerSearchTerm) return true;
    return Object.values(entry).some(
      (value) =>
        value != null &&
        value.toString().toLowerCase().includes(lowerSearchTerm)
    );
  });

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
      <SiteNav links={NAV_LINKS} />

      <HeroSection
        collection={collection}
        entryCount={entries.length}
        categoryCount={CATEGORY_COUNT}
        onBrowse={scrollToArchive}
      />

      <div className="portal-container">
        <div className="portal-grid">

          <main className="main-panel" />

        </div>

        <section className="entries-section" id="archive-entries">
          <div className="entries-header">
            <h2 className="entries-title">Archive Entries</h2>
            <span className="entries-count" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'block', margin: '1rem 0' }}>
              {filteredEntries.length} recorded{" "}
              {filteredEntries.length === 1 ? "belief" : "beliefs"}
              {searchTerm && filteredEntries.length !== entries.length && ` (filtered from ${entries.length})`}
            </span>
          </div>

          <div className="search-container" style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Search entries... / ស្វែងរកតារាងការ... / អត្ថបទ ចំណងជើង ទីតាំង អ្នកចូលរួម..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: '0.5rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div className="entries-list">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <EntryCard key={entry.title} entry={entry} />
              ))
            ) : (
              <div className="empty-state" style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#666',
                fontStyle: 'italic',
              }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  No entries found / រកមិនឃើញកំណត់ត្រា
                </p>
                <p style={{ fontSize: '0.9rem' }}>
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
  );
}

