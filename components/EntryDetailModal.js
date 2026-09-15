'use client';

import { useEffect, useRef, useState } from "react";
import {
  KbachCorner,
  KbachDivider,
  KhmerFriezeBorder,
  ThemeVibeIcon,
} from "./KbachMotifs";

// Same vocabulary as the cards, so an entry reads identically in both places.
const CATEGORY_META = {
  etiquette: { motif: "crown", labelEn: "Etiquette", labelKm: "សុជីវធម៌" },
  beliefs: { motif: "lantern", labelEn: "Belief", labelKm: "ជំនឿ" },
  taboos: { motif: "moon", labelEn: "Taboo", labelKm: "ការហាមប្រាម" },
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <circle cx="18" cy="5" r="2.5" fill="currentColor" />
      <circle cx="6" cy="12" r="2.5" fill="currentColor" />
      <circle cx="18" cy="19" r="2.5" fill="currentColor" />
      <path
        d="M8.2 10.8 15.8 6.6M8.2 13.2l7.6 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

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

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
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

export default function EntryDetailModal({ entry, onClose, shareHref }) {
  // Result of the last copy attempt: "link" | "failed" | null.
  const [copied, setCopied] = useState(null);
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  // onClose is now a router call, so its identity changes every render. Holding
  // it in a ref keeps the effect below from tearing down the focus trap and
  // stealing focus back mid-read.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Escape to close, Tab kept inside the dialog, and the page behind it frozen.
  // Keyed to the entry's id rather than the object so a re-render that produces
  // an equal-but-new entry does not reset focus.
  const entryId = entry?.id ?? null;

  useEffect(() => {
    if (!entryId) return;

    previouslyFocused.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.querySelector("button")?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [entryId]);

  if (!entry) return null;

  const meta = CATEGORY_META[entry.category];
  const motif = meta.motif;

  const shareUrl = shareHref
    ? new URL(shareHref, window.location.origin).href
    : null;

  // The link alone, so it can go straight into an address bar or a chat box.
  //
  // Only confirm on an actual write: clipboard access can be refused (it needs a
  // secure context), and a "Copied" that copied nothing is worse than an error.
  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      setCopied("failed");
      setTimeout(() => setCopied(null), 2500);
      return;
    }
    setCopied("link");
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-modal-title"
    >
      {/* The modal wears the entry's own category colours, not the page theme. */}
      <div className="modal-panel" data-category={entry.category} ref={panelRef}>
        <div className="modal-frieze" aria-hidden="true">
          <KhmerFriezeBorder motif={motif} height={10} />
        </div>
        <div className="modal-corner modal-corner-tl" aria-hidden="true">
          <KbachCorner position="top-left" size={34} motif={motif} />
        </div>
        <div className="modal-corner modal-corner-tr" aria-hidden="true">
          <KbachCorner position="top-right" size={34} motif={motif} />
        </div>

        <div className="modal-frieze modal-frieze-bottom" aria-hidden="true">
          <KhmerFriezeBorder motif={motif} height={8} />
        </div>
        <div className="modal-corner modal-corner-bl" aria-hidden="true">
          <KbachCorner position="bottom-left" size={28} motif={motif} />
        </div>
        <div className="modal-corner modal-corner-br" aria-hidden="true">
          <KbachCorner position="bottom-right" size={28} motif={motif} />
        </div>

        <div className="modal-nav">
          <span className="modal-category-group">
            <span className="modal-category">
              <ThemeVibeIcon motif={motif} size={11} />
              <span className="modal-category-km" lang="km">
                {meta.labelKm}
              </span>
            </span>
            <span className="modal-category-en">{meta.labelEn}</span>
          </span>

          <div className="modal-nav-actions">
            <button
              type="button"
              className="modal-share"
              onClick={handleShare}
              title="Copy a link to this entry"
            >
              {copied === "link" ? <CheckIcon /> : <ShareIcon />}
              <span>
                {copied === "link"
                  ? "Copied"
                  : copied === "failed"
                    ? "Failed"
                    : "Share"}
              </span>
            </button>

            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              title="Close (Esc)"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-heading">
            <div className="modal-title-row">
              <span className="modal-title-motif" aria-hidden="true">
                <ThemeVibeIcon motif={motif} size={24} />
              </span>
              <h2 id="entry-modal-title" className="modal-title-km" lang="km">
                {entry.titleKm}
              </h2>
              <span className="modal-title-motif is-flipped" aria-hidden="true">
                <ThemeVibeIcon motif={motif} size={24} />
              </span>
            </div>
            <h3 className="modal-title">{entry.title}</h3>
          </div>

          <KbachDivider />

          <div className="modal-panels">
            <section className="modal-panel-card modal-panel-belief">
              <span className="modal-panel-watermark" aria-hidden="true">
                <ThemeVibeIcon motif={motif} size={64} />
              </span>
              <div className="modal-panel-head">
                <span className="modal-panel-icon" aria-hidden="true">
                  <ThemeVibeIcon motif={motif} size={16} />
                </span>
                <h4>Stated Traditional Belief</h4>
              </div>
              <p className="modal-panel-text">{entry.description}</p>
            </section>

            {entry.reason && (
              <section className="modal-panel-card modal-panel-origin">
                <span className="modal-panel-watermark" aria-hidden="true">
                  <ThemeVibeIcon motif={motif} size={64} />
                </span>
                <div className="modal-panel-head">
                  <span className="modal-panel-icon" aria-hidden="true">
                    <ThemeVibeIcon motif={motif} size={16} />
                  </span>
                  <h4>Practical Origin</h4>
                </div>
                <p className="modal-panel-text">{entry.reason}</p>
              </section>
            )}
          </div>

          <section className="modal-belief-status">
            <h4>Still believed today?</h4>
            <p>{entry.stillBelieved}</p>
          </section>

          <div className="modal-contributor">
            <div className="modal-contributor-main">
              <span className="modal-avatar" aria-hidden="true">
                <PersonIcon />
              </span>
              <div>
                <p className="modal-contributor-role">Contributor</p>
                <p className="modal-contributor-name">{entry.contributor}</p>
              </div>
            </div>

            <span className="modal-contributor-place">{entry.place}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-footer-close" onClick={onClose}>
            Close • បិទ
          </button>
        </div>
      </div>
    </div>
  );
}
