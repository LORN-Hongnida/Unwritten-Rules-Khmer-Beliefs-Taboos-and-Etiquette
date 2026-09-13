'use client';

import { KbachCorner, KhmerFriezeBorder, ThemeVibeIcon } from "./KbachMotifs";

// Each category carries its own motif and badge wording, so a card reads as
// belonging to its realm even when the archive is unfiltered.
const CATEGORY_BADGES = {
  etiquette: { motif: "crown", labelEn: "Etiquette", labelKm: "សុជីវធម៌" },
  beliefs: { motif: "lantern", labelEn: "Sacred Belief", labelKm: "ជំនឿក្បួនច្បាប់" },
  taboos: { motif: "moon", labelEn: "Taboo Warning", labelKm: "ការហាមប្រាម" },
};


function ContributorIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EntryCard({ entry, onSelect, actions = null }) {
  const badge = CATEGORY_BADGES[entry.category];
  const motif = badge.motif;

  const renderBanner = () => (
    <div className="entry-card-banner">
      <div className="entry-card-banner-watermark" aria-hidden="true">
        <ThemeVibeIcon motif={motif} size={56} />
      </div>
      <div className="entry-card-banner-main">
        <span className="entry-card-medallion" aria-hidden="true">
          <ThemeVibeIcon motif={motif} size={18} />
        </span>
        <span className="entry-card-banner-title" lang="km">
          {entry.titleKm}
        </span>
      </div>
    </div>
  );

  return (
    <article
      className="entry-card"
      data-category={entry.category}
      onClick={() => onSelect(entry)}
    >
      <div className="entry-card-frieze entry-card-frieze-top" aria-hidden="true">
        <KhmerFriezeBorder motif={motif} height={8} />
      </div>
      <div className="entry-card-frieze entry-card-frieze-bottom" aria-hidden="true">
        <KhmerFriezeBorder motif={motif} height={6} />
      </div>

      <div className="entry-card-corner entry-card-corner-tl" aria-hidden="true">
        <KbachCorner position="top-left" size={24} motif={motif} />
      </div>
      <div className="entry-card-corner entry-card-corner-tr" aria-hidden="true">
        <KbachCorner position="top-right" size={24} motif={motif} />
      </div>
      <div className="entry-card-corner entry-card-corner-bl" aria-hidden="true">
        <KbachCorner position="bottom-left" size={20} motif={motif} />
      </div>
      <div className="entry-card-corner entry-card-corner-br" aria-hidden="true">
        <KbachCorner position="bottom-right" size={20} motif={motif} />
      </div>

      <div className="entry-card-body">
        <div className="entry-card-header">
          <span className="entry-card-badge">
            <ThemeVibeIcon motif={motif} size={11} />
            <span className="entry-card-badge-km" lang="km">
              {badge.labelKm}
            </span>
          </span>
          <span className="entry-card-badge-en">{badge.labelEn}</span>

          <span className="entry-card-actions">{actions}</span>
        </div>

        {/* The Khmer title lives in the banner: it is the card's subject, and
            the banner is its heaviest element. */}
        {renderBanner()}

        <h4 className="entry-card-title">{entry.title}</h4>

        <p className="entry-card-text">
          <strong>Traditional belief: </strong>
          {entry.description}
        </p>

        <div className="entry-card-footer">
          <span className="entry-card-place">
            <ContributorIcon />
            <span>
              {entry.contributor} • {entry.place}
            </span>
          </span>

          <span className="entry-card-explore">
            <span>Explore</span>
            <span className="entry-card-explore-arrow" aria-hidden="true">
              →
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
