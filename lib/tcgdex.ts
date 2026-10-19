import "server-only";

import { unstable_cache } from "next/cache";
import TCGdex from "@tcgdex/sdk";

export const tcgdex = new TCGdex("en");

export interface TCGdexSetBrief {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount: {
    total: number;
    official: number;
  };
}

export type SetSort =
  | "recent"
  | "oldest"
  | "name"
  | "name-desc"
  | "progress";

export async function getAllSets(
  sort: SetSort = "recent"
): Promise<TCGdexSetBrief[]> {
  const effectiveSort = sort === "progress" ? "recent" : sort;

  const sortField =
    effectiveSort === "name" || effectiveSort === "name-desc"
      ? "name"
      : "releaseDate";

  const sortOrder =
    effectiveSort === "oldest" || effectiveSort === "name"
      ? "ASC"
      : "DESC";

  const response = await fetch(
    `https://api.tcgdex.net/v2/en/sets?sort:field=${sortField}&sort:order=${sortOrder}`,
    {
      next: {
        revalidate: 3600,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error obteniendo los sets: ${response.status}`
    );
  }

  return response.json();
}

const validTcgDexId = /^[A-Za-z0-9_.-]{1,100}$/;

// Convertimos los objetos del SDK en objetos planos antes de guardarlos
// en la caché de Next.js. Así evitamos referencias circulares internas.
const getCachedSet = unstable_cache(
  async (setId: string) => {
    const set = await tcgdex.set.get(setId);

    if (!set) {
      return null;
    }

    return {
      id: set.id,
      name: set.name,
      logo: set.logo,
      symbol: set.symbol,
      releaseDate: set.releaseDate,
      cardCount: {
        total: set.cardCount.total,
        official: set.cardCount.official,
      },
      cards: (set.cards ?? []).map((card) => ({
        id: card.id,
        localId: card.localId,
        name: card.name,
        image: card.image,
      })),
    };
  },
  ["tcgdex-set-details-v2"],
  {
    revalidate: 3600,
    tags: ["tcgdex-sets"],
  }
);

export interface TCGdexPriceVariant {
  lowPrice?: number | null;
  midPrice?: number | null;
  highPrice?: number | null;
  marketPrice?: number | null;
  directLowPrice?: number | null;
}

export interface TCGdexTCGPlayerPricing {
  updated?: string | number;
  unit?: string;
  [variant: string]:
    | string
    | number
    | TCGdexPriceVariant
    | null
    | undefined;
}

export interface TCGdexCardmarketPricing {
  updated?: string | number;
  unit?: string;
  avg?: number | null;
  low?: number | null;
  trend?: number | null;
  "avg-holo"?: number | null;
  "low-holo"?: number | null;
  "trend-holo"?: number | null;
}

export interface TCGdexPricing {
  tcgplayer?: TCGdexTCGPlayerPricing | null;
  cardmarket?: TCGdexCardmarketPricing | null;
}

interface TCGdexCardResponse {
  id: string;
  localId: string | number;
  name: string;
  image?: string;
  category: string;
  rarity?: string;
  set: {
    id: string;
  };
  pricing?: TCGdexPricing | null;
}

const getCachedCard = unstable_cache(
  async (cardId: string) => {
    // Read the REST response directly so optional pricing fields remain
    // available even if the installed SDK types do not expose them yet.
    const response = await fetch(
      `https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(cardId)}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `Error obteniendo la carta desde TCGdex: ${response.status}`
      );
    }

    const card = (await response.json()) as TCGdexCardResponse;

    return {
      id: card.id,
      localId: card.localId,
      name: card.name,
      image: card.image,
      category: card.category,
      rarity: card.rarity,
      set: {
        id: card.set.id,
      },
      pricing: card.pricing ?? null,
    };
  },
  ["tcgdex-card-details-v3"],
  {
    revalidate: 3600,
    tags: ["tcgdex-cards"],
  }
);

export async function getSet(setId: string) {
  if (!validTcgDexId.test(setId)) {
    return null;
  }

  return getCachedSet(setId);
}

export async function getCard(cardId: string) {
  if (!validTcgDexId.test(cardId)) {
    return null;
  }

  return getCachedCard(cardId);
}

export function getSetIdFromCardId(cardId: string): string {
  const separatorIndex = cardId.indexOf("-");

  if (separatorIndex === -1) {
    return cardId;
  }

  return cardId.slice(0, separatorIndex);
}

export interface TCGdexCardBrief {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

export async function searchCards(
  query: string
): Promise<TCGdexCardBrief[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery || normalizedQuery.length > 80) {
    return [];
  }

  const encodedQuery = encodeURIComponent(normalizedQuery);

  const [nameResponse, localIdResponse] = await Promise.all([
    fetch(
      `https://api.tcgdex.net/v2/en/cards?name=${encodedQuery}`,
      {
        next: {
          revalidate: 300,
        },
      }
    ),
    fetch(
      `https://api.tcgdex.net/v2/en/cards?localId=${encodedQuery}`,
      {
        next: {
          revalidate: 300,
        },
      }
    ),
  ]);

  if (!nameResponse.ok || !localIdResponse.ok) {
    throw new Error("Error buscando cartas en TCGdex.");
  }

  const [nameCards, localIdCards] = await Promise.all([
    nameResponse.json() as Promise<TCGdexCardBrief[]>,
    localIdResponse.json() as Promise<TCGdexCardBrief[]>,
  ]);

  const cards = new Map<string, TCGdexCardBrief>();

  for (const card of [...nameCards, ...localIdCards]) {
    cards.set(card.id, card);
  }

  return [...cards.values()];
}
