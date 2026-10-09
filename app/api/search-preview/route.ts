import { NextRequest, NextResponse } from "next/server";

import {
  getAllSets,
  getCard,
  getSet,
  getSetIdFromCardId,
  searchCards,
} from "@/lib/tcgdex";

import { createClient } from "@/lib/supabase/server";

type SearchScope =
  | "all"
  | "sets"
  | "set-cards"
  | "collection"
  | "wishlist";

interface PreviewResult {
  type: "card" | "set";
  id: string;
  name: string;
  localId?: string;
  image?: string;
  setId?: string;
  setName?: string;
  logo?: string;
  href: string;
}

function normalizeScope(value: string | null): SearchScope {
  if (
    value === "sets" ||
    value === "set-cards" ||
    value === "collection" ||
    value === "wishlist" ||
    value === "all"
  ) {
    return value;
  }

  return "all";
}

function jsonNoStore(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");

  return NextResponse.json(data, {
    ...init,
    headers,
  });
}

function matches(value: string, query: string) {
  return value
    .toLocaleLowerCase("es")
    .includes(query.toLocaleLowerCase("es"));
}

async function resolveCardPreview(cardId: string) {
  const card = await getCard(cardId);

  if (!card) {
    return null;
  }

  return {
    id: card.id,
    name: card.name,
    localId: String(card.localId),
    image: card.image,
    setId: card.set.id,
    setName: card.set.name,
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const scope = normalizeScope(
    request.nextUrl.searchParams.get("scope")
  );
  const setId =
    request.nextUrl.searchParams.get("setId")?.trim() ?? "";

  if (query.length < 2) {
    return jsonNoStore([]);
  }

  if (query.length > 80) {
    return jsonNoStore(
      { error: "La búsqueda no puede superar los 80 caracteres." },
      { status: 400 }
    );
  }

  if (setId && !/^[A-Za-z0-9_.-]{1,100}$/.test(setId)) {
    return jsonNoStore([]);
  }

  try {
    if (scope === "sets") {
      const sets = await getAllSets("recent");

      return jsonNoStore(
        sets
          .filter(
            (set) =>
              matches(set.name, query) ||
              matches(set.id, query)
          )
          .slice(0, 3)
          .map<PreviewResult>((set) => ({
            type: "set",
            id: set.id,
            name: set.name,
            logo: set.logo,
            href: `/sets/${set.id}`,
          }))
      );
    }

    if (scope === "set-cards") {
      if (!setId) {
        return jsonNoStore([]);
      }

      const set = await getSet(setId);

      if (!set) {
        return jsonNoStore([]);
      }

      const matchingCards = (set.cards ?? [])
        .filter(
          (card) =>
            matches(card.name, query) ||
            matches(String(card.localId), query)
        )
        .slice(0, 3);

      const resolved = await Promise.all(
        matchingCards.map((card) =>
          resolveCardPreview(card.id)
        )
      );

      return jsonNoStore(
        resolved
          .filter((card): card is NonNullable<typeof card> => card !== null)
          .map<PreviewResult>((card) => ({
            type: "card",
            id: card.id,
            name: card.name,
            localId: card.localId,
            image: card.image,
            setId: card.setId,
            setName: card.setName,
            href: `/sets/${card.setId}/${card.id}`,
          }))
      );
    }

    const supabase = await createClient();

    let savedCardIds: Set<string> | null = null;

    if (scope === "collection" || scope === "wishlist") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return jsonNoStore(
          {
            error: "Debes iniciar sesión para buscar aquí.",
          },
          { status: 401 }
        );
      }

      const { data, error } = await supabase
        .from(scope)
        .select("card_id")
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      savedCardIds = new Set(
        data?.map((row) => row.card_id) ?? []
      );
    }

    const [sets, cards] = await Promise.all([
      getAllSets("recent"),
      searchCards(query),
    ]);

    const setMap = new Map(
      sets.map((set) => [set.id, set])
    );

    const cardCandidates = cards.filter((card) =>
      savedCardIds ? savedCardIds.has(card.id) : true
    );

    const resolvedCards = await Promise.all(
      cardCandidates.slice(0, 6).map((card) =>
        resolveCardPreview(card.id)
      )
    );

    const cardResults = resolvedCards
      .filter(
        (card): card is NonNullable<typeof card> =>
          card !== null
      )
      .slice(0, 3)
      .map<PreviewResult>((card) => ({
        type: "card",
        id: card.id,
        name: card.name,
        localId: card.localId,
        image: card.image,
        setId: card.setId,
        setName:
          card.setName ??
          setMap.get(card.setId)?.name ??
          card.setId,
        href:
          scope === "collection"
            ? `/collection/${card.setId}/${card.id}`
            : scope === "wishlist"
              ? `/wishlist/${card.setId}/${card.id}`
              : `/sets/${card.setId}/${card.id}`,
      }));

    if (scope === "collection" || scope === "wishlist") {
      const savedSetIds = new Set(
        [...(savedCardIds ?? [])].map((cardId) =>
          getSetIdFromCardId(cardId)
        )
      );

      const setResults = sets
        .filter(
          (set) =>
            savedSetIds.has(set.id) &&
            (matches(set.name, query) ||
              matches(set.id, query))
        )
        .slice(0, 3)
        .map<PreviewResult>((set) => ({
          type: "set",
          id: set.id,
          name: set.name,
          logo: set.logo,
          href: `/${scope}/${set.id}`,
        }));

      return jsonNoStore(
        [...cardResults, ...setResults].slice(0, 3)
      );
    }

    if (scope === "all") {
      const setResults = sets
        .filter(
          (set) =>
            matches(set.name, query) ||
            matches(set.id, query)
        )
        .slice(0, 3)
        .map<PreviewResult>((set) => ({
          type: "set",
          id: set.id,
          name: set.name,
          logo: set.logo,
          href: `/sets/${set.id}`,
        }));

      return jsonNoStore(
        [...cardResults, ...setResults].slice(0, 3)
      );
    }

    return jsonNoStore(cardResults.slice(0, 3));
  } catch (error) {
    console.error("Error en búsqueda previa:", error);

    return jsonNoStore(
      {
        error: "No se pudo completar la búsqueda.",
      },
      { status: 500 }
    );
  }
}
