export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f4f5f7] px-5 py-4 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="glass h-16 rounded-[28px] animate-pulse" />

        <section className="py-12 sm:py-16">
          <div className="h-4 w-24 rounded-full bg-black/5 animate-pulse" />

          <div className="mt-4 h-14 w-48 rounded-2xl bg-black/5 animate-pulse" />

          <div className="mt-4 h-5 w-96 max-w-full rounded-full bg-black/5 animate-pulse" />
        </section>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="glass overflow-hidden rounded-[28px] p-3"
            >
              <div className="aspect-[4/3] rounded-[22px] bg-black/5 animate-pulse" />

              <div className="mt-5 h-5 w-3/4 rounded-full bg-black/5 animate-pulse" />

              <div className="mt-3 h-4 w-1/2 rounded-full bg-black/5 animate-pulse" />

              <div className="mt-5 h-2 w-full rounded-full bg-black/5 animate-pulse" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}