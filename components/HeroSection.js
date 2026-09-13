'use client';

// Small lotus motif, mirrored on the right of the Khmer title.
function LotusMotif() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.5c1.9 2.2 2.9 4.3 2.9 6.2c0 1.6-.8 3-2.2 4.2v7.6h-1.4v-7.6C9.9 11.7 9.1 10.3 9.1 8.7c0-1.9 1-4 2.9-6.2m0 2.6c-.9 1.3-1.4 2.5-1.4 3.6c0 .9.4 1.7 1.4 2.5c1-.8 1.4-1.6 1.4-2.5c0-1.1-.5-2.3-1.4-3.6M5.5 9.4c1.6.5 2.8 1.3 3.5 2.3c.6.9.8 1.9.6 3c-1.1.2-2.1 0-3-.6c-1-.7-1.8-1.9-2.3-3.5zm13 0l1.2 1.2c-.5 1.6-1.3 2.8-2.3 3.5c-.9.6-1.9.8-3 .6c-.2-1.1 0-2.1.6-3c.7-1 1.9-1.8 3.5-2.3"
      />
    </svg>
  );
}

export default function HeroSection({ collection, entryCount, categoryCount, onBrowse }) {
  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-khmer-title">
          <span className="hero-motif" aria-hidden="true">
            <LotusMotif />
          </span>
          <h2 lang="km">បណ្ណសារទំនៀមទម្លាប់ខ្មែរ</h2>
          <span className="hero-motif hero-motif-flipped" aria-hidden="true">
            <LotusMotif />
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
            <span>Curated by {collection.curator}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
