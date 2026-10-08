import Link from "next/link";

import GlassPanel from "@/components/ui/GlassPanel";
import CardImage from "@/components/pokemon/CardImage";

import {
  getAllSets,
  getCard,
  getSet,
  getSetIdFromCardId,
} from "@/lib/tcgdex";

import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: collectionRows, error: collectionError } = user
    ? await supabase
        .from("collection")
        .select("card_id, created_at")
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (collectionError) {
    throw new Error(
      `Error obteniendo la colección: ${collectionError.message}`
    );
  }

  const collection = collectionRows ?? [];
  const totalCards = collection.length;

  let totalSets = 0;
  let completedSets = 0;
  let bestSet: {
    id: string;
    name: string;
    logo?: string;
    owned: number;
    total: number;
    progress: number;
  } | null = null;

  let recentCards: Array<{
    id: string;
    setId: string;
    name: string;
    setName: string;
    image?: string;
  }> = [];

  if (totalCards > 0) {
    const sets = await getAllSets("recent");

    const ownedBySet = new Map<string, number>();

    for (const row of collection) {
      const setId = getSetIdFromCardId(row.card_id);

      ownedBySet.set(
        setId,
        (ownedBySet.get(setId) ?? 0) + 1
      );
    }

    const ownedSets = sets
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
          id: set.id,
          name: set.name,
          logo: set.logo,
          owned,
          total: set.cardCount.total,
          progress,
        };
      });

    totalSets = ownedSets.length;
    completedSets = ownedSets.filter(
      (set) => set.owned >= set.total
    ).length;

    bestSet =
      ownedSets.reduce<typeof bestSet>((best, set) => {
        if (!best) return set;

        if (set.progress > best.progress) {
          return set;
        }

        if (
          set.progress === best.progress &&
          set.owned > best.owned
        ) {
          return set;
        }

        return best;
      }, null);

    const latestRows = collection.slice(0, 3);

    const resolvedRecentCards = await Promise.all(
      latestRows.map(async (row) => {
        try {
          const setId = getSetIdFromCardId(row.card_id);

          const [card, set] = await Promise.all([
            getCard(row.card_id),
            getSet(setId),
          ]);

          if (!card || !set) {
            return null;
          }

          return {
            id: card.id,
            setId,
            name: card.name,
            setName: set.name,
            image: card.image,
          };
        } catch {
          return null;
        }
      })
    );

    recentCards = resolvedRecentCards.filter(
      (
        card
      ): card is {
        id: string;
        setId: string;
        name: string;
        setName: string;
        image?: string;
      } => card !== null
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      {/* Iluminación ambiental */}
      <div className="soft-glow left-[-120px] top-[120px] h-72 w-72 bg-blue-300/30" />
      <div className="soft-glow right-[-100px] top-[220px] h-80 w-80 bg-yellow-200/35" />
      <div className="soft-glow bottom-[80px] left-[40%] h-72 w-72 bg-emerald-200/20" />

      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col px-5 py-4 sm:px-8 lg:px-10">
        {/* HERO */}
        <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.45fr_0.7fr] lg:py-20">
          <div>
            <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
              <span className="h-px w-8 bg-zinc-400" />
              Tu colección, tu aventura
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-[0.96] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Todas tus cartas.
              <span className="mt-1 block text-[#f2c72e]">
                Un solo lugar.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              Explora sets, registra tu colección y sigue completando tu
              recorrido por el mundo de Pokémon TCG.
            </p>

            {totalCards === 0 ? (
              <GlassPanel
                strong
                className="mt-8 max-w-2xl rounded-[28px] p-6 sm:p-7"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  {user ? "Tu colección" : "Comienza aquí"}
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
                  Comienza tu colección
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                  Explora los sets disponibles, agrega las cartas que tienes y
                  comienza a seguir tu progreso.
                </p>

                <Link
                  href="/sets"
                  className="yellow-button mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
                >
                  Explorar sets
                  <span className="ml-2">→</span>
                </Link>
              </GlassPanel>
            ) : (
              <>
                <GlassPanel className="mt-8 flex max-w-2xl overflow-hidden rounded-[24px]">
                  {[
                    {
                      label: "Sets",
                      value: String(totalSets),
                      icon: "≋",
                    },
                    {
                      label: "Cartas",
                      value: String(totalCards),
                      icon: "▤",
                    },
                    {
                      label: "Sets completos",
                      value: String(completedSets),
                      icon: "✓",
                    },
                  ].map((stat, index, allStats) => (
                    <div
                      key={stat.label}
                      className={`flex flex-1 items-center gap-3 px-5 py-4 ${
                        index !== allStats.length - 1
                          ? "border-r border-black/5"
                          : ""
                      }`}
                    >
                      <div className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-lg sm:flex">
                        {stat.icon}
                      </div>

                      <div>
                        <p className="text-lg font-bold leading-none sm:text-2xl">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </GlassPanel>

                {bestSet && (
                  <GlassPanel
                    strong
                    className="mt-5 max-w-2xl rounded-[28px] p-5 sm:p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                          Mejor set
                        </p>

                        <Link
                          href={`/sets/${bestSet.id}`}
                          className="mt-2 block truncate text-xl font-bold tracking-tight text-zinc-900 transition hover:text-zinc-600 sm:text-2xl"
                        >
                          {bestSet.name}
                        </Link>

                        <p className="mt-1 text-sm text-zinc-500">
                          {bestSet.owned} de {bestSet.total} cartas
                        </p>
                      </div>

                      {bestSet.logo ? (
                        <Link
                          href={`/sets/${bestSet.id}`}
                          className="flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/55 p-2"
                          aria-label={`Ver set ${bestSet.name}`}
                        >
                          <img
                            src={`${bestSet.logo}.webp`}
                            alt={`Logo de ${bestSet.name}`}
                            className="max-h-12 max-w-full object-contain"
                          />
                        </Link>
                      ) : null}
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/5">
                      <div
                        className="h-full rounded-full bg-[#f2c72e]"
                        style={{
                          width:
                            bestSet.progress > 0
                              ? `${Math.max(bestSet.progress, 1)}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </GlassPanel>
                )}
              </>
            )}
          </div>

          {/* ÚLTIMOS AÑADIDOS */}
          <GlassPanel
            strong
            className="self-center rounded-[32px] p-5 sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Colección
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#111111]">
                  Últimos añadidos
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-300/45 text-lg">
                ⚡
              </div>
            </div>

            {recentCards.length > 0 ? (
              <div className="space-y-3">
                {recentCards.map((card) => (
                  <Link
                    key={card.id}
                    href={`/collection/${card.setId}/${card.id}`}
                    className="glass-hover flex items-center gap-3 rounded-2xl border border-black/5 bg-white/45 p-3"
                  >
                    <div className="h-14 w-11 shrink-0 overflow-hidden rounded-xl bg-zinc-100 shadow-inner">
                      <CardImage
                        src={card.image}
                        alt={card.name}
                        name={card.name}
                        number=""
                        quality="low"
                        className="block h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#111111]">
                        {card.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {card.setName}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/5 bg-white/45 p-6 text-center">
                <p className="text-sm font-semibold text-zinc-700">
                  Aún no has añadido cartas
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Tus últimas cartas aparecerán aquí.
                </p>
              </div>
            )}

            <Link
              href="/collection"
              className="mt-5 flex w-full items-center justify-center rounded-2xl py-3 text-sm font-semibold text-zinc-800 transition hover:bg-black/5"
            >
              Ver colección
              <span className="ml-2">→</span>
            </Link>
          </GlassPanel>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-black/5 py-5 text-xs text-zinc-400">
          <div className="flex items-center justify-between">
            <span>Pokémon TCG Collection</span>
            <span>MVP v0.1</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
