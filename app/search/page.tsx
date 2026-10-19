import Link from "next/link";
import { redirect } from "next/navigation";

import GlassPanel from "@/components/ui/GlassPanel";
import SetCard from "@/components/pokemon/SetCard";
import PokemonCard from "@/components/pokemon/PokemonCard";

import {
  getAllSets,
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

type SearchTab = "all" | "cards" | "sets" | "collection" | "wishlist";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    scope?: string;
    tab?: string;
    setId?: string;
    page?: string;
  }>;
}

function matchesQuery(value: string, query: string) {
  return value
    .toLocaleLowerCase("es")
    .includes(query.toLocaleLowerCase("es"));
}

const SEARCH_CARDS_PER_PAGE = 12;
const SEARCH_SETS_PER_PAGE = 6;
const MAX_SEARCH_PAGE = 100;

function buildNextPageHref(query: string, tab: SearchTab, page: number) {
  const params = new URLSearchParams({
    q: query,
    tab,
    page: String(page + 1),
  });

  return `/search?${params.toString()}`;
}

async function getUserCardStateIds(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      collectionCardIds: new Set<string>(),
      wishlistCardIds: new Set<string>(),
    };
  }

  const [collectionResult, wishlistResult] = await Promise.all([
    supabase
      .from("collection")
      .select("card_id")
      .eq("user_id", user.id),
    supabase
      .from("wishlist")
      .select("card_id")
      .eq("user_id", user.id),
  ]);

  if (collectionResult.error || wishlistResult.error) {
    throw new Error("Error obteniendo el estado de colección y wishlist.");
  }

  return {
    collectionCardIds: new Set(
      collectionResult.data?.map((row) => row.card_id) ?? []
    ),
    wishlistCardIds: new Set(
      wishlistResult.data?.map((row) => row.card_id) ?? []
    ),
  };
}
export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 80) ?? "";
  const legacyScope: SearchScope = [
    "all",
    "sets",
    "set-cards",
    "collection",
    "wishlist",
  ].includes(params.scope as SearchScope)
    ? (params.scope as SearchScope)
    : "all";

  const fallbackTab: SearchTab =
    legacyScope === "set-cards"
      ? "cards"
      : legacyScope === "sets" ||
          legacyScope === "collection" ||
          legacyScope === "wishlist"
        ? legacyScope
        : "all";

  const tab: SearchTab = [
    "all",
    "cards",
    "sets",
    "collection",
    "wishlist",
  ].includes(params.tab as SearchTab)
    ? (params.tab as SearchTab)
    : fallbackTab;

  const scope: SearchScope =
    tab === "sets" || tab === "collection" || tab === "wishlist"
      ? tab
      : "all";

  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, MAX_SEARCH_PAGE)
      : 1;
  const cardLimit = page * SEARCH_CARDS_PER_PAGE;
  const setLimit = page * SEARCH_SETS_PER_PAGE;

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
              <input type="hidden" name="tab" value="all" />
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

  if (scope === "collection" || scope === "wishlist") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const reason =
        scope === "collection" ? "collection" : "wishlist";

      const returnTo = `/search?q=${encodeURIComponent(query)}&tab=${scope}`;
      redirect(
        `/login?reason=${reason}&next=${encodeURIComponent(returnTo)}`
      );
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

    const matchingSetsAll = sets.filter(
      (set) =>
        savedSetIds.has(set.id) &&
        (matchesQuery(set.name, query) ||
          matchesQuery(set.id, query))
    );
    const matchingSets = matchingSetsAll.slice(0, setLimit);

    const setNames = new Map(
      sets.map((set) => [set.id, set.name])
    );

    const matchingCardsAll = cards
      .filter((card) => savedCardIds.has(card.id))
      .map((card) => {
        const setId = getSetIdFromCardId(card.id);

        return {
          id: card.id,
          setId,
          localId: String(card.localId),
          name: card.name,
          image: card.image,
          setName: setNames.get(setId) ?? setId,
        };
      });
    const matchingCards = matchingCardsAll.slice(0, cardLimit);

    return (
      <SearchResults
        query={query}
        scope={scope}
        activeTab={tab}
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
        totalSetResults={matchingSetsAll.length}
        totalCardResults={matchingCardsAll.length}
        hasMore={
          page < MAX_SEARCH_PAGE &&
          (matchingSetsAll.length > setLimit ||
            matchingCardsAll.length > cardLimit)
        }
        nextPageHref={buildNextPageHref(query, tab, page)}
      />
    );
  }

  const [sets, cards] = await Promise.all([
    getAllSets("recent"),
    searchCards(query),
  ]);

  const { collectionCardIds, wishlistCardIds } =
    scope === "all"
      ? await getUserCardStateIds(supabase)
      : {
          collectionCardIds: new Set<string>(),
          wishlistCardIds: new Set<string>(),
        };

  const matchingSetsAll = sets.filter(
    (set) =>
      matchesQuery(set.name, query) ||
      matchesQuery(set.id, query)
  );
  const setNames = new Map(
    sets.map((set) => [set.id, set.name])
  );

  const matchingCardsAll = cards.map((card) => {
    const setId = getSetIdFromCardId(card.id);

    return {
      id: card.id,
      setId,
      localId: String(card.localId),
      name: card.name,
      image: card.image,
      setName: setNames.get(setId) ?? setId,
    };
  });
  const matchingCards = matchingCardsAll.slice(0, cardLimit);

  const searchSetsAll = matchingSetsAll.map((set) => ({
    id: set.id,
    name: set.name,
    logo: set.logo,
    cards: set.cardCount?.total ?? 0,
    progress: 0,
  }));
  const searchSets = searchSetsAll.slice(0, setLimit);
  const totalSetResults =
    tab === "sets" || tab === "all" ? matchingSetsAll.length : 0;
  const totalCardResults =
    tab === "sets" ? 0 : matchingCardsAll.length;
  const hasMore =
    page < MAX_SEARCH_PAGE &&
    (
      ((tab === "sets" || tab === "all") && totalSetResults > setLimit) ||
      (tab !== "sets" && totalCardResults > cardLimit)
    );

  return (
    <SearchResults
      query={query}
      scope={scope}
      activeTab={tab}
      sets={tab === "sets" || tab === "all" ? searchSets : []}
      cards={tab === "sets" ? [] : matchingCards}
      collectionCardIds={collectionCardIds}
      wishlistCardIds={wishlistCardIds}
      totalSetResults={totalSetResults}
      totalCardResults={totalCardResults}
      hasMore={hasMore}
      nextPageHref={buildNextPageHref(query, tab, page)}
    />
  );
}

interface SearchResultsProps {
  query: string;
  scope: SearchScope;
  activeTab: SearchTab;
  collectionCardIds?: Set<string>;
  wishlistCardIds?: Set<string>;
  totalSetResults?: number;
  totalCardResults?: number;
  hasMore?: boolean;
  nextPageHref?: string;
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
  activeTab,
  collectionCardIds = new Set<string>(),
  wishlistCardIds = new Set<string>(),
  totalSetResults,
  totalCardResults,
  hasMore = false,
  nextPageHref,
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
  const allSetResults = totalSetResults ?? sets.length;
  const allCardResults = totalCardResults ?? cards.length;

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
          <p className="mt-2 text-xs text-zinc-400">
            {allCardResults > 0 &&
              `Mostrando ${cards.length} de ${allCardResults} cartas`}
            {allCardResults > 0 && allSetResults > 0 && " · "}
            {allSetResults > 0 &&
              `Mostrando ${sets.length} de ${allSetResults} sets`}
          </p>
        </section>

        <nav
          aria-label="Filtrar resultados de búsqueda"
          className="mb-8 flex gap-2 overflow-x-auto pb-2"
        >
          {([
            { value: "all", label: "Todo" },
            { value: "cards", label: "Cartas" },
            { value: "sets", label: "Sets" },
            { value: "collection", label: "Mi colección" },
            { value: "wishlist", label: "Wishlist" },
          ] satisfies Array<{ value: SearchTab; label: string }>).map((item) => {
            const isActive = activeTab === item.value;
            const href = `/search?q=${encodeURIComponent(query)}&tab=${item.value}`;

            return (
              <Link
                key={item.value}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#111111] text-white shadow-sm"
                    : "glass-hover glass text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

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
        {hasMore && nextPageHref && (
          <div className="mt-10 flex justify-center">
            <Link
              href={nextPageHref}
              scroll={false}
              className="yellow-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#111111]"
            >
              Cargar más resultados
              <span aria-hidden="true">↓</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
