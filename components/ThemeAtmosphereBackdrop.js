'use client';

// Fixed, full-viewport atmosphere behind the whole page. Each theme gets its
// own light, texture and drifting particles, so switching theme changes the
// room you are standing in rather than just the accent colour.
//
// Ported from the reference ThemeAtmosphereBackdrop.tsx. The reference animates
// every particle with motion/react; here the same loops are CSS keyframes with
// a per-particle delay, which needs no dependency and runs off the main thread.
// Particle positions are index-derived exactly as in the reference.

// Math.sin/cos can differ in the last float digit between the server and the
// browser, which React reports as a hydration mismatch. Rounding to 2dp makes
// both sides agree and is far finer than a pixel of travel.
const px = (n) => `${Math.round(n * 100) / 100}px`;
const round2 = (n) => Math.round(n * 100) / 100;

// Etiquette — floating golden silk dust.
function GoldDust() {
  return (
    <div className="atmos-layer">
      <div className="atmos-silk-vignette" />

      <div className="atmos-frieze-watermark">
        <svg viewBox="0 0 800 200" fill="none" aria-hidden="true">
          <path
            d="M50 100 Q 200 20 400 100 T 750 100"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <circle cx="400" cy="100" r="60" stroke="currentColor" strokeWidth="2" />
          <circle cx="400" cy="100" r="30" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={`gold-dust-${i}`}
          className="atmos-dust"
          style={{
            left: `${15 + i * 7}%`,
            bottom: `${20 + i * 6}%`,
            // Same sin/cos waypoints the reference animates between, so each
            // mote follows its own path instead of a shared one.
            "--x1": px(Math.sin(i) * 20),
            "--x2": px(Math.cos(i) * 35),
            "--x3": px(Math.sin(i) * 15),
            "--peak": round2(0.2 + (i % 4) * 0.15),
            animationDuration: `${7 + (i % 4) * 2}s`,
            animationDelay: `${round2(i * 0.6)}s`,
          }}
        />
      ))}
    </div>
  );
}

// Beliefs — kerosene lamp glow and rising hearth embers.
function HearthEmbers() {
  return (
    <div className="atmos-layer">
      <div className="atmos-lamp-glow" />
      <div className="atmos-wood-grain" />

      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={`hearth-ember-${i}`}
          className="atmos-ember"
          style={{
            left: `${25 + i * 5}%`,
            backgroundColor: i % 2 === 0 ? "#f59e0b" : "#fbbf24",
            // Scale is a variable the keyframe multiplies in; setting it as a
            // plain transform here would be overwritten once the loop starts.
            "--scale": round2(0.6 + (i % 3) * 0.4),
            "--x2": px((i % 2 === 0 ? 1 : -1) * (20 + i * 5)),
            "--x3": px((i % 2 === 0 ? -1 : 1) * 15),
            animationDuration: `${5 + (i % 3) * 2}s`,
            animationDelay: `${round2(i * 0.45)}s`,
          }}
        />
      ))}
    </div>
  );
}

// Taboos — moonlight, distant stars, and fog at floor level.
function MidnightStars() {
  return (
    <div className="atmos-layer">
      <div className="atmos-moon-spotlight" />

      {Array.from({ length: 16 }, (_, i) => {
        const big = i % 3 === 0;
        return (
          <span
            key={`midnight-star-${i}`}
            className="atmos-star"
            style={{
              left: `${(i * 19 + 7) % 95}%`,
              top: `${(i * 17 + 11) % 65}%`,
              width: big ? "3px" : "2px",
              height: big ? "3px" : "2px",
              // Light mode overrides these vars; see globals.css.
              backgroundColor: i % 4 === 0 ? "var(--star-a)" : "var(--star-b)",
              animationDuration: `${3 + (i % 4)}s`,
              animationDelay: `${round2((i * 0.3) % 2)}s`,
            }}
          />
        );
      })}

      <div className="atmos-fog" />
    </div>
  );
}

// All Traditions — a few motes from each realm rather than a bare wash, so
// the default reads as the three themes gathered together.
function AllTraditions() {
  return (
    <div className="atmos-layer">
      {Array.from({ length: 9 }, (_, i) => {
        const realm = i % 3; // 0 gold (etiquette), 1 ember (beliefs), 2 star (taboos)
        return (
          <span
            key={`all-mote-${i}`}
            className={
              realm === 2 ? "atmos-star" : realm === 1 ? "atmos-ember" : "atmos-dust"
            }
            style={{
              left: `${10 + i * 9}%`,
              ...(realm === 2
                ? { top: `${(i * 17 + 11) % 55}%`, width: "2px", height: "2px" }
                : { bottom: `${15 + (i % 4) * 8}%` }),
              ...(realm === 0 ? { backgroundColor: "#dfbe62" } : {}),
              ...(realm === 1 ? { backgroundColor: "#e08712" } : {}),
              ...(realm === 2 ? { backgroundColor: "#93a7be" } : {}),
              "--x1": px(Math.sin(i) * 18),
              "--x2": px(Math.cos(i) * 30),
              "--x3": px(Math.sin(i) * 12),
              "--scale": round2(0.7 + (i % 3) * 0.25),
              "--peak": round2(0.18 + (i % 3) * 0.12),
              animationDuration: `${6 + (i % 4) * 2}s`,
              animationDelay: `${round2(i * 0.7)}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function ThemeAtmosphereBackdrop({ selectedTheme }) {
  return (
    <div className="atmos" aria-hidden="true">
      {/* Re-keyed per theme so the whole layer crossfades on a change. */}
      <div className="atmos-fade" key={selectedTheme}>
        <div className="atmos-ambient" />

        {selectedTheme === "all" && <AllTraditions />}
        {selectedTheme === "etiquette" && <GoldDust />}
        {selectedTheme === "beliefs" && <HearthEmbers />}
        {selectedTheme === "taboos" && <MidnightStars />}
      </div>
    </div>
  );
}
