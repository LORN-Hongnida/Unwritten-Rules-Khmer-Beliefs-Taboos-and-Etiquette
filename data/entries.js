// Each entry is one recorded belief, taboo, or point of etiquette.
//
// category is one of: "beliefs" | "taboos" | "etiquette"
//   beliefs   — omens and signs read from the world around you
//   taboos    — things you are warned not to do
//   etiquette — how to carry yourself around other people
//
// titleKm is the Khmer rendering of the title. It is content, not decoration:
// never strip it or replace it with a transliteration.

const entries = [
  {
    id: "crows-over-rooftop",
    title: "Crows crying over a rooftop",
    titleKm: "ក្អែកយំលើដំបូលផ្ទះ",
    category: "beliefs",
    description:
      "This means a misfortune is coming; precisely, death is said to follow this event. So Cambodian people are always cautious and hate it when this is happening.",
    reason: null,
    contributor: "Heng Vicheka",
    stillBelieved: "Some people still believe in this — and this includes me.",
    place: "Kampong Cham",
  },
  {
    id: "fish-tail-swimming",
    title: "Eating the tail part of a fish makes you know how to swim",
    titleKm: "ស៊ីកន្ទុយត្រីចេះហែលទឹក",
    category: "beliefs",
    description:
      "This is commonly told to children who can't swim: if they eat the tail of a fish, they'll be able to swim.",
    reason:
      "It was used by adults to convince children to eat the tail part of a fish, since it is not the delicious part — the most delicious is said to be the head. In conclusion, it is a trick to have children eat what the adults don't want to eat.",
    contributor: "Heng Vicheka",
    stillBelieved: "Not really.",
    place: "Kampong Cham",
  },
  {
    id: "kite-on-rooftop",
    title: "A kite falling on a house's rooftop",
    titleKm: "ខ្លែងធ្លាក់លើដំបូលផ្ទះ",
    category: "beliefs",
    description:
      "This is similar to crows crying over the rooftop — it signals that misfortune is coming to the household.",
    reason:
      "Kite in Khmer is \"Kleng\" and crow is also called \"Kleng\", so people believe them to mean the same thing.",
    contributor: "Heng Vicheka",
    stillBelieved: "Some people still believe in this.",
    place: "Kampong Cham",
  },
  {
    id: "eating-lying-down",
    title: "Eating while lying down turns you into a crocodile",
    titleKm: "ស៊ីបាយផ្ដេកទៅជាក្រពើ",
    category: "taboos",
    description:
      "This was used by adults to scare children who are eating while lying down, saying \"you'll become a crocodile\".",
    reason:
      "This, I believe, is mostly to help children eat in a proper posture, avoiding choking.",
    contributor: "Heng Vicheka",
    stillBelieved: "Not really.",
    place: "Kampong Cham",
  },
  {
    id: "do-not-touch-heads",
    title: "Do not play with other people's heads",
    titleKm: "កុំលេងក្បាលគេ",
    category: "etiquette",
    description:
      "Playing with or touching someone's head was said to cause the person to become less smart.",
    reason:
      "In my opinion it's rather to stop the head from getting injured accidentally, and could be a clever trick to use on children.",
    contributor: "Heng Vicheka",
    stillBelieved: "Some people still believe in this.",
    place: "Kampong Cham",
  },
];

export default entries;
