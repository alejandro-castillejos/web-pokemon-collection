import Link from "next/link";
import { redirect } from "next/navigation";

import GlassPanel from "@/components/ui/GlassPanel";
import PokemonCard from "@/components/pokemon/PokemonCard";
import { createClient } from "@/lib/supabase/server";
import { getCard } from "@/lib/tcgdex";

export default async function CollectionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Inicia sesión para ver tu colección");
  }

  const [{ data: collectionRows, error: collectionError }, { data: wishlistRows, error: wishlistError }] =
    await Promise.all([
      supabase
        .from("collection")
        .select("card_id")
        .order("created_at", { ascending: false }),

      supabase
        .from("wishlist")
        .select("card_id"),
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

  const cardIds = collectionRows.map((row) => row.card_id);
  const wishlistCardIds = new Set(
    wishlistRows.map((row) => row.card_id)
  );

  const cardResults = await Promise.all(
    cardIds.map(async (cardId) => {
      try {
        return await getCard(cardId);
      } catch {
        return null;
      }
    })
  );

  const cards = cardResults.filter(
    (card): card is NonNullable<typeof card> => card !== null
  );

  return (
    <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <section className="mb-8">
          <p className="mb-2 text-sm font-medium text-zinc-500">
            Mi colección
          </p>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Tus cartas
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                {cards.length === 1
                  ? "1 carta guardada"
                  : `${cards.length} cartas guardadas`}
              </p>
            </div>

            <Link
              href="/sets"
              className="yellow-button inline-flex w-fit items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Explorar sets
            </Link>
          </div>
        </section>

        {/* Colección vacía */}
        {cards.length === 0 ? (
          <GlassPanel strong className="p-10 text-center sm:p-16">
            <div className="mx-auto max-w-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-2xl shadow-sm">
                +
              </div>

              <h2 className="mt-5 text-xl font-semibold text-zinc-900">
                Tu colección está vacía
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Explora tus sets y agrega las cartas que ya tienes
                para comenzar tu colección.
              </p>

              <Link
                href="/sets"
                className="yellow-button mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                Ver sets
              </Link>
            </div>
          </GlassPanel>
        ) : (
          /* Grid */
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cards.map((card) => (
              <PokemonCard
                key={card.id}
                setId={card.set.id}
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