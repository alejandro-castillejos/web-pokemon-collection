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
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Encabezado */}
        <header className="border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold">Sets</h1>

          <p className="mt-2 text-zinc-400">
            Explora las expansiones de Pokémon TCG.
          </p>
        </header>

        {/* Lista de sets */}
        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sets.map((set) => (
            <article
              key={set.code}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:-translate-y-1 hover:border-zinc-700"
            >
              {/* Espacio para la imagen */}
              <div className="flex aspect-square items-center justify-center rounded-xl bg-zinc-800">
                <span className="text-sm text-zinc-500">
                  Logo del set
                </span>
              </div>

              {/* Información */}
              <div className="mt-5">
                <h2 className="font-semibold">{set.name}</h2>

                <p className="mt-2 text-sm text-zinc-400">
                  {set.cards} cartas
                </p>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Progreso</span>
                    <span>{set.progress}%</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${set.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}