import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import SetCard from "@/components/pokemon/SetCard";
import SetSort from "@/components/pokemon/SetSort";
import Navbar from "@/components/navigation/Navbar";
import {
  getAllSets,
  type SetSort as SetSortType,
} from "@/lib/tcgdex";

interface SetsPageProps {
  searchParams: Promise<{
    sort?: string;
  }>;
}

function getValidSort(value?: string): SetSortType {
  if (value === "oldest") {
    return "oldest";
  }

  if (value === "name") {
    return "name";
  }

  return "recent";
}

export default async function SetsPage({
  searchParams,
}: SetsPageProps) {
  const { sort } = await searchParams;

  const currentSort = getValidSort(sort);

  const tcgSets = await getAllSets(currentSort);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      {/* Iluminación ambiental */}
      <div className="soft-glow left-[-140px] top-[180px] h-72 w-72 bg-blue-300/25" />

      <div className="soft-glow right-[-120px] top-[300px] h-80 w-80 bg-yellow-200/30" />

      <div className="relative mx-auto min-h-screen max-w-[1400px] px-5 py-4 sm:px-8 lg:px-10">
        <Navbar />

        {/* Encabezado */}
        <section className="py-12 sm:py-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Pokémon TCG
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-zinc-900 sm:text-6xl">
                Sets
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
                Explora las expansiones y revisa el progreso de tu colección.
              </p>
            </div>

            <SetSort currentSort={currentSort} />
          </div>
        </section>

        {/* Sets reales */}
        <section className="pb-16">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {tcgSets.length} sets encontrados
            </p>

            <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">
              {currentSort === "recent"
                ? "Más recientes"
                : currentSort === "oldest"
                  ? "Más antiguos"
                  : "Nombre A-Z"}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tcgSets.map((set) => (
              <SetCard
                key={set.id}
                name={set.name}
                code={set.id}
                cards={set.cardCount.total}
                progress={0}
                logo={set.logo}
              />
            ))}
          </div>
        </section>

        {/* Información */}
        <section className="pb-10">
          <GlassPanel className="rounded-[28px] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Tu colección
                </p>

                <h2 className="mt-1 text-xl font-bold text-zinc-900">
                  0 sets completados
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  El progreso se conectará a tu colección en una siguiente
                  etapa.
                </p>
              </div>

              <Link
                href="/"
                className="w-fit rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Volver al inicio
              </Link>
            </div>
          </GlassPanel>
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