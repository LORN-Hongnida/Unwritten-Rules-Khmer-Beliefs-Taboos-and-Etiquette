'use client';

import { useState, useEffect } from "react";
import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard";

const entries = [
  {
    title: "Crows crying over a rooftop",
    description:
      "This means a misfortune is coming; precisely, death is said to follow this event. So Cambodian people are always cautious and hate it when this is happening.",
    reason: null,
    contributor: "Heng Vicheka",
    category: "Uncategorized",
    stillBelieved: "Some people still believe in this — and this includes me.",
  },
  {
    title: "Eating the tail part of a fish makes you know how to swim",
    description:
      "This is commonly told to children who can't swim: if they eat the tail of a fish, they'll be able to swim.",
    reason:
      "It was used by adults to convince children to eat the tail part of a fish, since it is not the delicious part — the most delicious is said to be the head. In conclusion, it is a trick to have children eat what the adults don't want to eat.",
    contributor: "Heng Vicheka",
    category: "Uncategorized",
    stillBelieved: "Not really.",
  },
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Separate thresholds: a single one makes the header flicker when you
    // rest right on it.
    const handleScroll = () => {
      const collapseAt = window.innerHeight - 120;
      const expandAt = window.innerHeight - 220;

      setIsScrolled((wasScrolled) =>
        wasScrolled ? window.scrollY > expandAt : window.scrollY > collapseAt
      );
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToArchive = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .querySelector(".portal-container")
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
      <header className={`portal-header ${isScrolled ? 'scrolled-mode' : 'hero-mode'}`}>
        <div className="header-grain" aria-hidden="true" />

        <div className="header-corners" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="header-container">
          <div className="header-top-row">
            <div className="header-brand">
              <a
                href="#top"
                className="header-kicker"
                onClick={scrollToTop}
                aria-label="Khmer Living Archive — back to top"
              >
                <div className="header-badge">
                  <svg
                    viewBox="0 0 576 512"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M0 80v48c0 17.7 14.3 32 32 32h64V80c0-26.5-21.5-48-48-48S0 53.5 0 80m112-48c10 13.4 16 30 16 48v304c0 35.3 28.7 64 64 64s64-28.7 64-64v-5.3c0-32.4 26.3-58.7 58.7-58.7H480V128c0-53-43-96-96-96zm352 448c61.9 0 112-50.1 112-112c0-8.8-7.2-16-16-16H314.7c-14.7 0-26.7 11.9-26.7 26.7v5.3c0 53-43 96-96 96z"
                    />
                  </svg>
                </div>
                <span>Khmer Living Archive</span>
              </a>

              <div className="header-curator-pill">
                <span>✒ Curated by <strong>{collection.curator}</strong></span>
              </div>
            </div>

            <nav className="header-nav" aria-label="Primary">
              <a href="#archive-scope" className="header-nav-link" onClick={handleNavClick}>Scope</a>
              <a href="#archive-entries" className="header-nav-link" onClick={handleNavClick}>Entries</a>
              <a href="#academic-note" className="header-nav-link" onClick={handleNavClick}>Academic Note</a>
            </nav>
          </div>

          <div className="hero-split">
            <div className="hero-copy">
              <h1 className="portal-title">{collection.name}</h1>
              <p className="portal-khmer-subtitle">បណ្តុំជំនឿ អរិយជំនឿ និងក្បួនច្បាប់មកតៗគ្នារបស់ខ្មែរ</p>
              <p className="portal-description">{collection.description}</p>
            </div>

            <div className="hero-artifact" aria-hidden="true">
              <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="currentColor"
                  d="M60.711 52.708h-.013V11.3h.013c.712 0 1.289-.581 1.289-1.298s-.577-1.298-1.289-1.298h-.99c.193-.393.313-.83.313-1.298a2.93 2.93 0 0 0-2.918-2.938H56.03v-1.3c0-.641-.517-1.161-1.154-1.161c-.635 0-1.151.52-1.151 1.161v1.299h-1.086a2.93 2.93 0 0 0-2.919 2.938c0 .469.119.905.313 1.298h-.99a1.3 1.3 0 0 0-1.079 2.006c-2.93.49-9.125 1.347-16.631 1.347c-5.428 0-10.548-.47-15.297-1.347c.135-.205.214-.45.214-.714c0-.718-.578-1.298-1.289-1.298h-.992c.194-.394.313-.831.313-1.299a2.927 2.927 0 0 0-2.917-2.938h-1.086V3.162A1.16 1.16 0 0 0 9.125 2c-.638 0-1.154.52-1.154 1.162V4.46H6.885c-1.611 0-2.916 1.315-2.916 2.938c0 .469.119.906.313 1.299h-.993C2.577 8.697 2 9.277 2 9.995c0 .716.577 1.298 1.289 1.298h.013V52.7h-.013C2.577 52.7 2 53.281 2 53.997c0 .719.577 1.299 1.289 1.299h.991a2.95 2.95 0 0 0-.312 1.299c0 1.623 1.305 2.938 2.916 2.938H7.97v1.299c0 .642.517 1.162 1.154 1.162s1.153-.521 1.153-1.162v-1.299h1.084a2.93 2.93 0 0 0 2.919-2.938c0-.469-.119-.905-.313-1.299h.992c.69 0 1.252-.55 1.284-1.239c3.187.52 9.226 1.312 16.421 1.312c5.329 0 10.392-.432 15.097-1.277a1.29 1.29 0 0 0 1.28 1.213h.99c-.194.393-.313.83-.313 1.299a2.93 2.93 0 0 0 2.919 2.938h1.086v1.299c0 .641.517 1.161 1.151 1.161c.638 0 1.154-.521 1.154-1.161V59.54h1.086c1.611 0 2.916-1.315 2.916-2.938c0-.469-.119-.906-.312-1.299h.991c.712 0 1.289-.581 1.289-1.299a1.29 1.29 0 0 0-1.287-1.296m-9.783-.937V12.237h7.896V51.77zm-37.856-.008H5.177V12.231h7.896v39.532zm1.875.166V12.441c5.062.989 10.567 1.49 16.385 1.49c8.328 0 15.122-1.045 17.717-1.506v39.514c-5.041 1.032-10.549 1.554-16.384 1.554c-8.597 0-15.513-1.15-17.718-1.564"
                />
                <path
                  fill="currentColor"
                  d="M31.998 17.816c-8.457 0-13.089-1.373-13.135-1.386l-.273.897c.192.058 4.795 1.427 13.408 1.427c9.195 0 13.639-1.37 13.822-1.428l-.281-.894c-.044.013-4.489 1.384-13.541 1.384m0 4.282c-8.457 0-13.089-1.373-13.135-1.386l-.273.897c.192.058 4.795 1.426 13.408 1.426c9.195 0 13.639-1.37 13.822-1.428l-.281-.894c-.044.014-4.489 1.385-13.541 1.385m0 4.281c-8.457 0-13.089-1.372-13.135-1.386l-.273.897c.192.058 4.795 1.426 13.408 1.426zm0 8.562c-2.291 0-4.509-.1-6.592-.297l-.088.934c2.111.199 4.359.301 6.68.301c9.195 0 13.638-1.369 13.822-1.428l-.281-.895c-.044.015-4.489 1.385-13.541 1.385m0 4.283c-8.457 0-13.089-1.372-13.135-1.386l-.273.896c.192.059 4.795 1.427 13.408 1.427c9.195 0 13.639-1.37 13.822-1.429l-.281-.893c-.044.015-4.489 1.385-13.541 1.385m0 4.282c-8.457 0-13.089-1.373-13.135-1.387l-.273.897c.192.058 4.795 1.427 13.408 1.427c9.195 0 13.639-1.37 13.822-1.429l-.281-.894c-.044.015-4.489 1.386-13.541 1.386M18.59 47.298c.192.058 4.795 1.426 13.408 1.426v-.938c-8.457 0-13.089-1.372-13.135-1.386z"
                />
              </svg>
            </div>
          </div>
        </div>

        {!isScrolled && (
          <div className="hero-scroll-indicator" onClick={scrollToArchive}>
            <span>Enter the Archive</span>
            <span className="scroll-arrow">↓</span>
          </div>
        )}
      </header>

      {/* Reserves the absolutely-positioned hero's height in normal flow */}
      <div className="hero-spacer" />

      <div className="portal-container">
        <div className="portal-grid">

          <main className="main-panel">
            <section className="description-section" id="archive-scope">
              <span className="section-label">Archive Scope / អំពីបណ្ណសារ</span>
              <p className="archive-description">{collection.description}</p>
            </section>

            <div className="meta-grid">
              <div className="info-card">
                <p className="card-label">Curated by</p>
                <p className="card-value">{collection.curator}</p>
              </div>
              <div className="info-card">
                <p className="card-label">Source</p>
                <p className="card-value">{collection.source}</p>
              </div>
            </div>
          </main>

          <aside className="sidebar-panel">
            <div className="status-card">
              <span className="status-number">{entries.length}</span>
              <p className="status-counter-text">
                {entries.length === 1
                  ? "entry in the archive"
                  : "entries in the archive"}
              </p>
            </div>
          </aside>

        </div>

        <section className="entries-section" id="archive-entries">
          <div className="entries-header">
            <h2 className="entries-title">Archive Entries / កំណត់ត្រា</h2>
            <span className="entries-count">
              {entries.length} recorded{" "}
              {entries.length === 1 ? "belief" : "beliefs"}
            </span>
          </div>

          <div className="entries-list">
            {entries.map((entry) => (
              <EntryCard key={entry.title} entry={entry} />
            ))}
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

