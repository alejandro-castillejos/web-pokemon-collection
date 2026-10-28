import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import PokemonCard from "@/components/pokemon/PokemonCard";
import { getSet } from "@/lib/tcgdex";
import { getChasePrices } from "@/lib/chase-cards";

interface ChasePageProps {
  params: Promise<{ setId: string }>;
}

export default async function ChasePage({ params }: ChasePageProps) {
  const { setId } = await params;
  const set = await getSet(setId);

  if (!set) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <GlassPanel className="max-w-md rounded-[28px] p-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Set no encontrado</h1>
          <Link href="/sets" className="mt-6 inline-flex rounded-full bg-white/80 px-5 py-3 text-sm font-semibold text-zinc-700">
            Volver a sets
          </Link>
        </GlassPanel>
      </main>
    );
  }

  const source = await getChasePrices(
    set.name,
    (set.cards ?? []).map((card) => String(card.localId)),
    set.id
  );
  const priceByNumber = new Map(
    source.cards.map((card) => [card.cardNumber, card])
  );
  const chaseCards = (set.cards ?? [])
    .map((card) => {
      const normalizedNumber = String(card.localId).replace(/^0+/, "");
      const price = priceByNumber.get(normalizedNumber);
      return price ? { card, price } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.price.rank - b.price.rank);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      <div className="soft-glow left-[-140px] top-[180px] h-72 w-72 bg-blue-300/20" />
      <div className="soft-glow right-[-120px] top-[300px] h-80 w-80 bg-yellow-200/30" />

      <div className="relative mx-auto min-h-screen max-w-[1400px] px-5 py-4 sm:px-8 lg:px-10">
        <section className="pb-8 pt-0 sm:pb-10">
          <Link
            href={`/sets/${set.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Volver a {set.name}
          </Link>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            {set.id}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-zinc-900 sm:text-6xl">
            Chase cards
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
            Las cartas más valiosas de {set.name}, ordenadas por precio de mercado.
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            Precios de referencia en USD, en condición Near Mint. Pueden cambiar con el mercado.
          </p>
        </section>

        {chaseCards.length > 0 ? (
          <section className="grid grid-cols-2 gap-4 pb-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {chaseCards.map(({ card, price }, index) => (
              <PokemonCard
                key={card.id}
                setId={set.id}
                cardId={card.id}
                number={String(card.localId)}
                name={card.name}
                image={card.image}
                priority={index < 4}
                marketPrice={`#${price.rank} · €${price.priceEur.toFixed(2)} EUR`}
                setName={set.name}
              />
            ))}
          </section>
        ) : (
          <GlassPanel strong className="p-8 text-center sm:p-12">
            <h2 className="text-xl font-semibold text-zinc-900">
              No se encontraron Chase Cards para esta expansión
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              La fuente externa puede no tener una lista para este set o haber cambiado su estructura. No mostraremos datos inventados.
            </p>
            <Link
              href={source.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-full bg-white/80 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-white"
            >
              Consultar fuente
            </Link>
          </GlassPanel>
        )}

        <footer className="border-t border-black/5 py-5 text-xs text-zinc-400">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Pokémon TCG Collection</span>
            <Link href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-zinc-600">
              Fuente de precios: TCG Vault
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
