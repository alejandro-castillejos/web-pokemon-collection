"use client";

import Link from "next/link";

interface LoginRequiredModalProps {
  open: boolean;
  action: "collection" | "wishlist";
  onClose: () => void;
}

export default function LoginRequiredModal({
  open,
  action,
  onClose,
}: LoginRequiredModalProps) {
  if (!open) {
    return null;
  }

  const message =
    action === "collection"
      ? "Inicia sesión para agregar esta carta a tu colección."
      : "Inicia sesión para agregar esta carta a tu wishlist.";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-required-title"
      onMouseDown={onClose}
    >
      <div
        className="glass-strong w-full max-w-sm rounded-[30px] p-6 shadow-2xl shadow-black/15"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Acceso requerido
            </p>

            <h2
              id="login-required-title"
              className="mt-2 text-xl font-bold tracking-tight text-zinc-900"
            >
              Inicia sesión
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-black/5 hover:text-zinc-900"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="m6 6 12 12M18 6 6 18"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/login"
            onClick={onClose}
            className="yellow-button flex items-center justify-center rounded-full px-5 py-3.5 text-sm font-bold text-[#111111]"
          >
            Iniciar sesión
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="glass-hover glass flex items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold text-zinc-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
