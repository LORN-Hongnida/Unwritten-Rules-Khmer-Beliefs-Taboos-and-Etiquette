'use client';

import { ThemeVibeIcon } from "./KbachMotifs";
import { useLanguage } from "./LanguageProvider";

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
  const { t } = useLanguage();
  const badge = CATEGORY_BADGES[category] || CATEGORY_BADGES.beliefs;
  const categoryLabel = t({ en: badge.labelEn, km: badge.labelKm });
  const motif = badge.motif;

  return (
    <div className="entry-card" data-category={category} style={{ cursor: 'default' }}>
      <div className="entry-card-body">
        <div className="entry-card-header">
          <span className="entry-card-badge">
            <ThemeVibeIcon motif={motif} size={11} />
            <span className="entry-card-badge-km">{categoryLabel}</span>
          </span>
        </div>

        {photoPreviewUrl ? (
          <div className="entry-card-photo" style={{ margin: '10px 0 12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <img
              src={photoPreviewUrl}
              alt={t({ en: 'Preview', km: 'មើលជាមុន' })}
              style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : (
          <div className="entry-card-photo-placeholder" style={{ margin: '10px 0 12px' }} aria-hidden="true">
            <div className="photo-placeholder-inner">
              <ThemeVibeIcon motif={motif} size={32} />
              <span className="photo-placeholder-text">
                {categoryLabel}
              </span>
            </div>
          </div>
        )}

        <div className="entry-card-banner">
          <div className="entry-card-banner-main">
            <span className="entry-card-medallion" aria-hidden="true">
              <ThemeVibeIcon motif={motif} size={18} />
            </span>
            <span className="entry-card-banner-title" lang="km">
              {/* Each title placeholder is in its own field's language, in
                  either mode: it previews what that field will hold. */}
              {titleKm || 'ចំណងជើងភាសាខ្មែរ...'}
            </span>
          </div>
        </div>

        <h4 className="entry-card-title">{title || 'Entry Title (English)...'}</h4>

        <p className="entry-card-text">
          <strong>{t({ en: 'Traditional belief', km: 'ជំនឿប្រពៃណី' })}: </strong>
          {description || t({ en: 'Entry description will appear here as you type...', km: 'ការពិពណ៌នានឹងបង្ហាញនៅទីនេះពេលអ្នកវាយ...' })}
        </p>

        <div className="entry-card-footer">
          <span className="entry-card-place">
            <span>{contributor || t({ en: 'Your Name / Source', km: 'ឈ្មោះ / ប្រភព' })} • {place || t({ en: 'Location', km: 'ទីកន្លែង' })}</span>
          </span>
          <span className="entry-card-explore">
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t({ en: 'Preview', km: 'មើលជាមុន' })}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
