'use client';

import { KbachCorner, KhmerFriezeBorder, ThemeVibeIcon } from "./KbachMotifs";
import themes from "../data/themes.js";

export default function HeroSection({
  entryCount,
  categoryCount,
  curator,
  onBrowse,
  selectedTheme = "all",
}) {
  const theme = themes[selectedTheme];
  const motif = theme.motifType;
  const copy = theme.hero;

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
          <h2 lang="km">{copy.titleKm}</h2>
          <span className="hero-motif hero-motif-flipped" aria-hidden="true">
            <ThemeVibeIcon motif={motif} size={28} />
          </span>
        </div>

        <p className="hero-khmer-subtitle" lang="km">
          {copy.subtitleKm}
        </p>

        <h1 className="hero-title">
          {copy.titleEn}
          <span className="hero-title-sub">{copy.subtitleEn}</span>
        </h1>

        <p className="hero-description">{copy.description}</p>

        <div className="hero-actions">
          <button type="button" className="hero-cta hero-cta-primary" onClick={onBrowse}>
            <span>Browse Archive ({entryCount})</span>
            <span className="hero-cta-arrow" aria-hidden="true">→</span>
          </button>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <strong>{entryCount}</strong>
            <span>Preserved Traditions</span>
          </div>
          <span className="hero-stat-dot" aria-hidden="true">•</span>
          <div className="hero-stat">
            <strong>{categoryCount}</strong>
            <span>Cultural Categories</span>
          </div>
          <span className="hero-stat-dot" aria-hidden="true">•</span>
          <div className="hero-stat">
            <span>Curated by {curator}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
