import Image from "next/image";
import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import PokemonCard from "@/components/pokemon/PokemonCard";
import { getSet } from "@/lib/tcgdex";

type SetData = NonNullable<Awaited<ReturnType<typeof getSet>>>;

type SetFilter = "all" | "missing" | "collection" | "wishlist";

interface SetDetailsPageProps {
  set: SetData;
  basePath: "/sets" | "/collection" | "/wishlist";
  ownedCardIds?: Set<string>;
  wishlistCardIds?: Set<string>;
  filter?: SetFilter;
}

export default function SetDetailsPage({
  set,
  basePath,
  ownedCardIds = new Set<string>(),
  wishlistCardIds = new Set<string>(),
  filter = "all",
}: SetDetailsPageProps) {
  const allCards = set.cards ?? [];
  const isCollection = basePath === "/collection";
  const isWishlist = basePath === "/wishlist";

  const collectionCards = allCards.filter((card) =>
    ownedCardIds.has(card.id)
  );

  const missingCards = allCards.filter(
    (card) => !ownedCardIds.has(card.id)
  );

  const wishlistCards = allCards.filter((card) =>
    wishlistCardIds.has(card.id)
  );

  let cards = isCollection
    ? collectionCards
    : isWishlist
      ? wishlistCards
      : allCards;

  if (!isCollection && !isWishlist) {
    if (filter === "missing") cards = missingCards;
    if (filter === "collection") cards = collectionCards;
    if (filter === "wishlist") cards = wishlistCards;
  }

  const owned = ownedCardIds.size;
  const displayedCount = isWishlist ? wishlistCards.length : owned;
  const chaseCardsUrl = `https://tcgcompanion.app/sets/${set.name.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}/#chase-cards`;

  const progress =
    set.cardCount.total > 0
      ? Math.round((displayedCount / set.cardCount.total) * 100)
      : 0;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      <div className="soft-glow left-[-140px] top-[180px] h-72 w-72 bg-blue-300/20" />
      <div className="soft-glow right-[-120px] top-[300px] h-80 w-80 bg-yellow-200/30" />

      <div className="relative mx-auto min-h-screen max-w-[1400px] px-5 py-4 sm:px-8 lg:px-10">
        <section className="pb-10 pt-0 sm:pb-14">
          <Link
            href={basePath}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Volver a {isCollection ? "colección" : isWishlist ? "wishlist" : "sets"}
          </Link>

          <div className="mt-3 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              {set.logo ? (
                <div className="relative mb-5 h-20 w-full max-w-xs">
                  <Image
                    src={`${set.logo}.webp`}
                    alt={`Logo de ${set.name}`}
                    fill
                    sizes="320px"
                    quality={90}
                    className="object-contain"
                  />
                </div>
              ) : null}

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
                {displayedCount} / {set.cardCount.total}
              </p>

              <p className="mt-2 text-xs text-zinc-400">
                {set.cardCount.official} numeradas oficialmente
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-[#f2c72e]"
                  style={{
                    width:
                      displayedCount > 0
                        ? `${Math.max(progress, 1)}%`
                        : "0%",
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-zinc-400">
                {displayedCount}{" "}
                {displayedCount === 1 ? "carta" : "cartas"}{" "}
                {isWishlist ? "en wishlist de" : "de"}{" "}
                {set.cardCount.total}
              </p>

              {!isCollection && !isWishlist && (
                <a
                  href={chaseCardsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm font-semibold text-amber-900 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100 hover:shadow-sm"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="m12 3 2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 16.4l-5.25 2.8 1-5.85L3.5 9.2l5.9-.9L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Ver Chase Cards
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                    <path d="M7 4H4.75A1.75 1.75 0 0 0 3 5.75v9.5A1.75 1.75 0 0 0 4.75 17h9.5A1.75 1.75 0 0 0 16 15.25V13M11 3h6v6M17 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </GlassPanel>
          </div>
        </section>

        {!isCollection && (
          <section className="mb-8">
            <div className="flex flex-wrap items-center gap-3">
              {(
                [
                  { value: "all" as const, label: "Todas" },
                  { value: "missing" as const, label: "Me faltan" },
                  { value: "collection" as const, label: "Colección" },
                  { value: "wishlist" as const, label: "Wishlist" },
                ]
              ).map((option) => {
                const active = filter === option.value;
                const href =
                  option.value === "all"
                    ? `/sets/${set.id}`
                    : `/sets/${set.id}?filter=${option.value}`;

                return (
                  <Link
                    key={option.value}
                    href={href}
                    className={`rounded-full px-5 py-3 text-sm transition ${
                      active
                        ? "bg-white/80 font-semibold text-zinc-900 shadow-sm"
                        : "border border-transparent text-zinc-500 hover:bg-white/60 hover:text-zinc-900"
                    }`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="pb-16">
          {cards.length === 0 ? (
            <GlassPanel strong className="p-10 text-center sm:p-16">
              <h2 className="text-xl font-semibold text-zinc-900">
                {isCollection
                  ? "No tienes cartas de este set"
                  : isWishlist
                    ? "No tienes cartas de este set en tu wishlist"
                    : filter === "missing"
                    ? "No faltan cartas de este set"
                    : filter === "collection"
                      ? "No tienes cartas en tu colección de este set"
                      : filter === "wishlist"
                        ? "No tienes cartas de este set en tu wishlist"
                        : "No hay cartas disponibles"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {isCollection
                  ? "Agrega cartas desde la sección de Sets para verlas aquí."
                  : isWishlist
                    ? "Agrega cartas a tu wishlist desde la sección de Sets para verlas aquí."
                    : filter === "all"
                    ? "No se encontraron cartas para este set."
                    : "Prueba otro filtro para ver más cartas."}
              </p>
            </GlassPanel>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {cards.map((card, index) => (
                <PokemonCard
                key={card.id}
                setId={set.id}
                cardId={card.id}
                number={String(card.localId)}
                name={card.name}
                image={card.image}
                priority={index === 0}
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
