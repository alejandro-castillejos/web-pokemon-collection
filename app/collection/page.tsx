import Link from "next/link";
import { redirect } from "next/navigation";

import GlassPanel from "@/components/ui/GlassPanel";
import SetCard from "@/components/pokemon/SetCard";
import SetSort from "@/components/pokemon/SetSort";

import {
  getAllSets,
  getSetIdFromCardId,
  SetSort as SetSortType,
} from "@/lib/tcgdex";

import { createClient } from "@/lib/supabase/server";

interface CollectionPageProps {
  searchParams: Promise<{
    sort?: string;
  }>;
}

const validSorts: SetSortType[] = [
  "recent",
  "oldest",
  "name",
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

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?message=Inicia sesión para ver tu colección"
    );
  }

  // Obtener las cartas que pertenecen a la colección del usuario.
  const { data: collectionRows, error } = await supabase
    .from("collection")
    .select("card_id");

  if (error) {
    throw new Error(
      `Error obteniendo la colección: ${error.message}`
    );
  }

  // Agrupar cantidad de cartas por set.
  const ownedBySet = new Map<string, number>();

  for (const row of collectionRows ?? []) {
    const setId = getSetIdFromCardId(row.card_id);

    ownedBySet.set(
      setId,
      (ownedBySet.get(setId) ?? 0) + 1
    );
  }

  const totalCards = collectionRows?.length ?? 0;

  // Para "Mayor progreso" usamos "Más recientes" como orden base.
  const sets = await getAllSets(
    currentSort === "progress" ? "recent" : currentSort
  );

  // Nos quedamos únicamente con los sets que tienen
  // al menos una carta en la colección.
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

  // Orden especial por progreso.
  if (currentSort === "progress") {
    collectionSets = [...collectionSets].sort(
      (a, b) => {
        // Mayor progreso primero.
        if (a.progress !== b.progress) {
          return b.progress - a.progress;
        }

        // En empate se conserva el orden base,
        // que es "Más recientes".
        return 0;
      }
    );
  }

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-500">
                Mi colección
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Tus sets
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                {totalCards}{" "}
                {totalCards === 1 ? "carta" : "cartas"} ·{" "}
                {collectionSets.length}{" "}
                {collectionSets.length === 1 ? "set" : "sets"}
              </p>
            </div>

            <SetSort
              currentSort={currentSort}
              basePath="/collection"
            />
          </div>
        </section>

        {/* Colección vacía */}
        {collectionSets.length === 0 ? (
          <GlassPanel strong className="p-10 text-center sm:p-16">
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
          /* Sets de la colección */
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
      </div>
    </main>
  );
}