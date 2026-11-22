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
    browse: {
      titleEn: "Explore all Khmer rules and traditions",
      titleKm: "រុករកក្បួនច្បាប់ និងទំនៀមទម្លាប់ខ្មែរទាំងអស់",
      subtitle:
        "Search, filter, and study every recorded Khmer belief, taboo, and point of etiquette in the archive.",
      subtitleKm:
        "ស្វែងរក ត្រង និងសិក្សារាល់ជំនឿ ការហាមប្រាម និងសុជីវធម៌ខ្មែរ ដែលបានកត់ត្រាទុកក្នុងបណ្ណសារ។",
    },
    hero: {
      titleEn: "Unwritten Rules: the whole archive",
      subtitleEn: "Beliefs, taboos and etiquette in one collection",
      titleKm: "បណ្ណសារទំនៀមទម្លាប់ខ្មែរ",
      subtitleKm: "សីលធម៌ និងទំនៀមទម្លាប់រស់នៅ • ក្បួនច្បាប់មាត់ទទេក្នុងផ្ទះសំបែង",
      description:
        "An interactive digital repository deciphering the taboos, ethical protocols, and domestic beliefs passed down across generations in Cambodia.",
      descriptionKm:
        "បណ្ណសារឌីជីថល ដែលបកស្រាយការហាមប្រាម សីលធម៌ និងជំនឿក្នុងគ្រួសារ ដែលបានបន្តពីមួយជំនាន់ទៅមួយជំនាន់នៅកម្ពុជា។",
    },
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
    browse: {
      titleEn: "Explore Khmer etiquette and respect",
      titleKm: "រុករកសុជីវធម៌ និងការគោរពខ្មែរ",
      subtitle:
        "Search and study the manners, respectful postures, and social conduct passed down across Cambodian families.",
      subtitleKm:
        "ស្វែងរក និងសិក្សាសុជីវធម៌ ឥរិយាបថគោរព និងការប្រព្រឹត្តក្នុងសង្គម ដែលបានបន្តតាមគ្រួសារខ្មែរ។",
    },
    hero: {
      titleEn: "Unwritten Rules: Khmer etiquette",
      subtitleEn: "Decorum, respect, and traditional social conduct",
      titleKm: "ច្បាប់មិនចែង៖ សុជីវធម៌ខ្មែរ",
      subtitleKm: "សីលធម៌ និងការប្រាស្រ័យទាក់ទង • ឥរិយាបថ និងការគោរពបុរាណ",
      description:
        "An oral record of respectful posture, eldership reverence, and social etiquette passed down across Cambodian families.",
      descriptionKm:
        "កំណត់ត្រាតាមមាត់អំពីឥរិយាបថគោរព ការគោរពចាស់ទុំ និងសុជីវធម៌សង្គម ដែលបានបន្តតាមគ្រួសារខ្មែរ។",
    },
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
    browse: {
      titleEn: "Explore Khmer beliefs and rules",
      titleKm: "រុករកជំនឿ និងក្បួនច្បាប់ខ្មែរ",
      subtitle:
        "Search and study the household omens, spiritual customs, and elder wisdom recorded in this archive.",
      subtitleKm:
        "ស្វែងរក និងសិក្សាប្រផ្នូលក្នុងផ្ទះ ទំនៀមទម្លាប់ខាងជំនឿ និងពាក្យទូន្មានរបស់ចាស់ទុំ ដែលបានកត់ត្រាក្នុងបណ្ណសារនេះ។",
    },
    hero: {
      titleEn: "Unwritten Rules: Khmer beliefs",
      subtitleEn: "Domestic omens, spiritual customs, and elder wisdom",
      titleKm: "ច្បាប់មិនចែង៖ ជំនឿខ្មែរ",
      subtitleKm: "ក្បួនច្បាប់មាត់ទទេក្នុងផ្ទះសំបែង • ពាក្យចាស់ទូន្មាន និងសេចក្ដីសុខ",
      description:
        "Customs and household omens rooted in gratitude, nature, and ancestral protective wisdom.",
      descriptionKm:
        "ទំនៀមទម្លាប់ និងប្រផ្នូលក្នុងផ្ទះ ដែលចាក់ឫសលើការដឹងគុណ ធម្មជាតិ និងប្រាជ្ញាការពាររបស់ដូនតា។",
    },
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
    browse: {
      titleEn: "Explore Khmer taboos",
      titleKm: "រុករកការហាមប្រាមខ្មែរ",
      subtitle:
        "Search and study the protective prohibitions and nocturnal warnings meant to keep the household safe.",
      subtitleKm:
        "ស្វែងរក និងសិក្សាបម្រាមការពារ និងការព្រមានពេលយប់ ដែលមានគោលបំណងរក្សាសុវត្ថិភាពក្នុងផ្ទះ។",
    },
    hero: {
      titleEn: "Unwritten Rules: Khmer taboos",
      subtitleEn: "Protective nocturnal boundaries and ancestral warnings",
      titleKm: "ច្បាប់មិនចែង៖ ការហាមប្រាម",
      subtitleKm: "បម្រាមរាត្រី និងអាសន្ន • ការដាស់តឿនការពារគ្រោះកាច",
      description:
        "Protective prohibitions and survival warnings designed by village elders to shield youth from danger.",
      descriptionKm:
        "បម្រាមការពារ និងការព្រមាន ដែលចាស់ទុំក្នុងភូមិបានបង្កើតឡើង ដើម្បីការពារកូនក្មេងពីគ្រោះថ្នាក់។",
    },
    vibeDescription:
      "Deep mystical midnight sky, moonlit shadows beneath the stilt dwelling, and solemn oral warnings safeguarding against nocturnal perils.",
  },
};

export const THEME_ORDER = ["all", "etiquette", "beliefs", "taboos"];

export default themes;
