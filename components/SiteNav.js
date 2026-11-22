'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeVibeIcon } from "./KbachMotifs";
import UserNavAuth from "./UserNavAuth";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "./LanguageProvider";


// Inline icons; the reference uses lucide-react, which is not a dependency here.
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <path
        d="M12 1.5v3M12 19.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1.5 12h3M19.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
import themes from "../data/themes.js";

// The same on every page: a nav that changes per route is disorienting.
const NAV_LINKS = [
  // Khmer written as Khmer, not \u escapes, so it can be proofread in review.
  // Same spellings the rest of the site already uses.
  { href: "/", labelEn: "Home", labelKm: "\u1791\u17c6\u1796\u17d0\u179a\u178a\u17be\u1798" },
  { href: "/browse", labelEn: "Browse Archive", labelKm: "\u179a\u17bb\u1780\u179a\u1780\u1794\u178e\u17d2\u178e\u179f\u17b6\u179a" },
  { href: "/contribute", labelEn: "Contribute", labelKm: "\u179a\u17bd\u1798\u1785\u17c6\u178e\u17c2\u1780" },
];

// Moving between pages keeps the chosen theme: picking "Taboos" and then
// navigating is a continuation of that browse, not a new one. "all" is the
// default, so it is left off to keep the URL clean.
function withTheme(href, theme) {
  return theme === "all" ? href : `${href}?theme=${theme}`;
}

// Scrolls to an element, honouring a reader's reduced-motion preference.
function scrollToTarget(target) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}

export default function SiteNav({
  selectedTheme = "all",
  onSelectTheme,
  isDark = true,
  onToggleMode,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, t } = useLanguage();
  const pathname = usePathname();

  const motif = themes[selectedTheme].motifType;

  const handleNavClick = (e) => {
    setIsMenuOpen(false);

    // Route links (/browse) navigate normally; only in-page anchors scroll.
    const href = e.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    scrollToTarget(target);
    if (history.replaceState) history.replaceState(null, "", href);
  };

  const handleBrandClick = (e) => {
    setIsMenuOpen(false);

    // Already home: scroll to the top instead of a no-op navigation.
    // Anywhere else, let the Link route back to "/".
    if (window.location.pathname !== "/") return;

    e.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <nav className="site-nav" aria-label="Primary">
      <div className="site-nav-inner">
        <Link
          href={withTheme("/", selectedTheme)}
          className="site-nav-brand"
          onClick={handleBrandClick}
        >
          <span className="site-nav-mark" aria-hidden="true">
            <ThemeVibeIcon motif={motif} size={20} />
          </span>
          <span className="site-nav-wordmark">
            <strong>{t({ en: 'Unwritten Rules', km: 'ច្បាប់មិនចែង' })}</strong>
            <small>{t({ en: 'Khmer beliefs, taboos and etiquette', km: 'ជំនឿ ការហាមប្រាម និងសុជីវធម៌ខ្មែរ' })}</small>
          </span>
        </Link>

        <div className="site-nav-actions">
          {/* The theme picker is in the account menu (or beside Sign In when
              signed out), so this group is display settings and the account. */}
          <button
            type="button"
            className="site-nav-mode-toggle"
            onClick={onToggleMode}
            title={
              isDark
                ? t({ en: "Switch to light mode", km: "ប្តូរទៅពន្លឺថ្ងៃ" })
                : t({ en: "Switch to dark mode", km: "ប្តូរទៅរាត្រី" })
            }
            aria-label={t({ en: "Toggle light and dark mode", km: "ប្តូររវាងពន្លឺ និងងងឹត" })}
          >
            {isDark ? <MoonIcon /> : <SunIcon />}
            <span className="site-nav-mode-label">
              {isDark ? t({ en: "Dark", km: "ងងឹត" }) : t({ en: "Light", km: "ភ្លឺ" })}
            </span>
          </button>

          <LanguageToggle />
          <UserNavAuth
            selectedTheme={selectedTheme}
            onSelectTheme={onSelectTheme}
            onNavClick={() => setIsMenuOpen(false)}
          />
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
        </div>

        <div className={`site-nav-links ${isMenuOpen ? "is-open" : ""}`}>
          {NAV_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a
                key={link.href}
                href={link.href}
                className="site-nav-link"
                onClick={handleNavClick}
              >
                {language === "km" ? link.labelKm : link.labelEn}
              </a>
            ) : (
              <Link
                key={link.href}
                href={withTheme(link.href, selectedTheme)}
                // Matched on the bare path: the theme param is carried along
                // but has no say in which page is the current one.
                className={`site-nav-link ${pathname === link.href ? "is-active" : ""}`}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {language === "km" ? link.labelKm : link.labelEn}
              </Link>
            )
          )}
        </div>

      </div>
    </nav>
  );
}
