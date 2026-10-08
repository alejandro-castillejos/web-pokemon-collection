import Link from "next/link";
import { redirect } from "next/navigation";

import GlassPanel from "@/components/ui/GlassPanel";
import SetCard from "@/components/pokemon/SetCard";
import PokemonCard from "@/components/pokemon/PokemonCard";
import SetSort from "@/components/pokemon/SetSort";
import CardSort from "@/components/pokemon/CardSort";

import {
  getAllSets,
  getSet,
  getSetIdFromCardId,
  SetSort as SetSortType,
} from "@/lib/tcgdex";

import { createClient } from "@/lib/supabase/server";

interface WishlistPageProps {
  searchParams: Promise<{
    sort?: string;
    view?: string;
    cardSort?: string;
  }>;
}

const validSorts: SetSortType[] = [
  "recent",
  "oldest",
  "progress",
  "name",
  "name-desc",
];

const validCardSorts = [
  "set",
  "recent",
  "number",
  "number-desc",
  "name",
  "name-desc",
] as const;

type CardSortType = (typeof validCardSorts)[number];

export default async function WishlistPage({
  searchParams,
}: WishlistPageProps) {
  const params = await searchParams;

  const currentSort: SetSortType = validSorts.includes(
    params.sort as SetSortType
  )
    ? (params.sort as SetSortType)
    : "recent";

  const currentView = params.view === "sets" ? "sets" : "cards";

  const currentCardSort: CardSortType =
    validCardSorts.includes(params.cardSort as CardSortType)
      ? (params.cardSort as CardSortType)
      : "set";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?message=Inicia sesión para ver tu wishlist"
    );
  }

  const [wishlistResult, sets] = await Promise.all([
    supabase
      .from("wishlist")
      .select("card_id, created_at"),
    getAllSets(
      currentSort === "progress" ? "recent" : currentSort
    ),
  ]);

  if (wishlistResult.error) {
    throw new Error(
      `Error obteniendo la wishlist: ${wishlistResult.error.message}`
    );
  }

  const wishlistRows = wishlistResult.data ?? [];
  const wishlistAddedAt = new Map(
    wishlistRows.map((row) => [row.card_id, row.created_at])
  );
  const wishlistCardIds = new Set(
    wishlistRows.map((row) => row.card_id)
  );
  const totalCards = wishlistCardIds.size;

  const wishlistedBySet = new Map<string, number>();

  for (const cardId of wishlistCardIds) {
    const setId = getSetIdFromCardId(cardId);

    wishlistedBySet.set(
      setId,
      (wishlistedBySet.get(setId) ?? 0) + 1
    );
  }

  let wishlistSets = sets
    .filter((set) => (wishlistedBySet.get(set.id) ?? 0) > 0)
    .map((set) => {
      const wishlisted = wishlistedBySet.get(set.id) ?? 0;
      const progress =
        set.cardCount.total > 0
          ? Math.round(
              (wishlisted / set.cardCount.total) * 100
            )
          : 0;

      return {
        ...set,
        owned: wishlisted,
        progress,
      };
    });

  if (currentSort === "name-desc") {
    wishlistSets = [...wishlistSets].sort((a, b) =>
      b.name.localeCompare(a.name, "es")
    );
  }

  if (currentSort === "progress") {
    wishlistSets = [...wishlistSets].sort(
      (a, b) => {
        if (a.progress !== b.progress) {
          return b.progress - a.progress;
        }

        if (a.owned !== b.owned) {
          return b.owned - a.owned;
        }

        return 0;
      }
    );
  }

  let wishlistCards: Array<{
    id: string;
    localId: string;
    name: string;
    image?: string;
    createdAt: string;
    setId: string;
  }> = [];

  let ownedCardIds = new Set<string>();

  if (currentView === "cards" && totalCards > 0) {
    const [collectionResult, fullSets] = await Promise.all([
      supabase
        .from("collection")
        .select("card_id")
        .in("card_id", [...wishlistCardIds]),
      Promise.all(
        wishlistSets.map(async (set) => {
          try {
            return await getSet(set.id);
          } catch {
            return null;
          }
        })
      ),
    ]);

    if (collectionResult.error) {
      throw new Error(
        `Error obteniendo la colección: ${collectionResult.error.message}`
      );
    }

    ownedCardIds = new Set(
      collectionResult.data?.map((row) => row.card_id) ?? []
    );

    for (const set of fullSets) {
      if (!set) continue;

      for (const card of set.cards ?? []) {
        if (wishlistCardIds.has(card.id)) {
          wishlistCards.push({
            id: card.id,
            localId: String(card.localId),
            name: card.name,
            image: card.image,
            createdAt: wishlistAddedAt.get(card.id) ?? "",
            setId: set.id,
          });
        }
      }
    }
  }

  if (currentView === "cards") {
    const setOrder = new Map(
      wishlistSets.map((set, index) => [set.id, index])
    );

    wishlistCards.sort((a, b) => {
      if (currentCardSort === "set") {
        const setA =
          setOrder.get(a.setId) ?? Number.MAX_SAFE_INTEGER;
        const setB =
          setOrder.get(b.setId) ?? Number.MAX_SAFE_INTEGER;

        if (setA !== setB) {
          return setA - setB;
        }

        return (
          parseInt(a.localId, 10) -
          parseInt(b.localId, 10)
        );
      }

      if (currentCardSort === "recent") {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      }

      if (currentCardSort === "name") {
        return a.name.localeCompare(b.name, "es");
      }

      if (currentCardSort === "name-desc") {
        return b.name.localeCompare(a.name, "es");
      }

      if (currentCardSort === "number") {
        return (
          parseInt(a.localId, 10) -
          parseInt(b.localId, 10)
        );
      }

      return (
        parseInt(b.localId, 10) -
        parseInt(a.localId, 10)
      );
    });
  }

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-500">
                Mi wishlist
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Tu wishlist
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                {totalCards}{" "}
                {totalCards === 1 ? "carta" : "cartas"} ·{" "}
                {wishlistSets.length}{" "}
                {wishlistSets.length === 1 ? "set" : "sets"}
              </p>
            </div>

            <div className="flex flex-row flex-wrap items-center justify-end gap-3">
              <div className="glass inline-flex items-center rounded-full p-1">
                <Link
                  href={`/wishlist?view=sets&sort=${currentSort}`}
                  className={`rounded-full px-4 py-2 text-xs transition ${
                    currentView === "sets"
                      ? "bg-white/80 font-semibold text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:bg-white/50 hover:text-zinc-900"
                  }`}
                >
                  Sets
                </Link>

                <Link
                  href="/wishlist?view=cards"
                  className={`rounded-full px-4 py-2 text-xs transition ${
                    currentView === "cards"
                      ? "bg-white/80 font-semibold text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:bg-white/50 hover:text-zinc-900"
                  }`}
                >
                  Cartas
                </Link>
              </div>

              {currentView === "sets" && (
                <SetSort
                  currentSort={currentSort}
                  basePath="/wishlist"
                  view="sets"
                />
              )}

              {currentView === "cards" && (
                <CardSort
                  currentSort={currentCardSort}
                  basePath="/wishlist"
                />
              )}
            </div>
          </div>
        </section>

        {currentView === "sets" && (
          <>
            {wishlistSets.length === 0 ? (
              <GlassPanel
                strong
                className="p-10 text-center sm:p-16"
              >
                <div className="mx-auto max-w-md">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-2xl shadow-sm">
                    ♡
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-zinc-900">
                    Tu wishlist está vacía
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Explora los sets y agrega cartas que quieras conseguir.
                  </p>

                  <Link
                    href="/sets"
                    className="yellow-button mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
                  >
                    Explorar sets
                  </Link>
                </div>
              </GlassPanel>
            ) : (
              <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {wishlistSets.map((set) => (
                  <SetCard
                    key={set.id}
                    name={set.name}
                    code={set.id}
                    cards={set.cardCount.total}
                    ownedCards={set.owned}
                    progress={set.progress}
                    logo={set.logo}
                    basePath="/wishlist"
                    progressLabel="Wishlist"
                  />
                ))}
              </section>
            )}
          </>
        )}

        {currentView === "cards" && (
          <>
            {wishlistCards.length === 0 ? (
              <GlassPanel
                strong
                className="p-10 text-center sm:p-16"
              >
                <div className="mx-auto max-w-md">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-2xl shadow-sm">
                    ♡
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-zinc-900">
                    Tu wishlist está vacía
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Explora los sets y agrega cartas que quieras conseguir.
                  </p>

                  <Link
                    href="/sets"
                    className="yellow-button mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
                  >
                    Explorar sets
                  </Link>
                </div>
              </GlassPanel>
            ) : (
              <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {wishlistCards.map((card) => (
                  <PokemonCard
                    key={card.id}
                    setId={card.setId}
                    cardId={card.id}
                    number={card.localId}
                    name={card.name}
                    image={card.image}
                    owned={ownedCardIds.has(card.id)}
                    wishlist={true}
                    basePath="/wishlist"
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
