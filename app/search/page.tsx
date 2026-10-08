import Link from "next/link";
import { redirect } from "next/navigation";

import GlassPanel from "@/components/ui/GlassPanel";
import SetCard from "@/components/pokemon/SetCard";
import PokemonCard from "@/components/pokemon/PokemonCard";

import {
  getAllSets,
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

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    scope?: string;
    setId?: string;
  }>;
}

function matchesQuery(value: string, query: string) {
  return value
    .toLocaleLowerCase("es")
    .includes(query.toLocaleLowerCase("es"));
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const scope: SearchScope = [
    "all",
    "sets",
    "set-cards",
    "collection",
    "wishlist",
  ].includes(params.scope as SearchScope)
    ? (params.scope as SearchScope)
    : "all";

  if (!query) {
    return (
      <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <GlassPanel strong className="mx-auto max-w-2xl rounded-[28px] p-10 text-center sm:p-14">
            <p className="text-sm font-medium text-zinc-500">
              Búsqueda
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
              Busca cartas o sets
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Escribe un nombre, número o nombre de set en el buscador de la
              Navbar.
            </p>
          </GlassPanel>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  if ((scope === "collection" || scope === "wishlist") && !params.setId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(
        `/login?message=Inicia sesión para buscar en tu ${scope === "collection" ? "colección" : "wishlist"}`
      );
    }

    const table = scope === "collection" ? "collection" : "wishlist";

    const [{ data: rows, error }, sets, cards] = await Promise.all([
      supabase
        .from(table)
        .select("card_id"),
      getAllSets("recent"),
      searchCards(query),
    ]);

    if (error) {
      throw new Error(
        `Error obteniendo datos para la búsqueda: ${error.message}`
      );
    }

    const savedCardIds = new Set(
      rows?.map((row) => row.card_id) ?? []
    );

    const savedSetIds = new Set(
      [...savedCardIds].map((cardId) => getSetIdFromCardId(cardId))
    );

    const matchingSets = sets
      .filter(
        (set) =>
          savedSetIds.has(set.id) &&
          (matchesQuery(set.name, query) ||
            matchesQuery(set.id, query))
      )
      .slice(0, 6);

    const setNames = new Map(
      sets.map((set) => [set.id, set.name])
    );

    const matchingCards = cards
      .filter((card) => savedCardIds.has(card.id))
      .slice(0, 12)
      .map((card) => ({
        id: card.id,
        setId: getSetIdFromCardId(card.id),
        localId: card.localId,
        name: card.name,
        image: card.image,
        setName:
          setNames.get(getSetIdFromCardId(card.id)) ??
          getSetIdFromCardId(card.id),
      }));

    return (
      <SearchResults
        query={query}
        scope={scope}
        sets={matchingSets.map((set) => ({
          id: set.id,
          name: set.name,
          logo: set.logo,
          cards: set.cardCount.total,
          progress: 0,
          ownedCards: savedCardIds
            ? [...savedCardIds].filter(
                (cardId) => getSetIdFromCardId(cardId) === set.id
              ).length
            : 0,
        }))}
        cards={matchingCards}
      />
    );
  }

  if (scope === "set-cards") {
    if (!params.setId) {
      return <SearchResults query={query} scope={scope} sets={[]} cards={[]} />;
    }

    const set = await getSet(params.setId);

    if (!set) {
      return <SearchResults query={query} scope={scope} sets={[]} cards={[]} />;
    }

    const cards = (set.cards ?? [])
      .filter(
        (card) =>
          matchesQuery(card.name, query) ||
          matchesQuery(String(card.localId), query)
      )
      .slice(0, 12)
      .map((card) => ({
        id: card.id,
        setId: set.id,
        localId: String(card.localId),
        name: card.name,
        image: card.image,
        setName: set.name,
      }));

    return (
      <SearchResults
        query={query}
        scope={scope}
        sets={[]}
        cards={cards}
      />
    );
  }

  const [sets, cards] = await Promise.all([
    getAllSets("recent"),
    searchCards(query),
  ]);

  const matchingSets = sets
    .filter(
      (set) =>
        matchesQuery(set.name, query) ||
        matchesQuery(set.id, query)
    )
    .slice(0, 6);

  const setNames = new Map(
    sets.map((set) => [set.id, set.name])
  );

  const matchingCards = cards
    .slice(0, 12)
    .map((card) => ({
      id: card.id,
      setId: getSetIdFromCardId(card.id),
      localId: card.localId,
      name: card.name,
      image: card.image,
      setName:
        setNames.get(getSetIdFromCardId(card.id)) ??
        getSetIdFromCardId(card.id),
    }));

  return (
    <SearchResults
      query={query}
      scope={scope}
      sets={scope === "sets" ? matchingSets : scope === "all" ? matchingSets : []}
      cards={scope === "sets" ? [] : matchingCards}
    />
  );
}

interface SearchResultsProps {
  query: string;
  scope: SearchScope;
  sets: Array<{
    id: string;
    name: string;
    logo?: string;
    cards: number;
    progress: number;
    ownedCards?: number;
  }>;
  cards: Array<{
    id: string;
    setId: string;
    localId: string;
    name: string;
    image?: string;
    setName: string;
  }>;
}

function SearchResults({
  query,
  scope,
  sets,
  cards,
}: SearchResultsProps) {
  const cardBasePath =
    scope === "collection"
      ? "/collection"
      : scope === "wishlist"
        ? "/wishlist"
        : "/sets";

  const setBasePath =
    scope === "collection"
      ? "/collection"
      : scope === "wishlist"
        ? "/wishlist"
        : "/sets";

  const hasResults = sets.length > 0 || cards.length > 0;

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8">
          <p className="mb-2 text-sm font-medium text-zinc-500">
            Búsqueda
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Resultados
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Resultados para “{query}”
          </p>
        </section>

        {!hasResults ? (
          <GlassPanel strong className="p-10 text-center sm:p-16">
            <h2 className="text-xl font-semibold text-zinc-900">
              No encontramos resultados
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Prueba con otro nombre, número o código.
            </p>
          </GlassPanel>
        ) : (
          <div className="space-y-10">
            {sets.length > 0 && (
              <section>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      Sets
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                      Sets encontrados
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {sets.map((set) => (
                    <SetCard
                      key={set.id}
                      name={set.name}
                      code={set.id}
                      cards={set.cards}
                      ownedCards={set.ownedCards}
                      progress={set.progress}
                      logo={set.logo}
                      basePath={setBasePath}
                    />
                  ))}
                </div>
              </section>
            )}

            {cards.length > 0 && (
              <section>
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Cartas
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                    Cartas encontradas
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {cards.map((card) => (
                    <div key={card.id} className="relative">
                      <PokemonCard
                        setId={card.setId}
                        cardId={card.id}
                        number={card.localId}
                        name={card.name}
                        image={card.image}
                        owned={scope === "collection" || scope === "wishlist" ? true : false}
                        wishlist={scope === "wishlist"}
                        basePath={cardBasePath}
                      />
                      <p className="pointer-events-none absolute bottom-[88px] left-6 right-6 truncate text-[10px] font-medium text-zinc-400">
                        {card.setName}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
