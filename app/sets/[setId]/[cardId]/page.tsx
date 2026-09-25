import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import GlassPanel from "@/components/ui/GlassPanel";
import GlassButton from "@/components/ui/GlassButton";
import { getSet, getCard } from "@/lib/tcgdex";
import CardImage from "@/components/pokemon/CardImage";

interface CardPageProps {
  params: Promise<{
    setId: string;
    cardId: string;
  }>;
}

export default async function CardPage({ params }: CardPageProps) {
  const { setId, cardId } = await params;

  const set = await getSet(setId);
  const card = await getCard(cardId);

  if (!set || !card) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-6">
        <GlassPanel className="max-w-md rounded-[28px] p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Error
          </p>

          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            Carta no encontrada
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            La carta que intentaste abrir no existe.
          </p>

          <Link
            href={`/sets/${setId}`}
            className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Volver al set
          </Link>
        </GlassPanel>
      </main>
    );
  }

  // Estado temporal.
  // Más adelante estos valores vendrán de Supabase.
  const owned = false;
  const wishlist = false;

  // Imagen real de TCGdex.
  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      {/* Iluminación ambiental */}
      <div className="soft-glow left-[-140px] top-[160px] h-72 w-72 bg-blue-300/20" />

      <div className="soft-glow right-[-120px] top-[300px] h-80 w-80 bg-yellow-200/30" />

      <div className="relative mx-auto min-h-screen max-w-[1400px] px-5 py-4 sm:px-8 lg:px-10">
        <Navbar />

        <section className="py-10 sm:py-14">
          {/* Navegación */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <Link
              href="/sets"
              className="transition hover:text-zinc-900"
            >
              Sets
            </Link>

            <span>/</span>

            <Link
              href={`/sets/${setId}`}
              className="transition hover:text-zinc-900"
            >
              {set.name}
            </Link>

            <span>/</span>

            <span className="text-zinc-400">
              #{card.localId}
            </span>
          </div>

          {/* Contenido */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            {/* Imagen */}
            <GlassPanel
              strong
              className="mx-auto w-full max-w-xl rounded-[36px] p-4 sm:p-6"
            >
              <div className="overflow-hidden rounded-[28px] bg-zinc-100 shadow-inner">
                <CardImage
                  src={card.image}
                  alt={`${card.name} #${card.localId}`}
                  name={card.name}
                  number={String(card.localId)}
                  quality="high"
                  className="block w-full"
                />
              </div>
            </GlassPanel>

            {/* Información */}
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                {set.name}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-zinc-600">
                  #{card.localId}
                </span>

                <span className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-zinc-600">
                  {card.rarity ?? "Sin rareza"}
                </span>

                <span className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-zinc-600">
                  {card.category}
                </span>
              </div>

              <h1 className="mt-6 text-5xl font-bold tracking-[-0.04em] text-zinc-900 sm:text-7xl">
                {card.name}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-500 sm:text-lg">
                Información de la carta proporcionada por TCGdex.
              </p>

              {/* Estado */}
              <GlassPanel className="mt-8 rounded-[28px] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Estado
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div
                    className={`rounded-2xl p-4 ${
                      owned
                        ? "bg-emerald-100"
                        : "bg-black/[0.025]"
                    }`}
                  >
                    <p className="text-xs text-zinc-500">
                      Colección
                    </p>

                    <p className="mt-1 text-sm font-bold text-zinc-900">
                      {owned
                        ? "✓ Ya la tienes"
                        : "No está en colección"}
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl p-4 ${
                      wishlist
                        ? "bg-pink-100"
                        : "bg-black/[0.025]"
                    }`}
                  >
                    <p className="text-xs text-zinc-500">
                      Wishlist
                    </p>

                    <p className="mt-1 text-sm font-bold text-zinc-900">
                      {wishlist
                        ? "♥ En tu wishlist"
                        : "No está en wishlist"}
                    </p>
                  </div>
                </div>
              </GlassPanel>

              {/* Acciones */}
              <div className="mt-6 flex flex-wrap gap-3">
                <GlassButton variant="primary">
                  {owned
                    ? "✓ En mi colección"
                    : "+ Agregar a colección"}
                </GlassButton>

                <GlassButton>
                  {wishlist
                    ? "♥ En mi wishlist"
                    : "♡ Agregar a wishlist"}
                </GlassButton>
              </div>
            </div>
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