import Link from "next/link";

import GlassPanel from "@/components/ui/GlassPanel";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-12 sm:px-6">
      <GlassPanel
        strong
        className="w-full max-w-lg rounded-[32px] p-8 text-center sm:p-10"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
          Error 404
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
          No encontramos esa página
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Puede que el enlace sea incorrecto o que el contenido ya no esté disponible.
        </p>

        <div className="mt-7 flex justify-center">
          <Link
            href="/"
            className="yellow-button inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold text-[#111111]"
          >
            Volver al inicio
          </Link>
        </div>
      </GlassPanel>
    </main>
  );
}
