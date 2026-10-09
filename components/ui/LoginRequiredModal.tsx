"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface LoginRequiredModalProps {
  open: boolean;
  action: "collection" | "wishlist";
  onClose: () => void;
  errorMessage?: string | null;
}

export default function LoginRequiredModal({
  open,
  action,
  onClose,
  errorMessage,
}: LoginRequiredModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, mounted, onClose]);

  if (!open || !mounted) {
    return null;
  }

  const requiresLogin = !errorMessage;

  const message =
    errorMessage ??
    (action === "collection"
      ? "Inicia sesión para agregar esta carta a tu colección."
      : "Inicia sesión para agregar esta carta a tu wishlist.");

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/25 px-5 py-6 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-modal-title"
      onMouseDown={onClose}
    >
      <div
        className="glass-strong w-full max-w-sm rounded-[30px] p-6 shadow-2xl shadow-black/15 animate-[modalIn_180ms_ease-out]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              {requiresLogin ? "Acceso requerido" : "Aviso"}
            </p>

            <h2
              id="action-modal-title"
              className="mt-2 text-xl font-bold tracking-tight text-zinc-900"
            >
              {requiresLogin ? "Inicia sesión" : "No se pudo completar la acción"}
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
          {requiresLogin ? (
            <Link
              href={action === "collection" ? "/login?reason=add-collection" : "/login?reason=add-wishlist"}
              onClick={onClose}
              className="yellow-button flex items-center justify-center rounded-full px-5 py-3.5 text-sm font-bold text-[#111111]"
            >
              Iniciar sesión
            </Link>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className={`glass-hover glass flex items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold text-zinc-800 ${requiresLogin ? "" : "sm:col-span-2"}`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
