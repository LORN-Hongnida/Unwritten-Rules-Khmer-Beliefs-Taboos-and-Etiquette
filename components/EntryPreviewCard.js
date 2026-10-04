'use client';

import { ThemeVibeIcon } from "./KbachMotifs";

const CATEGORY_BADGES = {
  etiquette: { motif: "crown", labelEn: "Etiquette", labelKm: "សុជីវធម៌" },
  beliefs: { motif: "lantern", labelEn: "Belief", labelKm: "ជំនឿ" },
  taboos: { motif: "moon", labelEn: "Taboo", labelKm: "ការហាមប្រាម" },
};

export default function EntryPreviewCard({
  title,
  titleKm,
  category = 'beliefs',
  description,
  contributor,
  place,
  photoPreviewUrl
}) {
  const badge = CATEGORY_BADGES[category] || CATEGORY_BADGES.beliefs;
  const motif = badge.motif;

  return (
    <div className="entry-card" data-category={category} style={{ cursor: 'default' }}>
      <div className="entry-card-body">
        <div className="entry-card-header">
          <span className="entry-card-badge">
            <ThemeVibeIcon motif={motif} size={11} />
            <span className="entry-card-badge-km" lang="km">
              {badge.labelKm}
            </span>
          </span>
          <span className="entry-card-badge-en">{badge.labelEn}</span>
        </div>

        <div className="entry-card-banner">
          <div className="entry-card-banner-main">
            <span className="entry-card-medallion" aria-hidden="true">
              <ThemeVibeIcon motif={motif} size={18} />
            </span>
            <span className="entry-card-banner-title" lang="km">
              {titleKm || 'ចំណងជើងភាសាខ្មែរ...'}
            </span>
          </div>
        </div>

        {photoPreviewUrl && (
          <div className="entry-card-photo" style={{ margin: '12px 0 4px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <img
              src={photoPreviewUrl}
              alt="Preview"
              style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        <h4 className="entry-card-title">{title || 'Entry Title (English)...'}</h4>

        <p className="entry-card-text">
          <strong>Traditional belief: </strong>
          {description || 'Entry description will appear here as you type...'}
        </p>

        <div className="entry-card-footer">
          <span className="entry-card-place">
            <span>{contributor || 'Your Name / Source'} • {place || 'Location'}</span>
          </span>
          <span className="entry-card-explore">
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview</span>
          </span>
        </div>
      </div>
    </div>
  );
}
