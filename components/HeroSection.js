'use client';

import {
  KbachCorner,
  KhmerFriezeBorder,
  ThemeVibeIcon,
  GoldBracket,
  MicroIlluminatedIcon,
} from "./KbachMotifs";

export default function HeroSection({
  collection,
  entryCount,
  categoryCount,
  onBrowse,
  motif = "lotus",
}) {
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
          <h2 lang="km">បណ្ណសារទំនៀមទម្លាប់ខ្មែរ</h2>
          <span className="hero-motif hero-motif-flipped" aria-hidden="true">
            <ThemeVibeIcon motif={motif} size={28} />
          </span>
        </div>

        <p className="hero-khmer-subtitle" lang="km">
          សីលធម៌ និងទំនៀមទម្លាប់រស់នៅ • ក្បួនច្បាប់មាត់ទទេក្នុងផ្ទះសំបែង
        </p>

        <h1 className="hero-title">
          Unwritten Rules
          <span className="hero-title-sub">Khmer beliefs, taboos and etiquette</span>
        </h1>

        <p className="hero-description">{collection.description}</p>

        <div className="hero-actions">
          <button type="button" className="hero-cta hero-cta-primary" onClick={onBrowse}>
            <MicroIlluminatedIcon motif={motif} />
            <GoldBracket>
              <span>Browse Archive ({entryCount})</span>
            </GoldBracket>
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
            <span>Curated by {collection.curator}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
