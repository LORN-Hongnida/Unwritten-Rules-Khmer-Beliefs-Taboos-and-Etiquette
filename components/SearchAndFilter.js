'use client';

import themes, { THEME_ORDER } from "../data/themes.js";
import { ThemeVibeIcon } from "./KbachMotifs";

const PILL_LABELS = {
  all: { en: "All", km: "ទាំងអស់" },
  etiquette: { en: "Etiquette", km: "សុជីវធម៌" },
  beliefs: { en: "Beliefs", km: "ជំនឿ" },
  taboos: { en: "Taboos", km: "ការហាមប្រាម" },
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path
        d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SearchAndFilter({
  searchTerm,
  onSearchChange,
  selectedTheme,
  onSelectTheme,
  counts,
  resultCount,
}) {
  const hasFilters = searchTerm !== "" || selectedTheme !== "all";

  return (
    <section className="search-filter">
      <div className="search-row">
        <span className="search-icon" aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          type="search"
          className="search-input"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by English, Khmer (ឧ. ក្អែក, ត្រី, ក្បាល), or origin..."
          aria-label="Search the archive"
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear"
            onClick={() => onSearchChange("")}
            title="Clear search"
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      <div className="filter-block">
        <p className="filter-label">
          <FilterIcon />
          <span>Category (ជំពូក)</span>
        </p>

        <div className="filter-pills">
          {THEME_ORDER.map((key) => {
            const isActive = selectedTheme === key;
            return (
              <button
                key={key}
                type="button"
                className={`filter-pill ${isActive ? "is-active" : ""}`}
                onClick={() => onSelectTheme(key)}
                aria-pressed={isActive}
              >
                {isActive && <ThemeVibeIcon motif={themes[key].motifType} size={12} />}
                <span>{PILL_LABELS[key].en}</span>
                <span className="filter-pill-km" lang="km">
                  {PILL_LABELS[key].km}
                </span>
                <span className="filter-pill-count">{counts[key]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-status">
        <span>
          Showing <strong>{resultCount}</strong>{" "}
          {resultCount === 1 ? "tradition" : "traditions"}
        </span>

        {hasFilters && (
          <button
            type="button"
            className="filter-reset"
            onClick={() => {
              onSearchChange("");
              onSelectTheme("all");
            }}
          >
            Reset filters (សម្អាតតម្រង)
          </button>
        )}
      </div>
    </section>
  );
}
