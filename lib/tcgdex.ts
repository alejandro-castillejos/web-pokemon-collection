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

export type SetSort = "recent" | "oldest" | "name" | "progress";

export async function getAllSets(
  sort: SetSort = "recent"
): Promise<TCGdexSetBrief[]> {
  const effectiveSort = sort === "progress" ? "recent" : sort;

  const sortField =
    effectiveSort === "name" ? "name" : "releaseDate";

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

export async function getSet(setId: string) {
  return tcgdex.set.get(setId);
}

export async function getCard(cardId: string) {
  return tcgdex.card.get(cardId);
}

export function getSetIdFromCardId(cardId: string): string {
  const separatorIndex = cardId.indexOf("-");

  if (separatorIndex === -1) {
    return cardId;
  }

  return cardId.slice(0, separatorIndex);
}