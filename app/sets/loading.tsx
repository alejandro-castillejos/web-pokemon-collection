export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f4f5f7] px-5 py-4 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <section className="py-12 sm:py-16">
          <div className="h-4 w-24 animate-pulse rounded-full bg-black/5" />

          <div className="mt-4 h-14 w-48 animate-pulse rounded-2xl bg-black/5" />

          <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-full bg-black/5" />
        </section>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="glass overflow-hidden rounded-[28px] p-3"
            >
              <div className="aspect-[4/3] animate-pulse rounded-[22px] bg-black/5" />

              <div className="mt-5 h-5 w-3/4 animate-pulse rounded-full bg-black/5" />

              <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-black/5" />

              <div className="mt-5 h-2 w-full animate-pulse rounded-full bg-black/5" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}