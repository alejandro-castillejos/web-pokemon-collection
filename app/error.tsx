"use client";

import { useEffect } from "react";
import Link from "next/link";

import GlassPanel from "@/components/ui/GlassPanel";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-12 sm:px-6">
      <GlassPanel
        strong
        className="w-full max-w-lg rounded-[32px] p-8 text-center sm:p-10"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-2xl text-zinc-600 shadow-sm">
          !
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
          Algo salió mal
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          No pudimos cargar esta página
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Ocurrió un error inesperado. Puedes volver a intentarlo o regresar al inicio.
        </p>

        {error.digest && (
          <p className="mt-3 text-xs text-zinc-400">
            Referencia: {error.digest}
          </p>
        )}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => reset()}
            className="yellow-button rounded-full px-5 py-3.5 text-sm font-bold text-[#111111]"
          >
            Reintentar
          </button>

          <Link
            href="/"
            className="glass-hover glass flex items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold text-zinc-800"
          >
            Volver al inicio
          </Link>
        </div>
      </GlassPanel>
    </main>
  );
}
