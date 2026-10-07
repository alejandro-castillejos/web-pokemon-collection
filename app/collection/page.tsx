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

interface CollectionPageProps {
  searchParams: Promise<{
    sort?: string;
    view?: string;
    cardSort?: string;
  }>;
}

const validSorts: SetSortType[] = [
  "recent",
  "oldest",
  "name",
  "name-desc",
  "progress",
];

export default async function CollectionPage({
  searchParams,
}: CollectionPageProps) {
  const params = await searchParams;

  const currentSort: SetSortType = validSorts.includes(
    params.sort as SetSortType
  )
    ? (params.sort as SetSortType)
    : "recent";

  const currentView = params.view === "cards" ? "cards" : "sets";

  const validCardSorts = [
  "name",
  "name-desc",
  "number",
  "number-desc",
] as const;

type CardSortType = (typeof validCardSorts)[number];

const currentCardSort: CardSortType =
  validCardSorts.includes(params.cardSort as CardSortType)
    ? (params.cardSort as CardSortType)
    : "name";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?message=Inicia sesión para ver tu colección"
    );
  }

  // La colección y los sets son independientes, así que se obtienen en paralelo.
  const [collectionResult, sets] = await Promise.all([
    supabase
      .from("collection")
      .select("card_id"),
    getAllSets(
      currentSort === "progress" ? "recent" : currentSort
    ),
  ]);

  if (collectionResult.error) {
    throw new Error(
      `Error obteniendo la colección: ${collectionResult.error.message}`
    );
  }

  const ownedCardIds = new Set(
    collectionResult.data?.map((row) => row.card_id) ?? []
  );

  const totalCards = ownedCardIds.size;

  // Agrupar cartas por set.
  const ownedBySet = new Map<string, number>();

  for (const cardId of ownedCardIds) {
    const setId = getSetIdFromCardId(cardId);

    ownedBySet.set(
      setId,
      (ownedBySet.get(setId) ?? 0) + 1
    );
  }

  // Solo mostrar sets que tengan al menos una carta.
  let collectionSets = sets
    .filter((set) => (ownedBySet.get(set.id) ?? 0) > 0)
    .map((set) => {
      const owned = ownedBySet.get(set.id) ?? 0;

      const progress =
        set.cardCount.total > 0
          ? Math.round(
              (owned / set.cardCount.total) * 100
            )
          : 0;

      return {
        ...set,
        owned,
        progress,
      };
    });

  // Orden especial por nombre Z-A.
  if (currentSort === "name-desc") {
    collectionSets = [...collectionSets].sort((a, b) =>
      b.name.localeCompare(a.name, "es")
    );
  }

  // Orden especial por progreso.
  if (currentSort === "progress") {
    collectionSets = [...collectionSets].sort(
      (a, b) => {
        if (a.progress !== b.progress) {
          return b.progress - a.progress;
        }

        // En empate se mantiene el orden de más recientes.
        return 0;
      }
    );
  }

  // Obtener wishlist solo cuando estamos en la vista de cartas.
  let wishlistCardIds = new Set<string>();

  if (currentView === "cards" && totalCards > 0) {
    const { data: wishlistRows, error: wishlistError } =
      await supabase
        .from("wishlist")
        .select("card_id")
        .in("card_id", [...ownedCardIds]);

    if (wishlistError) {
      throw new Error(
        `Error obteniendo la wishlist: ${wishlistError.message}`
      );
    }

    wishlistCardIds = new Set(
      wishlistRows?.map((row) => row.card_id) ?? []
    );
  }

  // Para la vista de cartas necesitamos obtener la información
  // completa de los sets que forman parte de la colección.
  let collectionCards: Array<{
    id: string;
    localId: string;
    name: string;
    image?: string;
    setId: string;
  }> = [];

  if (currentView === "cards" && collectionSets.length > 0) {
    const fullSets = await Promise.all(
      collectionSets.map(async (set) => {
        try {
          return await getSet(set.id);
        } catch {
          return null;
        }
      })
    );

    for (const set of fullSets) {
      if (!set) continue;

      for (const card of set.cards ?? []) {
        if (ownedCardIds.has(card.id)) {
          collectionCards.push({
            id: card.id,
            localId: String(card.localId),
            name: card.name,
            image: card.image,
            setId: set.id,
          });
        }
      }
    }
  }

  if (currentView === "cards") {
      collectionCards.sort((a, b) => {
        if (currentCardSort === "name") {
          return a.name.localeCompare(b.name, "es");
        }

        if (currentCardSort === "name-desc") {
          return b.name.localeCompare(a.name, "es");
        }

        const numberA = parseInt(a.localId, 10);
        const numberB = parseInt(b.localId, 10);

        if (currentCardSort === "number") {
          return numberA - numberB;
        }

        return numberB - numberA;
      });
    }

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-500">
                Mi colección
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Tu colección
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                {totalCards}{" "}
                {totalCards === 1 ? "carta" : "cartas"} ·{" "}
                {collectionSets.length}{" "}
                {collectionSets.length === 1 ? "set" : "sets"}
              </p>
            </div>

            <div className="flex flex-row flex-wrap items-center justify-end gap-3">
              {/* Selector de vista */}
              <div className="glass inline-flex items-center rounded-full p-1">
                <Link
                  href={`/collection?view=sets&sort=${currentSort}`}
                  className={`rounded-full px-4 py-2 text-xs transition ${
                    currentView === "sets"
                      ? "bg-white/80 font-semibold text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:bg-white/50 hover:text-zinc-900"
                  }`}
                >
                  Sets
                </Link>

                <Link
                  href={`/collection?view=cards`}
                  className={`rounded-full px-4 py-2 text-xs transition ${
                    currentView === "cards"
                      ? "bg-white/80 font-semibold text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:bg-white/50 hover:text-zinc-900"
                  }`}
                >
                  Cartas
                </Link>
              </div>

              {/* Ordenamiento */}
              {currentView === "sets" && (
                <SetSort
                  currentSort={currentSort}
                  basePath="/collection"
                  view="sets"
                />
              )}

              {currentView === "cards" && (
                <CardSort currentSort={currentCardSort} />
              )}
            </div>
          </div>
        </section>

        {/* Vista Sets */}
        {currentView === "sets" && (
          <>
            {collectionSets.length === 0 ? (
              <GlassPanel
                strong
                className="p-10 text-center sm:p-16"
              >
                <div className="mx-auto max-w-md">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-2xl shadow-sm">
                    +
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-zinc-900">
                    Tu colección está vacía
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Explora los sets y agrega tus primeras cartas.
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
                {collectionSets.map((set) => (
                  <SetCard
                    key={set.id}
                    name={set.name}
                    code={set.id}
                    cards={set.cardCount.total}
                    ownedCards={set.owned}
                    progress={set.progress}
                    logo={set.logo}
                    basePath="/collection"
                  />
                ))}
              </section>
            )}
          </>
        )}

        {/* Vista Cartas */}
        {currentView === "cards" && (
          <>
            {collectionCards.length === 0 ? (
              <GlassPanel
                strong
                className="p-10 text-center sm:p-16"
              >
                <div className="mx-auto max-w-md">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-2xl shadow-sm">
                    +
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-zinc-900">
                    Tu colección está vacía
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Explora los sets y agrega tus primeras cartas.
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
              <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {collectionCards.map((card) => (
                  <PokemonCard
                    key={card.id}
                    setId={card.setId}
                    cardId={card.id}
                    number={card.localId}
                    name={card.name}
                    image={card.image}
                    owned={true}
                    wishlist={wishlistCardIds.has(card.id)}
                    navigationContext="collection"
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