'use client';

import { useEffect, useRef } from "react";
import themes, { THEME_ORDER } from "../data/themes.js";
import { ThemeVibeIcon } from "./KbachMotifs";

// Inline icons: the reference uses lucide-react, which this project does not
// carry as a dependency.
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


// Short labels for the menu; the full names live in data/themes.js.
const SHORT_LABELS = {
  all: { en: "All Traditions", km: "ទាំងអស់" },
  etiquette: { en: "Khmer Etiquette", km: "សុជីវធម៌" },
  beliefs: { en: "Khmer Beliefs", km: "ជំនឿ" },
  taboos: { en: "Khmer Taboos", km: "ការហាមប្រាម" },
};

export default function ThemeDropdown({ isOpen, onClose, selectedTheme, onSelectTheme }) {
  const dropdownRef = useRef(null);

  // Close on Escape or a click outside the panel.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="theme-dropdown" ref={dropdownRef} role="menu">
      <div className="theme-dropdown-header">
        <span className="theme-dropdown-title">Theme &amp; Category</span>
        <span className="theme-dropdown-title-km" lang="km">
          រចនាបថ
        </span>
      </div>

      <div className="theme-dropdown-list">
        {THEME_ORDER.map((key) => {
          const isSelected = selectedTheme === key;
          return (
            <button
              key={key}
              type="button"
              role="menuitemradio"
              aria-checked={isSelected}
              className={`theme-option ${isSelected ? "is-selected" : ""}`}
              onClick={() => {
                onSelectTheme(key);
                onClose();
              }}
            >
              <span className="theme-option-main">
                <ThemeVibeIcon motif={themes[key].motifType} size={15} />
                <span className="theme-option-labels">
                  <span className="theme-option-en">{SHORT_LABELS[key].en}</span>
                  <span className="theme-option-km" lang="km">
                    {SHORT_LABELS[key].km}
                  </span>
                </span>
              </span>
              {isSelected && (
                <span className="theme-option-check">
                  <CheckIcon />
                </span>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
