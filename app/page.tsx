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
      .eq("user_id", user.id)
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

    bestSet = ownedSets[0] ?? null;

    for (const set of ownedSets) {
      if (!bestSet) {
        bestSet = set;
        continue;
      }

      if (set.progress > bestSet.progress) {
        bestSet = set;
        continue;
      }

      if (
        set.progress === bestSet.progress &&
        set.owned > bestSet.owned
      ) {
        bestSet = set;
      }
    }

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
      (card) => card !== null
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      {/* Iluminación ambiental */}
      <div
        aria-hidden="true"
        className="hero-glass-art absolute right-[-4rem] top-[-2rem] z-0 h-[340px] w-[90vw] sm:h-[420px] lg:h-[520px] lg:w-[58vw]"
      >
        <svg
          viewBox="0 0 760 560"
          fill="none"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="glass-ribbon-a" x1="150" y1="50" x2="610" y2="450" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity=".92" />
              <stop offset=".48" stopColor="#DDE8F2" stopOpacity=".42" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity=".08" />
            </linearGradient>
            <linearGradient id="glass-ribbon-b" x1="350" y1="20" x2="700" y2="420" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity=".8" />
              <stop offset=".5" stopColor="#D8DEE8" stopOpacity=".24" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity=".04" />
            </linearGradient>
            <radialGradient id="glass-light" cx="0" cy="0" r="1" gradientTransform="matrix(-290 250 -220 -255 560 120)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity=".95" />
              <stop offset=".52" stopColor="#E5EDF5" stopOpacity=".48" />
              <stop offset="1" stopColor="#F4F6F9" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="500" cy="190" rx="300" ry="250" fill="url(#glass-light)" />
          <path d="M330 -20C470 45 480 130 610 160C690 178 735 230 790 300L790 430C680 345 615 340 535 280C435 205 400 120 280 85C230 70 205 25 195 -20H330Z" fill="url(#glass-ribbon-a)" />
          <path d="M470 -30C565 65 545 135 650 205C700 238 735 275 780 330L780 395C690 340 625 300 580 245C515 165 505 100 400 30L470 -30Z" fill="url(#glass-ribbon-b)" />
          <path d="M220 10C340 75 365 155 475 205C565 246 610 300 680 370" stroke="#FFFFFF" strokeOpacity=".8" strokeWidth="2" />
          <path d="M330 0C425 78 435 145 535 205C600 245 650 295 715 350" stroke="#D4DDE7" strokeOpacity=".62" strokeWidth="1.5" />
          <path d="M410 -10C485 70 485 120 565 175C640 228 670 260 740 315" stroke="#FFFFFF" strokeOpacity=".72" strokeWidth="1.5" />
          <path d="M270 95C365 130 390 215 500 265C570 298 615 350 660 405" stroke="#FFFFFF" strokeOpacity=".48" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="soft-glow left-[-120px] top-[120px] h-72 w-72 bg-blue-300/30" />
      <div className="soft-glow right-[-100px] top-[220px] h-80 w-80 bg-yellow-200/35" />
      <div className="soft-glow bottom-[80px] left-[40%] h-72 w-72 bg-emerald-200/20" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col px-5 py-4 sm:px-8 lg:px-10">
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
                  <Link
                    href="/collection?view=sets"
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 transition hover:bg-white/30 sm:px-5"
                    aria-label="Ver sets de mi colección"
                  >
                    <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-zinc-700 sm:flex">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <rect x="4" y="4" width="16" height="16" rx="3" />
                        <path d="M8 8h8M8 12h8M8 16h5" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="text-lg font-bold leading-none sm:text-2xl">
                        {totalSets}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Sets
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/collection?view=cards"
                    className="flex min-w-0 flex-1 items-center gap-3 border-l border-black/5 px-4 py-4 transition hover:bg-white/30 sm:px-5"
                    aria-label="Ver cartas de mi colección"
                  >
                    <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-zinc-700 sm:flex">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <rect x="6" y="4" width="12" height="16" rx="2.5" />
                        <path d="M9 8h6M9 12h6M9 16h3.5" />
                        <path d="M4 7v10a2 2 0 0 0 2 2M20 7v10a2 2 0 0 1-2 2" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="text-lg font-bold leading-none sm:text-2xl">
                        {totalCards}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Cartas
                      </p>
                    </div>
                  </Link>

                  <Link
                    href={bestSet ? `/sets/${bestSet.id}` : "/sets"}
                    className="flex min-w-0 flex-[1.35] items-center gap-3 border-l border-black/5 px-4 py-4 transition hover:bg-white/30 sm:px-5"
                    aria-label={
                      bestSet
                        ? `Ver mejor set: ${bestSet.name}`
                        : "Explorar sets"
                    }
                  >
                    <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-zinc-700 sm:flex">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M12 3.5 14 8l4.8.5-3.6 3.2 1 4.7L12 14l-4.2 2.4 1 4.7L5.2 8.5 10 8l2-4.5Z" />
                        <path d="M7 19h10" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-bold leading-tight text-zinc-900 sm:text-base"
                        title={bestSet?.name ?? "Sin set"}
                      >
                        {bestSet?.name ?? "Sin set"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Mejor set
                      </p>
                    </div>
                  </Link>
                </GlassPanel>
              </>
            )}          </div>

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
                  {user
                    ? "Aún no has añadido cartas"
                    : "Crea tu cuenta o inicia sesión para empezar tu colección"}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {user
                    ? "Tus últimas cartas aparecerán aquí."
                    : "Tu colección TCG como ninguna"}
                </p>
              </div>
            )}

            <Link
              href={user ? "/collection" : "/login"}
              className="mt-5 flex w-full items-center justify-center rounded-2xl py-3 text-sm font-semibold text-zinc-800 transition hover:bg-black/5"
            >
              {user ? "Ver colección" : "Iniciar sesión"}
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