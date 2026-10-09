import { redirect } from "next/navigation";

import GlassPanel from "@/components/ui/GlassPanel";
import SetCard from "@/components/pokemon/SetCard";
import PokemonCard from "@/components/pokemon/PokemonCard";

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

interface ResolvedSearchCard {
  id: string;
  setId: string;
  localId: string;
  name: string;
  image?: string;
  setName: string;
}

async function resolveCardResults(
  cards: Array<{
    id: string;
    localId: string;
    name: string;
    image?: string;
  }>
): Promise<ResolvedSearchCard[]> {
  return Promise.all(
    cards.slice(0, 12).map(async (card): Promise<ResolvedSearchCard> => {
      const fallbackSetId = getSetIdFromCardId(card.id);

      try {
        const fullCard = await getCard(card.id);

        if (!fullCard) {
          return {
            ...card,
            setId: fallbackSetId,
            setName: fallbackSetId,
          };
        }

        return {
          id: fullCard.id,
          localId: String(fullCard.localId),
          name: fullCard.name,
          image: fullCard.image,
          setId: fullCard.set.id,
          setName: fullCard.set.name,
        };
      } catch {
        return {
          ...card,
          setId: fallbackSetId,
          setName: fallbackSetId,
        };
      }
    })
  );
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 80) ?? "";
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
          <GlassPanel
            strong
            className="mx-auto max-w-2xl rounded-[28px] p-8 sm:p-10"
          >
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-500">
                Búsqueda
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
                Busca cartas o sets
              </h1>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Escribe un nombre, número o código para encontrar resultados.
              </p>
            </div>

            <form action="/search" method="get" className="mt-7 flex gap-2">
              <input
                type="search"
                name="q"
                autoFocus
                required
                placeholder="Buscar..."
                className="min-w-0 flex-1 rounded-full border border-black/5 bg-white/65 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-yellow-400 focus:bg-white/80"
              />
              <input type="hidden" name="scope" value={scope} />
              {params.setId && (
                <input type="hidden" name="setId" value={params.setId} />
              )}
              <button
                type="submit"
                className="yellow-button shrink-0 rounded-full px-5 py-3 text-sm font-semibold"
              >
                Buscar
              </button>
            </form>
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
      const reason =
        scope === "collection" ? "collection" : "wishlist";

      redirect(`/login?reason=${reason}`);
    }

    const [{ data: savedRows, error: savedError }, { data: collectionRows, error: collectionError }, { data: wishlistRows, error: wishlistError }, sets, cards] = await Promise.all([
      supabase
        .from(scope)
        .select("card_id")
        .eq("user_id", user.id),
      supabase
        .from("collection")
        .select("card_id")
        .eq("user_id", user.id),
      supabase
        .from("wishlist")
        .select("card_id")
        .eq("user_id", user.id),
      getAllSets("recent"),
      searchCards(query),
    ]);

    if (savedError || collectionError || wishlistError) {
      throw new Error(
        "Error obteniendo datos para la búsqueda."
      );
    }

    const savedCardIds = new Set(
      savedRows?.map((row) => row.card_id) ?? []
    );
    const collectionCardIds = new Set(
      collectionRows?.map((row) => row.card_id) ?? []
    );
    const wishlistCardIds = new Set(
      wishlistRows?.map((row) => row.card_id) ?? []
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

    const matchingCardBriefs = cards
      .filter((card) => savedCardIds.has(card.id))
      .slice(0, 12);

    const matchingCards = (
      await resolveCardResults(matchingCardBriefs)
    ).map((card) => ({
      id: card.id,
      setId: card.setId,
      localId: card.localId,
      name: card.name,
      image: card.image,
      setName:
        card.setName ??
        setNames.get(card.setId) ??
        card.setId,
    }));

    return (
      <SearchResults
        query={query}
        scope={scope}
        sets={matchingSets.map((set) => {
          const savedCount = [...savedCardIds].filter(
            (cardId) => getSetIdFromCardId(cardId) === set.id
          ).length;
          const progress =
            set.cardCount.total > 0
              ? Math.round(
                  (savedCount / set.cardCount.total) * 100
                )
              : 0;

          return {
            id: set.id,
            name: set.name,
            logo: set.logo,
            cards: set.cardCount?.total ?? 0,
            progress,
            ownedCards: savedCount,
          };
        })}
        cards={matchingCards}
        collectionCardIds={collectionCardIds}
        wishlistCardIds={wishlistCardIds}
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

  const matchingCardBriefs = cards.slice(0, 12);

  const matchingCards = (
    await resolveCardResults(matchingCardBriefs)
  ).map((card) => ({
    id: card.id,
    setId: card.setId,
    localId: card.localId,
    name: card.name,
    image: card.image,
    setName:
      card.setName ??
      setNames.get(card.setId) ??
      card.setId,
  }));

  const searchSets = matchingSets.map((set) => ({
    id: set.id,
    name: set.name,
    logo: set.logo,
    cards: set.cardCount?.total ?? 0,
    progress: 0,
  }));

  return (
    <SearchResults
      query={query}
      scope={scope}
      sets={scope === "sets" || scope === "all" ? searchSets : []}
      cards={scope === "sets" ? [] : matchingCards}
    />
  );
}

interface SearchResultsProps {
  query: string;
  scope: SearchScope;
  collectionCardIds?: Set<string>;
  wishlistCardIds?: Set<string>;
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
  collectionCardIds = new Set<string>(),
  wishlistCardIds = new Set<string>(),
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
                        setName={card.setName}
                        owned={collectionCardIds.has(card.id)}
                        wishlist={wishlistCardIds.has(card.id)}
                        basePath={cardBasePath}
                      />
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
