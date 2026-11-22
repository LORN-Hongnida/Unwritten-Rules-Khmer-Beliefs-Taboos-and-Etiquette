'use client';

import Link from "next/link";
import { KbachCorner, KhmerFriezeBorder, ThemeVibeIcon } from "./KbachMotifs";
import { useLanguage } from "./LanguageProvider";
import themes from "../data/themes.js";

export default function HeroSection({
  entryCount,
  categoryCount,
  curator,
  onBrowse,
  selectedTheme = "all",
}) {
  const { language, t } = useLanguage();
  const theme = themes[selectedTheme];
  const motif = theme.motifType;
  const copy = theme.hero;

  // The big title is in the reader's language; the smaller line above it is
  // the other language, so the hero always carries both and they swap places
  // when the toggle is pressed.
  const km = { title: copy.titleKm, subtitle: copy.subtitleKm, lang: "km" };
  const en = { title: copy.titleEn, subtitle: copy.subtitleEn, lang: "en" };
  const main = language === "km" ? km : en;
  const top = language === "km" ? en : km;

  return (
    <header className="hero">
      <div className="hero-frieze" aria-hidden="true">
        <KhmerFriezeBorder motif={motif} height={10} />
      </div>

      <div className="hero-corner hero-corner-left" aria-hidden="true">
        <KbachCorner position="top-left" size={44} motif={motif} />
      </div>
      <div className="hero-corner hero-corner-right" aria-hidden="true">
        <KbachCorner position="top-right" size={44} motif={motif} />
      </div>

      <div className="hero-inner">
        <div className="hero-khmer-title">
          <span className="hero-motif" aria-hidden="true">
            <ThemeVibeIcon motif={motif} size={28} />
          </span>
          <h2 lang={top.lang}>{top.title}</h2>
          <span className="hero-motif hero-motif-flipped" aria-hidden="true">
            <ThemeVibeIcon motif={motif} size={28} />
          </span>
        </div>

        <p className="hero-khmer-subtitle" lang={top.lang}>
          {top.subtitle}
        </p>

        <h1 className="hero-title" lang={main.lang}>
          {main.title}
          <span className="hero-title-sub">{main.subtitle}</span>
        </h1>

        <p className="hero-description">{t({ en: copy.description, km: copy.descriptionKm })}</p>

        <div className="hero-actions">
          <button type="button" className="hero-cta hero-cta-primary" onClick={onBrowse}>
            <span>{t({ en: 'Browse Archive', km: 'រុករកបណ្ណសារ' })} ({entryCount})</span>
            <span className="hero-cta-arrow" aria-hidden="true">→</span>
          </button>
          {/* Second, outlined: browsing is what most visitors came for, and
              contributing is the invitation beside it. Keeps the theme, like
              the nav's links do. */}
          <Link
            href={selectedTheme === "all" ? "/contribute" : `/contribute?theme=${selectedTheme}`}
            className="hero-cta hero-cta-secondary"
          >
            {/* Drawn rather than typed: a "+" character sits on the text
                baseline, which is not where the eye expects the middle of a
                Khmer label. An icon is centred by the flex row instead. */}
            <svg className="hero-cta-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"
              fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{t({ en: 'Contribute', km: 'រួមចំណែក' })}</span>
          </Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <strong>{entryCount}</strong>
            <span>{t({ en: 'Preserved Traditions', km: 'ទំនៀមទម្លាប់ដែលបានរក្សាទុក' })}</span>
          </div>
          <span className="hero-stat-dot" aria-hidden="true">•</span>
          <div className="hero-stat">
            <strong>{categoryCount}</strong>
            <span>{t({ en: 'Cultural Categories', km: 'ប្រភេទវប្បធម៌' })}</span>
          </div>
          <span className="hero-stat-dot" aria-hidden="true">•</span>
          <div className="hero-stat">
            <span>{t({ en: 'Curated by', km: 'រៀបចំដោយ' })} {curator}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
