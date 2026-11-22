'use client';

import { useEffect, useRef } from "react";
import themes, { THEME_ORDER } from "../data/themes.js";
import { ThemeVibeIcon } from "./KbachMotifs";
import { useLanguage } from "./LanguageProvider";

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
  all: { en: "All Traditions", km: "ទំនៀមទម្លាប់ទាំងអស់" },
  etiquette: { en: "Khmer Etiquette", km: "សុជីវធម៌ខ្មែរ" },
  beliefs: { en: "Khmer Beliefs", km: "ជំនឿខ្មែរ" },
  taboos: { en: "Khmer Taboos", km: "ការហាមប្រាមខ្មែរ" },
};

// `inline` draws the list as a section of another menu (the account menu)
// rather than as its own popover: always shown, no outside-click handling.
export default function ThemeDropdown({ isOpen, onClose, selectedTheme, onSelectTheme, inline = false }) {
  const dropdownRef = useRef(null);
  const { t } = useLanguage();

  // Close on Escape or a click outside the panel.
  useEffect(() => {
    if (!isOpen || inline) return;

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

  if (!isOpen && !inline) return null;

  return (
    <div className={`theme-dropdown ${inline ? "theme-dropdown-inline" : ""}`} ref={dropdownRef} role={inline ? "group" : "menu"}>
      <div className="theme-dropdown-header">
        <span className="theme-dropdown-title">
          {t({ en: "Theme & Category", km: "រចនាបថ និងប្រភេទ" })}
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
                if (onClose) onClose();
              }}
            >
              <span className="theme-option-main">
                <ThemeVibeIcon motif={themes[key].motifType} size={15} />
                <span className="theme-option-labels">
                  <span className="theme-option-en">{t(SHORT_LABELS[key])}</span>
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
