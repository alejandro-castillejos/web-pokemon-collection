import "server-only";

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

export async function getSet(setId: string) {
  if (!validTcgDexId.test(setId)) {
    return null;
  }

  return tcgdex.set.get(setId);
}

export async function getCard(cardId: string) {
  if (!validTcgDexId.test(cardId)) {
    return null;
  }

  return tcgdex.card.get(cardId);
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
