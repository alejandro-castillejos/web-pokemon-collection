"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isSets = pathname.startsWith("/sets");
  const isCollection = pathname.startsWith("/collection");
  const isWishlist = pathname.startsWith("/wishlist");

  let searchPlaceholder = "Buscar cartas, sets...";

  if (isSets) {
    searchPlaceholder = pathname === "/sets"
      ? "Buscar sets..."
      : "Buscar cartas...";
  }

  if (isCollection) {
    searchPlaceholder = "Buscar en mi colección...";
  }

  if (isWishlist) {
    searchPlaceholder = "Buscar en mi wishlist...";
  }

  return (
    <header className="glass sticky top-4 z-30 rounded-[28px] px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-4">
        {/* Marca */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-[10px] font-bold tracking-tight text-white">
            TCG
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">
              Pokémon TCG
            </p>

            <p className="mt-1 text-[11px] text-zinc-500">
              Collection
            </p>
          </div>
        </Link>

        {/* Navegación */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={`rounded-full px-4 py-2 text-sm transition ${
              isHome
                ? "bg-white/70 font-semibold text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:bg-white/50 hover:text-zinc-900"
            }`}
          >
            Inicio
          </Link>

          <Link
            href="/sets"
            className={`rounded-full px-4 py-2 text-sm transition ${
              isSets
                ? "bg-white/70 font-semibold text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:bg-white/50 hover:text-zinc-900"
            }`}
          >
            Sets
          </Link>

          <Link
            href="/collection"
            className={`rounded-full px-4 py-2 text-sm transition ${
              isCollection
                ? "bg-white/70 font-semibold text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:bg-white/50 hover:text-zinc-900"
            }`}
          >
            Colección
          </Link>

          <Link
            href="/wishlist"
            className={`rounded-full px-4 py-2 text-sm transition ${
              isWishlist
                ? "bg-white/70 font-semibold text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:bg-white/50 hover:text-zinc-900"
            }`}
          >
            Wishlist
          </Link>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-full border border-black/5 bg-white/55 px-4 py-2.5 lg:flex">
            <span className="mr-2 text-sm text-zinc-400">
              ⌕
            </span>

            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-44 bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
          </div>

          <button
            type="button"
            aria-label="Wishlist"
            className="glass-hover flex h-10 w-10 items-center justify-center rounded-full text-zinc-600"
          >
            ♡
          </button>

          <button
            type="button"
            aria-label="Perfil"
            className="glass-hover flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-zinc-700"
          >
            A
          </button>
        </div>
      </div>
    </header>
  );
}