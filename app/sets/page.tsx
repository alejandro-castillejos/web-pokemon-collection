import GlassPanel from "@/components/ui/GlassPanel";
import SetCard from "@/components/pokemon/SetCard";
import SetSort from "@/components/pokemon/SetSort";

import {
  getAllSets,
  getSetIdFromCardId,
  SetSort as SetSortType,
} from "@/lib/tcgdex";

import { createClient } from "@/lib/supabase/server";

interface SetsPageProps {
  searchParams: Promise<{
    sort?: string;
  }>;
}

const validSorts: SetSortType[] = [
  "recent",
  "oldest",
  "name",
  "name-desc",
  "progress",
];

export default async function SetsPage({
  searchParams,
}: SetsPageProps) {
  const params = await searchParams;

  const currentSort: SetSortType = validSorts.includes(
    params.sort as SetSortType
  )
    ? (params.sort as SetSortType)
    : "recent";

  const supabase = await createClient();

  // Iniciamos TCGdex y la autenticación al mismo tiempo.
  const [sets, authResult] = await Promise.all([
    getAllSets(
      currentSort === "progress" ? "recent" : currentSort
    ),
    supabase.auth.getClaims(),
  ]);

  const { data: claims } = authResult;

  const ownedBySet = new Map<string, number>();

  // Solo necesitamos consultar collection si existe un usuario.
  if (claims) {
    const { data: collectionRows, error } = await supabase
      .from("collection")
      .select("card_id");

    if (error) {
      throw new Error(
        `Error obteniendo el progreso: ${error.message}`
      );
    }

    for (const row of collectionRows ?? []) {
      const setId = getSetIdFromCardId(row.card_id);

      ownedBySet.set(
        setId,
        (ownedBySet.get(setId) ?? 0) + 1
      );
    }
  }

  // Calcular el progreso real de cada set.
  const setsWithProgress = sets.map((set) => {
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

  let orderedSets = setsWithProgress;

  // Orden especial: Mayor progreso.
  if (currentSort === "progress") {
    // "sets" ya viene ordenado por más recientes.
    // Por eso, cuando hay empate de progreso,
    // se conserva ese orden.
    orderedSets = [...setsWithProgress].sort((a, b) => {
      const progressA =
        a.cardCount.total > 0
          ? a.owned / a.cardCount.total
          : 0;

      const progressB =
        b.cardCount.total > 0
          ? b.owned / b.cardCount.total
          : 0;

      if (progressA !== progressB) {
        return progressB - progressA;
      }

      return 0;
    });
  }

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-500">
                Pokémon TCG
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Sets
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Explora todos los sets disponibles.
              </p>
            </div>

            <SetSort currentSort={currentSort} />
          </div>
        </section>

        {orderedSets.length === 0 ? (
          <GlassPanel strong className="p-10 text-center">
            <p className="text-sm text-zinc-500">
              No hay sets disponibles.
            </p>
          </GlassPanel>
        ) : (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {orderedSets.map((set) => (
              <SetCard
                key={set.id}
                name={set.name}
                code={set.id}
                cards={set.cardCount.total}
                progress={set.progress}
                logo={set.logo}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}