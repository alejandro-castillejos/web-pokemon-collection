import GlassButton from "@/components/ui/GlassButton";
import GlassPanel from "@/components/ui/GlassPanel";

const stats = [
  {
    label: "Sets",
    value: "12",
  },
  {
    label: "Cartas",
    value: "348",
  },
  {
    label: "Completado",
    value: "38%",
  },
];

const recentCards = [
  {
    name: "Pikachu ex",
    set: "Surging Sparks",
    status: "Nueva",
  },
  {
    name: "Charizard ex",
    set: "Scarlet & Violet—151",
    status: "Nueva",
  },
  {
    name: "Umbreon ex",
    set: "Prismatic Evolutions",
    status: "Nueva",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      {/* Iluminación ambiental */}
      <div className="soft-glow left-[-120px] top-[120px] h-72 w-72 bg-blue-300/30" />
      <div className="soft-glow right-[-100px] top-[220px] h-80 w-80 bg-yellow-200/35" />
      <div className="soft-glow bottom-[80px] left-[40%] h-72 w-72 bg-emerald-200/20" />

      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col px-5 py-4 sm:px-8 lg:px-10">
        
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

            <div className="mt-9 flex flex-wrap gap-3">
              <GlassButton variant="primary" href="/sets">
                <span className="mr-2 text-base">◉</span>
                Explorar sets
                <span className="ml-2 text-base">→</span>
              </GlassButton>

              <GlassButton>
                <span className="mr-2 text-base">▣</span>
                Mi colección
              </GlassButton>
            </div>

            {/* ESTADÍSTICAS */}
            <GlassPanel className="mt-8 flex max-w-2xl overflow-hidden rounded-[24px]">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`flex flex-1 items-center gap-3 px-5 py-4 ${
                    index !== stats.length - 1
                      ? "border-r border-black/5"
                      : ""
                  }`}
                >
                  <div className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-lg sm:flex">
                    {index === 0 ? "≋" : index === 1 ? "▤" : "◌"}
                  </div>

                  <div>
                    <p className="text-lg font-bold leading-none sm:text-2xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </GlassPanel>
          </div>

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

            <div className="space-y-3">
              {recentCards.map((card) => (
                <div
                  key={card.name}
                  className="glass-hover flex items-center gap-3 rounded-2xl border border-black/5 bg-white/45 p-3"
                >
                  <div className="h-14 w-11 shrink-0 rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-100 shadow-inner" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#111111]">
                      {card.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {card.set}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    {card.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-5 flex w-full items-center justify-center rounded-2xl py-3 text-sm font-semibold text-zinc-800 transition hover:bg-black/5"
            >
              Ver colección
              <span className="ml-2">→</span>
            </button>
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