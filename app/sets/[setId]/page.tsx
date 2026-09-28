import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import GlassButton from "@/components/ui/GlassButton";
import PokemonCard from "@/components/pokemon/PokemonCard";
import { getSet } from "@/lib/tcgdex";
import { createClient } from "@/lib/supabase/server";

interface SetPageProps {
  params: Promise<{
    setId: string;
  }>;
}

export default async function SetPage({ params }: SetPageProps) {
  const { setId } = await params;

  const set = await getSet(setId);

  if (!set) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-6">
        <GlassPanel className="max-w-md rounded-[28px] p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Error
          </p>

          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            Set no encontrado
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            El set que intentaste abrir no existe.
          </p>

          <Link
            href="/sets"
            className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Volver a sets
          </Link>
        </GlassPanel>
      </main>
    );
  }

  const cards = set.cards ?? [];
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ownedCardIds = new Set<string>();
  const wishlistCardIds = new Set<string>();

  if (user && cards.length > 0) {
    const cardIds = cards.map((card) => card.id);

    const [collectionResult, wishlistResult] = await Promise.all([
      supabase
        .from("collection")
        .select("card_id")
        .eq("user_id", user.id)
        .in("card_id", cardIds),

      supabase
        .from("wishlist")
        .select("card_id")
        .eq("user_id", user.id)
        .in("card_id", cardIds),
    ]);

    (collectionResult.data ?? []).forEach((item) => {
      ownedCardIds.add(item.card_id);
    });

    (wishlistResult.data ?? []).forEach((item) => {
      wishlistCardIds.add(item.card_id);
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      <div className="soft-glow left-[-140px] top-[180px] h-72 w-72 bg-blue-300/20" />

      <div className="soft-glow right-[-120px] top-[300px] h-80 w-80 bg-yellow-200/30" />

      <div className="relative mx-auto min-h-screen max-w-[1400px] px-5 py-4 sm:px-8 lg:px-10">

        {/* Encabezado */}
        <section className="py-10 sm:py-14">
          <Link
            href="/sets"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Volver a sets
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-5 flex h-20 items-center">
                {set.logo ? (
                  <img
                    src={`${set.logo}.webp`}
                    alt={`Logo de ${set.name}`}
                    className="max-h-20 max-w-xs object-contain"
                  />
                ) : null}
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                {set.id}
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-zinc-900 sm:text-6xl">
                {set.name}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
                Revisa todas las cartas de la expansión y lleva el control de
                tu colección.
              </p>
            </div>

            <GlassPanel className="rounded-[24px] p-5 lg:min-w-[260px]">
              <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">
                Cartas
              </p>

              <p className="mt-1 text-3xl font-bold text-zinc-900">
                {set.cardCount.total}
              </p>

              <p className="mt-2 text-xs text-zinc-400">
                {set.cardCount.official} numeradas oficialmente
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-[#f2c72e]"
                  style={{ width: "0%" }}
                />
              </div>

              <p className="mt-2 text-xs text-zinc-400">
                Progreso de colección próximamente
              </p>
            </GlassPanel>
          </div>
        </section>

        {/* Filtros */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <GlassButton>
              Todas
            </GlassButton>

            <button
              type="button"
              className="rounded-full border border-transparent px-5 py-3 text-sm font-medium text-zinc-500 transition hover:bg-white/60 hover:text-zinc-900"
            >
              Me faltan
            </button>

            <button
              type="button"
              className="rounded-full border border-transparent px-5 py-3 text-sm font-medium text-zinc-500 transition hover:bg-white/60 hover:text-zinc-900"
            >
              Colección
            </button>

            <button
              type="button"
              className="rounded-full border border-transparent px-5 py-3 text-sm font-medium text-zinc-500 transition hover:bg-white/60 hover:text-zinc-900"
            >
              Wishlist
            </button>
          </div>
        </section>

        {/* Grid */}
        <section className="pb-16">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {cards.map((card) => (
              <PokemonCard
                key={card.id}
                setId={set.id}
                cardId={card.id}
                number={String(card.localId)}
                name={card.name}
                image={card.image}
                owned={ownedCardIds.has(card.id)}
                wishlist={wishlistCardIds.has(card.id)}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
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