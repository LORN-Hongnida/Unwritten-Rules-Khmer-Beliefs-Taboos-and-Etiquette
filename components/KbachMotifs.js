/**
 * Traditional Cambodian Kbach art motifs and framing geometry.
 * Ported from the reference KbachMotifs.tsx: the SVG geometry is unchanged,
 * only the TypeScript annotations and Tailwind classes were rewritten.
 *
 * Motif types: 'lotus' (All) | 'crown' (Etiquette) | 'lantern' (Beliefs) | 'moon' (Taboos)
 */

export function KbachCorner({ className = 'kbach', position = 'top-left', size = 32, motif = 'lotus' }) {
  const rotationClass = {
    'top-left': 'kbach-rot-0',
    'top-right': 'kbach-rot-90',
    'bottom-right': 'kbach-rot-180',
    'bottom-left': 'kbach-rot-270',
  }[position];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`kbach-corner ${rotationClass} ${className}`}
      aria-hidden="true"
    >
      {motif === 'crown' && (
        /* Royal Lotus Crown & Flame Corner (Kbach Phni Tes / Angkorian Royal Court) */
        <g>
          {/* Outer stepped royal frame */}
          <path
            d="M2 42V8C2 4.7 4.7 2 8 2H42"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Inner hairline stepped frame */}
          <path
            d="M6 34V12C6 8.7 8.7 6 12 6H34"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="3 2"
          />
          {/* Crown Spire Finial in the crook */}
          <path
            d="M8 8C11 5 16 6 18 10C16 13 13 16 10 18C7 16 5 11 8 8Z"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path d="M5 5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          {/* Royal flame tendrils extending along the frame */}
          <path
            d="M8 2C13 6 19 6 25 3C22 7 26 10 32 8"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M2 8C6 13 6 19 3 25C7 22 10 26 8 32"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Sacred Royal Pearl Beads */}
          <circle cx="5" cy="5" r="2" fill="currentColor" />
          <circle cx="16" cy="4" r="1.5" fill="currentColor" />
          <circle cx="4" cy="16" r="1.5" fill="currentColor" />
          <circle cx="15" cy="15" r="1.5" fill="currentColor" fillOpacity="0.8" />
        </g>
      )}

      {motif === 'lantern' && (
        /* Hearth Flame & Cambodian Woodwork Scroll (Kbach Phni Vor / Traditional Stilt House) */
        <g>
          {/* Wooden notch tenon framing line */}
          <path
            d="M2 42V7C2 4.2 4.2 2 7 2H42"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Flickering hearth flame tongue in the corner crook */}
          <path
            d="M10 5C14 7 15 12 11 15C7 16 5 11 8 7Z"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          {/* Spiraling Kbach Vor vine tendril */}
          <path
            d="M2 18C7 18 13 14 16 9C19 5 24 5 28 2"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M18 2C18 7 14 13 9 16C5 19 5 24 2 28"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          {/* Radiant ember droplets */}
          <circle cx="11" cy="11" r="2.2" fill="currentColor" />
          <circle cx="22" cy="3" r="1.5" fill="currentColor" />
          <circle cx="3" cy="22" r="1.5" fill="currentColor" />
          <path d="M7 7C10 10 10 13 8 16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </g>
      )}

      {motif === 'moon' && (
        /* Midnight Celestial Cloud & Crescent Naga (Kbach Popok / Nocturnal Taboos) */
        <g>
          {/* Frame with serpentine wave curve */}
          <path
            d="M2 42V9C2 5.5 5.5 2 9 2H42"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Crescent Moon cradled inside corner crook */}
          <path
            d="M16 4C10 6 6 11 6 17C6 21 8 24 11 26C8 22 8 16 13 11C17 7 22 7 26 9C23 6 20 4 16 4Z"
            fill="currentColor"
            fillOpacity="0.4"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          {/* Traditional Khmer cloud scroll (Kbach Popok) */}
          <path
            d="M3 19C7 19 10 16 14 18C17 16 21 17 24 14C27 11 31 10 35 6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Protective talismanic star sparkle */}
          <polygon
            points="12,12 13.5,14.5 16,16 13.5,17.5 12,20 10.5,17.5 8,16 10.5,14.5"
            fill="currentColor"
          />
          <circle cx="28" cy="4" r="1.5" fill="currentColor" />
          <circle cx="4" cy="28" r="1.5" fill="currentColor" />
        </g>
      )}

      {motif === 'lotus' && (
        /* Ceremonial Star Lotus (Kbach Pka Chan / Sacred Ancestral Sanctuary) */
        <g>
          {/* Outer classical framing line */}
          <path
            d="M2 42V8C2 4.7 4.7 2 8 2H42"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Inner ornamental Kbach curl */}
          <path
            d="M2 20C8 20 15 15 15 9C15 2 20 2 20 2"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M20 2C20 8 15 15 9 15C2 15 2 20 2 20"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          {/* Central sacred lotus petal */}
          <path
            d="M8 8C12 12 17 13 22 8C17 17 8 22 8 8Z"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="0.85"
          />
          {/* Center lotus core & diamond beads */}
          <circle cx="10" cy="10" r="2.2" fill="currentColor" />
          <circle cx="10" cy="10" r="4.5" stroke="currentColor" strokeWidth="0.75" />
          <polygon points="26,2 29,4 26,6 23,4" fill="currentColor" />
          <polygon points="2,26 4,29 6,26 4,23" fill="currentColor" />
        </g>
      )}
    </svg>
  );
}

/**
 * Traditional Khmer Ornamental Frieze Border (Kbach Frieze)
 * Micro-atmosphere texture that changes style per realm:
 * - moon (Taboos & Warnings): Sharp geometric angles, serrated jagged teeth, and protective omens
 * - crown (Etiquette): Soft flowing Kbach Phni Vor scrollwork vines, royal palace curves
 * - lantern (Beliefs): Warm flame tips, stilt-house timber notches, kerosene lamp teardrops
 * - lotus (All): Interlocking sacred diamond-lotuses and temple friezes
 */
export function KhmerFriezeBorder({ className = 'kbach', motif = 'lotus', height = 10 }) {
  return (
    <div className={`kbach-frieze ${className}`}>
      <svg
        width="100%"
        height={height}
        viewBox="0 0 320 12"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="kbach-frieze-svg"
        aria-hidden="true"
      >
        <defs>
          {motif === 'moon' ? (
            /* Sharp geometric angles and defensive nocturnal serrations */
            <pattern id={`khmer-frieze-${motif}`} width="28" height="12" patternUnits="userSpaceOnUse">
              <line x1="0" y1="1" x2="28" y2="1" stroke="currentColor" strokeWidth="0.85" />
              <line x1="0" y1="11" x2="28" y2="11" stroke="currentColor" strokeWidth="0.85" />
              {/* Angular zig-zag defensive guard */}
              <path d="M0,6 L4,2 L8,6 L12,2 L14,6 L16,10 L20,6 L24,10 L28,6" stroke="currentColor" strokeWidth="0.8" fill="none" />
              {/* Sharp diamond shard */}
              <polygon points="14,1.5 17,6 14,10.5 11,6" fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="0.75" />
              <circle cx="14" cy="6" r="1.3" fill="currentColor" />
            </pattern>
          ) : motif === 'crown' ? (
            /* Soft undulating Kbach Phni Vor vines and royal floral loops */
            <pattern id={`khmer-frieze-${motif}`} width="30" height="12" patternUnits="userSpaceOnUse">
              <line x1="0" y1="1" x2="30" y2="1" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3,1" />
              <line x1="0" y1="11" x2="30" y2="11" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3,1" />
              {/* Flowing vine waves */}
              <path d="M0,6 C5,1 10,11 15,6 C20,1 25,11 30,6" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" fill="none" />
              {/* Royal lotus bud petal */}
              <path d="M15,2 C17.5,4 18,7 15,10 C12,7 12.5,4 15,2 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="0.7" />
              <circle cx="7.5" cy="4" r="1" fill="currentColor" />
              <circle cx="22.5" cy="8" r="1" fill="currentColor" />
            </pattern>
          ) : motif === 'lantern' ? (
            /* Warm flame tips, hearth embers and kerosene lamp teardrops */
            <pattern id={`khmer-frieze-${motif}`} width="26" height="12" patternUnits="userSpaceOnUse">
              <line x1="0" y1="1" x2="26" y2="1" stroke="currentColor" strokeWidth="0.8" />
              <line x1="0" y1="11" x2="26" y2="11" stroke="currentColor" strokeWidth="0.8" />
              {/* Flame wave */}
              <path d="M13,2 C15,4.5 16,7 13,10 C10,7 11,4.5 13,2 Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="0.75" />
              <circle cx="13" cy="6.5" r="1.2" fill="currentColor" />
              {/* Hearth timber notches */}
              <polygon points="0,6 3,3.5 6,6 3,8.5" fill="currentColor" fillOpacity="0.2" />
              <polygon points="26,6 23,3.5 20,6 23,8.5" fill="currentColor" fillOpacity="0.2" />
            </pattern>
          ) : (
            /* Interlocking sacred diamond-lotuses */
            <pattern id={`khmer-frieze-${motif}`} width="24" height="12" patternUnits="userSpaceOnUse">
              <line x1="0" y1="1" x2="24" y2="1" stroke="currentColor" strokeWidth="0.75" />
              <line x1="0" y1="11" x2="24" y2="11" stroke="currentColor" strokeWidth="0.75" />
              <polygon
                points="12,2.5 16.5,6 12,9.5 7.5,6"
                fill="currentColor"
                fillOpacity="0.25"
                stroke="currentColor"
                strokeWidth="0.8"
              />
              <circle cx="12" cy="6" r="1.2" fill="currentColor" />
              <path d="M0,6 L3,3.5 L6,6 L3,8.5 Z" fill="currentColor" fillOpacity="0.2" />
              <path d="M24,6 L21,3.5 L18,6 L21,8.5 Z" fill="currentColor" fillOpacity="0.2" />
            </pattern>
          )}
        </defs>
        <rect width="100%" height="12" fill={`url(#khmer-frieze-${motif})`} />
      </svg>
    </div>
  );
}

/**
 * Khmer Card Crest / Lintel Pediment Flourish
 * Symmetrical traditional pediment flourish to crown card headers and section titles.
 */
export function KhmerCardCrest({ className = 'kbach', motif = 'lotus', size = 20 }) {
  return (
    <div className={`kbach-crest ${className}`}>
      <div className="kbach-rule kbach-rule-left" />
      <ThemeVibeIcon motif={motif} size={size} className="kbach-crest-icon" />
      <div className="kbach-rule kbach-rule-right" />
    </div>
  );
}

export function KbachPkaChan({ size = 24, className = 'kbach' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`kbach-icon ${className}`}
      aria-hidden="true"
    >
      {/* 8-pointed traditional Khmer ceremonial lotus star */}
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        {/* Cardinal petals */}
        <path d="M16 2L18.5 11.5L28 14L18.5 16.5L16 26L13.5 16.5L4 14L13.5 11.5L16 2Z" />
        {/* Diagonal accents */}
        <circle cx="16" cy="16" r="3.5" fill="currentColor" fillOpacity="0.3" />
        <circle cx="16" cy="16" r="1.5" fill="currentColor" />
      </g>
      <circle cx="16" cy="5" r="1" fill="currentColor" />
      <circle cx="16" cy="27" r="1" fill="currentColor" />
      <circle cx="5" cy="16" r="1" fill="currentColor" />
      <circle cx="27" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

export function KbachDivider({ className = '', label, labelKm }) {
  return (
    <div className={`kbach-divider ${className}`}>
      <div className="kbach-divider-rule kbach-divider-rule-left" />

      <div className="kbach-divider-pill">
        <KbachPkaChan size={16} className="kbach" />
        {label && <span className="kbach-divider-label">{label}</span>}
        {labelKm && (
          <span className="kbach-divider-label-km" lang="km">
            {labelKm}
          </span>
        )}
        <KbachPkaChan size={16} className="kbach" />
      </div>

      <div className="kbach-divider-rule kbach-divider-rule-right" />
    </div>
  );
}

export function LotusFinial({
  className = 'kbach',
  size = 28,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M18 3C18 3 23 10 23 16C23 19 21 22 18 24C15 22 13 19 13 16C13 10 18 3 18 3Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M18 12C22 14 29 17 29 23C29 27 24 29 18 29C12 29 7 27 7 23C7 17 14 14 18 12Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="18" cy="32" r="2" fill="currentColor" />
      <path d="M12 32H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Royal Lotus Crown (Kbach Phni Pka)
 * Symbolizing Cambodian classical etiquette, royal court decorum, and generational elegance.
 */
export function RoyalLotusCrown({
  className = 'kbach',
  size = 48,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`kbach-icon ${className}`}
      aria-hidden="true"
    >
      {/* Central Royal Flame Tip */}
      <path
        d="M32 4C32 4 36 12 36 18C36 21 34 23 32 24C30 23 28 21 28 18C28 12 32 4 32 4Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
      {/* Inner Petal Flairs */}
      <path
        d="M32 24C36 20 44 18 44 26C44 32 38 36 32 38C26 36 20 32 20 26C20 18 28 20 32 24Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Flanking Royal Wings / Kbach Vor Tendrils */}
      <path
        d="M20 28C14 26 8 30 8 38C8 46 18 48 24 44C20 42 18 36 20 28Z"
        fill="currentColor"
        fillOpacity="0.4"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M44 28C50 26 56 30 56 38C56 46 46 48 40 44C44 42 46 36 44 28Z"
        fill="currentColor"
        fillOpacity="0.4"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      {/* Ornate Ceremonial Tier Base */}
      <path
        d="M16 48C22 50 27 51 32 51C37 51 42 50 48 48C46 53 40 55 32 55C24 55 18 53 16 48Z"
        fill="currentColor"
        fillOpacity="0.6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="18" r="1.5" fill="#fff" fillOpacity="0.9" />
      <circle cx="26" cy="34" r="1.5" fill="#fff" fillOpacity="0.7" />
      <circle cx="38" cy="34" r="1.5" fill="#fff" fillOpacity="0.7" />
      <circle cx="32" cy="44" r="2" fill="#fff" fillOpacity="0.9" />
      <path d="M22 58H42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Cambodian Kerosene Hearth Lamp (ចង្កៀងប្រេងកាត)
 * Evoking childhood memories in rural stilt houses, flickering yellow wick warmth, and elder fireside wisdom.
 */
export function KeroseneHearthLamp({
  className = 'kbach',
  size = 48,
  glowColor = 'currentColor',
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`kbach-icon ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="lampGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.6" />
          <stop offset="50%" stopColor={glowColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Flame Halo */}
      <circle cx="32" cy="28" r="22" fill="url(#lampGlow)" />

      {/* Glass Chimney Top Rim */}
      <ellipse cx="32" cy="8" rx="5" ry="1.5" stroke="currentColor" strokeWidth="1.25" />
      
      {/* Glass Chimney Body */}
      <path
        d="M27 8C27 14 24 20 22 28C20 34 23 40 32 40C41 40 44 34 42 28C40 20 37 14 37 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.08"
      />

      {/* Flickering Wick Flame */}
      <path
        d="M32 22C34 25 35 28 35 30C35 32 33.5 34 32 34C30.5 34 29 32 29 30C29 27 31 24 32 22Z"
        fill="#fef08a"
        stroke="#f59e0b"
        strokeWidth="0.75"
        className="animate-pulse"
      />
      <circle cx="32" cy="30" r="1.5" fill="#fff" />

      {/* Brass Burner Collar & Turn Knob */}
      <rect x="26" y="40" width="12" height="4" rx="1" fill="currentColor" fillOpacity="0.7" stroke="currentColor" strokeWidth="1" />
      <circle cx="41" cy="42" r="1.5" fill="currentColor" />

      {/* Lower Glass / Fuel Basin */}
      <path
        d="M25 44C21 46 19 50 19 54C19 56 22 58 32 58C42 58 45 56 45 54C45 50 43 46 39 44H25Z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Base Rim */}
      <path d="M22 58C26 60 38 60 42 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Midnight Moon & Kbach Cloud (ក្បាច់ពពក និងព្រះចន្ទ)
 * Reflecting the dark night sky, nocturnal taboos, and ancestral protective mystery.
 */
export function MidnightMoonCloud({
  className = 'kbach',
  size = 48,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`kbach-icon ${className}`}
      aria-hidden="true"
    >
      {/* Crescent Moon */}
      <path
        d="M36 8C27 10 20 18 20 28C20 39 29 48 40 48C43 48 46 47 48 45C38 45 30 37 30 27C30 18 34 11 36 8Z"
        fill="currentColor"
        fillOpacity="0.85"
        stroke="currentColor"
        strokeWidth="1.25"
      />

      {/* Traditional Khmer Cloud Tendril (Kbach Popok) flowing across */}
      <path
        d="M8 44C10 40 14 38 18 40C20 37 24 36 28 38C30 35 35 34 39 37C42 36 47 38 48 42C52 42 56 45 56 49C56 53 52 56 47 56H14C9.5 56 6 52.5 6 48C6 45.5 8 44 8 44Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Cloud inner curl */}
      <path
        d="M18 48C20 46 24 46 26 49C28 47 32 47 34 50"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Twinkling Stars */}
      <g fill="#fff" fillOpacity="0.9">
        {/* Star 1 */}
        <polygon points="14,14 15.5,17 18.5,18.5 15.5,20 14,23 12.5,20 9.5,18.5 12.5,17" />
        {/* Star 2 */}
        <circle cx="48" cy="18" r="1.5" />
        {/* Star 3 */}
        <circle cx="54" cy="28" r="1" />
        {/* Star 4 */}
        <circle cx="10" cy="30" r="1" />
      </g>
    </svg>
  );
}

export function ThemeVibeIcon({ motif, size = 24, className }) {
  switch (motif) {
    case 'crown':
      return <RoyalLotusCrown size={size} className={className} />;
    case 'lantern':
      return <KeroseneHearthLamp size={size} className={className} />;
    case 'moon':
      return <MidnightMoonCloud size={size} className={className} />;
    case 'lotus':
    default:
      return <LotusFinial size={size} className={className} />;
  }
}

/**
 * Gold Ornamental Corner Brackets [ ... ]
 * Wraps buttons or badges in subtle Khmer architectural corner brackets that illuminate on hover
 */
export function GoldBracket({ children, className = '', bracketClassName = 'kbach-bracket' }) {
  return (
    <span className={`kbach-bracket-wrap ${className}`}>
      <span className={`kbach-bracket-mark ${bracketClassName}`}>[</span>
      {children}
      <span className={`kbach-bracket-mark ${bracketClassName}`}>]</span>
    </span>
  );
}

/**
 * Micro-illuminated heritage icon (Lotus bud, Oil lamp flame, or Moon shard)
 * Designed to sit beside CTA labels and glow softly on hover
 */
export function MicroIlluminatedIcon({ motif = 'lotus', className = 'kbach-micro' }) {
  if (motif === 'lantern') {
    // Hearth flame ember
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className={`kbach-micro-svg ${className}`} aria-hidden="true">
        <path d="M8 1C8.5 3.5 12 6.5 12 10C12 12.2 10.2 14 8 14C5.8 14 4 12.2 4 10C4 6.5 7.5 3.5 8 1Z" fillOpacity="0.9" />
        <circle cx="8" cy="10" r="2" fill="#fff" fillOpacity="0.8" />
      </svg>
    );
  }
  if (motif === 'moon') {
    // Nocturnal crescent shard
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className={`kbach-micro-svg ${className}`} aria-hidden="true">
        <path d="M10 2C7 2.5 5 5 5 8C5 11 7 13.5 10 14C6 14 3 11 3 8C3 5 6 2 10 2Z" fillOpacity="0.9" />
        <circle cx="12" cy="4" r="1" fill="#fff" />
      </svg>
    );
  }
  if (motif === 'crown') {
    // Royal crown petal
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className={`kbach-micro-svg ${className}`} aria-hidden="true">
        <path d="M8 2L10 6L14 7L11 10L12 14L8 12L4 14L5 10L2 7L6 6L8 2Z" fillOpacity="0.9" />
      </svg>
    );
  }
  // Lotus bud
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className={`kbach-micro-svg ${className}`} aria-hidden="true">
      <path d="M8 2C9.5 4 11.5 6.5 11.5 9.5C11.5 11.5 9.9 13 8 13C6.1 13 4.5 11.5 4.5 9.5C4.5 6.5 6.5 4 8 2Z" fillOpacity="0.9" />
      <path d="M8 5C7 7 6.5 8.5 6.5 10" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}
