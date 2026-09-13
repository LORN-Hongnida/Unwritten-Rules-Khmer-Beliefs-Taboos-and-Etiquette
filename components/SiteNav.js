'use client';

import { useState } from "react";

// Scrolls to an element, honouring a reader's reduced-motion preference.
function scrollToTarget(target) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}

export default function SiteNav({ links }) {
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
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="currentColor"
                d="M12 2.5c1.9 2.2 2.9 4.3 2.9 6.2c0 1.6-.8 3-2.2 4.2v7.6h-1.4v-7.6C9.9 11.7 9.1 10.3 9.1 8.7c0-1.9 1-4 2.9-6.2m0 2.6c-.9 1.3-1.4 2.5-1.4 3.6c0 .9.4 1.7 1.4 2.5c1-.8 1.4-1.6 1.4-2.5c0-1.1-.5-2.3-1.4-3.6M5.5 9.4c1.6.5 2.8 1.3 3.5 2.3c.6.9.8 1.9.6 3c-1.1.2-2.1 0-3-.6c-1-.7-1.8-1.9-2.3-3.5zm13 0l1.2 1.2c-.5 1.6-1.3 2.8-2.3 3.5c-.9.6-1.9.8-3 .6c-.2-1.1 0-2.1.6-3c.7-1 1.9-1.8 3.5-2.3"
              />
            </svg>
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
