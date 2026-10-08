import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import PokemonCard from "@/components/pokemon/PokemonCard";
import { getSet } from "@/lib/tcgdex";

type SetData = NonNullable<Awaited<ReturnType<typeof getSet>>>;

interface SetDetailsPageProps {
  set: SetData;
  basePath: "/sets" | "/collection";
  ownedCardIds?: Set<string>;
  wishlistCardIds?: Set<string>;
}

export default function SetDetailsPage({
  set,
  basePath,
  ownedCardIds = new Set<string>(),
  wishlistCardIds = new Set<string>(),
}: SetDetailsPageProps) {
  const allCards = set.cards ?? [];
  const isCollection = basePath === "/collection";
  const cards = isCollection
    ? allCards.filter((card) => ownedCardIds.has(card.id))
    : allCards;
  const owned = ownedCardIds.size;
  const progress =
    set.cardCount.total > 0
      ? Math.round((owned / set.cardCount.total) * 100)
      : 0;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      <div className="soft-glow left-[-140px] top-[180px] h-72 w-72 bg-blue-300/20" />
      <div className="soft-glow right-[-120px] top-[300px] h-80 w-80 bg-yellow-200/30" />

      <div className="relative mx-auto min-h-screen max-w-[1400px] px-5 py-4 sm:px-8 lg:px-10">
        <section className="py-10 sm:py-14">
          <Link
            href={basePath}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Volver a {isCollection ? "colección" : "sets"}
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
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-zinc-400">
                {isCollection
                  ? `${owned} de ${set.cardCount.total} cartas · ${progress}%`
                  : "Progreso de colección"}
              </p>
            </GlassPanel>
          </div>
        </section>

        <section className="pb-16">
          {cards.length === 0 ? (
            <GlassPanel strong className="p-10 text-center sm:p-16">
              <h2 className="text-xl font-semibold text-zinc-900">
                No tienes cartas de este set
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Agrega cartas desde la sección de Sets para verlas aquí.
              </p>
            </GlassPanel>
          ) : (
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
                basePath={basePath}
              />
              ))}
            </div>
          )}
        </section>

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
