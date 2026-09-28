export default function Loading() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f5f7] px-5 py-4 text-[#111111] sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col">
        {/* Contenido principal */}
        <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.45fr_0.7fr] lg:py-20">
          {/* Hero skeleton */}
          <div>
            <div className="mb-6 h-3 w-44 animate-pulse rounded-full bg-black/8" />

            <div className="h-16 max-w-3xl animate-pulse rounded-2xl bg-black/8 sm:h-24" />

            <div className="mt-3 h-16 max-w-2xl animate-pulse rounded-2xl bg-black/6 sm:h-24" />

            <div className="mt-8 max-w-2xl space-y-3">
              <div className="h-4 w-full animate-pulse rounded-full bg-black/6" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-black/6" />
            </div>

            {/* Botones */}
            <div className="mt-9 flex flex-wrap gap-3">
              <div className="h-12 w-40 animate-pulse rounded-full bg-black/8" />
              <div className="h-12 w-40 animate-pulse rounded-full bg-black/6" />
            </div>

            {/* Estadísticas */}
            <div className="glass mt-8 flex max-w-2xl animate-pulse overflow-hidden rounded-[24px]">
              <div className="flex flex-1 items-center gap-3 border-r border-black/5 px-5 py-4">
                <div className="h-10 w-10 rounded-2xl bg-black/6" />

                <div className="space-y-2">
                  <div className="h-6 w-12 rounded-full bg-black/8" />
                  <div className="h-3 w-10 rounded-full bg-black/5" />
                </div>
              </div>

              <div className="flex flex-1 items-center gap-3 border-r border-black/5 px-5 py-4">
                <div className="h-10 w-10 rounded-2xl bg-black/6" />

                <div className="space-y-2">
                  <div className="h-6 w-16 rounded-full bg-black/8" />
                  <div className="h-3 w-14 rounded-full bg-black/5" />
                </div>
              </div>

              <div className="flex flex-1 items-center gap-3 px-5 py-4">
                <div className="h-10 w-10 rounded-2xl bg-black/6" />

                <div className="space-y-2">
                  <div className="h-6 w-14 rounded-full bg-black/8" />
                  <div className="h-3 w-16 rounded-full bg-black/5" />
                </div>
              </div>
            </div>
          </div>

          {/* Últimos añadidos skeleton */}
          <aside className="glass-strong animate-pulse rounded-[32px] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded-full bg-black/6" />
                <div className="h-6 w-36 rounded-full bg-black/8" />
              </div>

              <div className="h-10 w-10 rounded-full bg-black/8" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-black/[0.025] p-3"
                >
                  <div className="h-14 w-11 shrink-0 rounded-xl bg-black/7" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded-full bg-black/8" />
                    <div className="h-3 w-32 rounded-full bg-black/5" />
                  </div>

                  <div className="h-6 w-12 rounded-full bg-black/6" />
                </div>
              ))}
            </div>

            <div className="mt-5 h-10 w-full rounded-2xl bg-black/5" />
          </aside>
        </section>

        {/* Footer skeleton */}
        <footer className="flex items-center justify-between border-t border-black/5 py-5">
          <div className="h-3 w-32 animate-pulse rounded-full bg-black/5" />
          <div className="h-3 w-16 animate-pulse rounded-full bg-black/5" />
        </footer>
      </div>
    </main>
  );
}