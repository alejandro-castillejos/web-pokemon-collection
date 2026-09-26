import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import GlassPanel from "@/components/ui/GlassPanel";
import PokemonCard from "@/components/pokemon/PokemonCard";

import { getSet } from "@/lib/tcgdex";
import { createClient } from "@/lib/supabase/server";

interface CollectionSetPageProps {
  params: Promise<{
    setId: string;
  }>;
}

export default async function CollectionSetPage({
  params,
}: CollectionSetPageProps) {
  const { setId } = await params;

  const set = await getSet(setId);

  if (!set) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?message=Inicia sesión para ver tu colección"
    );
  }

  const cards = set.cards ?? [];
  const cardIds = cards.map((card) => card.id);

  let ownedCardIds = new Set<string>();
  let wishlistCardIds = new Set<string>();

  if (cardIds.length > 0) {
    const [
      { data: collectionRows, error: collectionError },
      { data: wishlistRows, error: wishlistError },
    ] = await Promise.all([
      supabase
        .from("collection")
        .select("card_id")
        .in("card_id", cardIds),

      supabase
        .from("wishlist")
        .select("card_id")
        .in("card_id", cardIds),
    ]);

    if (collectionError) {
      throw new Error(
        `Error obteniendo la colección: ${collectionError.message}`
      );
    }

    if (wishlistError) {
      throw new Error(
        `Error obteniendo la wishlist: ${wishlistError.message}`
      );
    }

    ownedCardIds = new Set(
      collectionRows?.map((row) => row.card_id) ?? []
    );

    wishlistCardIds = new Set(
      wishlistRows?.map((row) => row.card_id) ?? []
    );
  }

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <section className="mb-8">
          <Link
            href="/collection"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            <span>←</span>
            <span>Mi colección</span>
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-500">
                {set.name}
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Mis cartas
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                {ownedCardIds.size} de {set.cardCount.total} cartas
              </p>
            </div>
          </div>
        </section>

        {/* Cartas */}
        {ownedCardIds.size === 0 ? (
          <GlassPanel strong className="p-10 text-center sm:p-16">
            <div className="mx-auto max-w-md">
              <h2 className="text-xl font-semibold text-zinc-900">
                No tienes cartas de este set
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Regresa a tu colección para explorar otros sets.
              </p>

              <Link
                href="/collection"
                className="yellow-button mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                Volver a mi colección
              </Link>
            </div>
          </GlassPanel>
        ) : (
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cards
              .filter((card) => ownedCardIds.has(card.id))
              .map((card) => (
                <PokemonCard
                  key={card.id}
                  setId={set.id}
                  cardId={card.id}
                  number={String(card.localId)}
                  name={card.name}
                  image={card.image}
                  owned={true}
                  wishlist={wishlistCardIds.has(card.id)}
                />
              ))}
          </section>
        )}
      </div>
    </main>
  );
}