'use client';

import { useState } from "react";
import { ThemeVibeIcon } from "./KbachMotifs";

// Scrolls to an element, honouring a reader's reduced-motion preference.
function scrollToTarget(target) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}

export default function SiteNav({ links, motif = "lotus" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (e) => {
    setIsMenuOpen(false);

    const id = e.currentTarget.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    scrollToTarget(target);
    if (history.replaceState) history.replaceState(null, "", id);
  };

  const handleBrandClick = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    if (history.replaceState) {
      history.replaceState(null, "", window.location.pathname);
    }
  };

  return (
    <nav className="site-nav" aria-label="Primary">
      <div className="site-nav-inner">
        <a href="#top" className="site-nav-brand" onClick={handleBrandClick}>
          <span className="site-nav-mark" aria-hidden="true">
            <ThemeVibeIcon motif={motif} size={20} />
          </span>
          <span className="site-nav-wordmark">
            <strong>Unwritten Rules</strong>
            <small>Khmer beliefs, taboos and etiquette</small>
          </span>
        </a>

        <button
          type="button"
          className={`site-nav-burger ${isMenuOpen ? "is-open" : ""}`}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`site-nav-links ${isMenuOpen ? "is-open" : ""}`}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="site-nav-link"
              onClick={handleNavClick}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
