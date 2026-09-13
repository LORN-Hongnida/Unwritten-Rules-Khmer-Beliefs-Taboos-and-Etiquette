// Theme metadata, ported from the reference theme.ts.
// Colours live in globals.css as CSS custom properties; this file holds
// only the labels and motif choices the UI needs to read in JavaScript.

const themes = {
  all: {
    id: "all",
    nameEn: "All Ancestral Traditions",
    nameKm: "ទំនៀមទម្លាប់បុរាណទាំងអស់",
    vibeTagEn: "National Heritage & Living Wisdom",
    vibeTagKm: "បេតិកភណ្ឌ និងពុទ្ធោវាទដូនតា",
    motifType: "lotus",
    vibeDescription:
      "Harmonious archive blending the royal court, domestic hearth, and nocturnal mysteries.",
  },
  etiquette: {
    id: "etiquette",
    nameEn: "Etiquette & Manners",
    nameKm: "សុជីវធម៌ និងការគោរព",
    vibeTagEn: "Royal Elegance & Classical Decorum",
    vibeTagKm: "សោភ័ណភាពរាជវាំង និងគំនាប់សីលធម៌",
    motifType: "crown",
    vibeDescription:
      "Refined royal grace reflecting centuries of Cambodian palace refinement, respectful postures, and generational elegance.",
  },
  beliefs: {
    id: "beliefs",
    nameEn: "Beliefs & Rules",
    nameKm: "ជំនឿ និងក្បួនច្បាប់",
    vibeTagEn: "Childhood Stilt House & Amber Lantern Light",
    vibeTagKm: "ផ្ទះឈើកាលពីកុមារភាព និងពន្លឺចង្កៀងប្រេងកាត",
    motifType: "lantern",
    vibeDescription:
      "Nostalgic warmth of a wooden Khmer home at dusk, glowing with ambient kerosene wick light, family storytelling, and ancestral floorboards.",
  },
  taboos: {
    id: "taboos",
    nameEn: "Taboos & Warnings",
    nameKm: "ការហាមប្រាម និងអាសន្ន",
    vibeTagEn: "Midnight Shadows & Mystical Night Sky",
    vibeTagKm: "រាត្រីអាធ្រាត្រ មេឃងងឹត និងបម្រាមការពារ",
    motifType: "moon",
    vibeDescription:
      "Deep mystical midnight sky, moonlit shadows beneath the stilt dwelling, and solemn oral warnings safeguarding against nocturnal perils.",
  },
};

export const THEME_ORDER = ["all", "etiquette", "beliefs", "taboos"];

export default themes;
