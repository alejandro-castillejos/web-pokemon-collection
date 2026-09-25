export interface SetData {
  name: string;
  code: string;
  totalCards: number;
}

export interface CardData {
  number: string;
  name: string;
  rarity: string;
  type: string;
  setId: string;
  description: string;
  owned: boolean;
  wishlist: boolean;
}

export const sets: Record<string, SetData> = {
  sv3pt5: {
    name: "Scarlet & Violet—151",
    code: "sv3pt5",
    totalCards: 207,
  },
  sv10: {
    name: "Destined Rivals",
    code: "sv10",
    totalCards: 244,
  },
  sv8pt5: {
    name: "Prismatic Evolutions",
    code: "sv8pt5",
    totalCards: 180,
  },
  sv8: {
    name: "Surging Sparks",
    code: "sv8",
    totalCards: 252,
  },
};

export const cards: CardData[] = [
  {
    number: "001",
    name: "Bulbasaur",
    rarity: "Common",
    type: "Grass",
    setId: "sv10",
    description:
      "Una carta de ejemplo para nuestra vista individual de Pokémon TCG.",
    owned: true,
    wishlist: false,
  },
  {
    number: "002",
    name: "Ivysaur",
    rarity: "Common",
    type: "Grass",
    setId: "sv10",
    description:
      "Una carta de ejemplo para nuestra vista individual de Pokémon TCG.",
    owned: true,
    wishlist: false,
  },
  {
    number: "003",
    name: "Venusaur",
    rarity: "Rare",
    type: "Grass",
    setId: "sv10",
    description:
      "Una carta de ejemplo para nuestra vista individual de Pokémon TCG.",
    owned: false,
    wishlist: true,
  },
  {
    number: "004",
    name: "Charmander",
    rarity: "Common",
    type: "Fire",
    setId: "sv10",
    description:
      "Una carta de ejemplo para nuestra vista individual de Pokémon TCG.",
    owned: true,
    wishlist: false,
  },
  {
    number: "005",
    name: "Charmeleon",
    rarity: "Common",
    type: "Fire",
    setId: "sv10",
    description:
      "Una carta de ejemplo para nuestra vista individual de Pokémon TCG.",
    owned: false,
    wishlist: false,
  },
  {
    number: "006",
    name: "Charizard ex",
    rarity: "Double Rare",
    type: "Fire",
    setId: "sv10",
    description:
      "Una carta de ejemplo para nuestra vista individual de Pokémon TCG.",
    owned: false,
    wishlist: true,
  },
  {
    number: "007",
    name: "Squirtle",
    rarity: "Common",
    type: "Water",
    setId: "sv10",
    description:
      "Una carta de ejemplo para nuestra vista individual de Pokémon TCG.",
    owned: true,
    wishlist: false,
  },
  {
    number: "008",
    name: "Wartortle",
    rarity: "Uncommon",
    type: "Water",
    setId: "sv10",
    description:
      "Una carta de ejemplo para nuestra vista individual de Pokémon TCG.",
    owned: false,
    wishlist: false,
  },
];

export function getCardsBySet(setId: string) {
  return cards.filter((card) => card.setId === setId);
}