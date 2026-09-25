import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import SetCard from "@/components/pokemon/SetCard";
import Navbar from "@/components/navigation/Navbar";

const sets = [
  {
    name: "Scarlet & Violet—151",
    code: "sv3pt5",
    cards: 207,
    progress: 0,
  },
  {
    name: "Destined Rivals",
    code: "sv10",
    cards: 244,
    progress: 0,
  },
  {
    name: "Prismatic Evolutions",
    code: "sv8pt5",
    cards: 180,
    progress: 0,
  },
  {
    name: "Surging Sparks",
    code: "sv8",
    cards: 252,
    progress: 0,
  },
];

export default function SetsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      {/* Iluminación ambiental */}
      <div className="soft-glow left-[-140px] top-[180px] h-72 w-72 bg-blue-300/25" />

      <div className="soft-glow right-[-120px] top-[300px] h-80 w-80 bg-yellow-200/30" />

      <div className="relative mx-auto min-h-screen max-w-[1400px] px-5 py-4 sm:px-8 lg:px-10">
        {/* Navegación */}
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

            {/* Filtros provisionales */}
            <GlassPanel className="flex w-fit items-center gap-2 rounded-full p-1.5">
              <button
                type="button"
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                Todos
              </button>

              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm text-zinc-500 transition hover:bg-white/70"
              >
                En progreso
              </button>

              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm text-zinc-500 transition hover:bg-white/70"
              >
                Completados
              </button>
            </GlassPanel>
          </div>
        </section>

        {/* Sets */}
        <section className="pb-16">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sets.map((set) => (
              <SetCard
                key={set.code}
                name={set.name}
                code={set.code}
                cards={set.cards}
                progress={set.progress}
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
                  Cuando conectemos la colección, este resumen se actualizará
                  automáticamente.
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