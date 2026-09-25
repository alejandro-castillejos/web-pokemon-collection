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

        {/* Navegación móvil */}
        <nav className="flex items-center gap-1 md:hidden">
          <Link
            href="/"
            aria-label="Inicio"
            title="Inicio"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isHome
                ? "bg-white/70 text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:bg-white/50 hover:text-zinc-900"
              }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"
              />
            </svg>
          </Link>

          <Link
            href="/sets"
            aria-label="Sets"
            title="Sets"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isSets
                ? "bg-white/70 text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:bg-white/50 hover:text-zinc-900"
              }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 8h8M8 12h8M8 16h5"
              />
            </svg>
          </Link>

          <Link
            href="/collection"
            aria-label="Colección"
            title="Colección"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isCollection
                ? "bg-white/70 text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:bg-white/50 hover:text-zinc-900"
              }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <rect
                x="3"
                y="7"
                width="18"
                height="13"
                rx="2"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 11h18"
              />
            </svg>
          </Link>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            title="Wishlist"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isWishlist
                ? "bg-white/70 text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:bg-white/50 hover:text-zinc-900"
              }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.3 4.3 0 0 1 12 6.6a4.3 4.3 0 0 1 8.8 2.2Z"
              />
            </svg>
          </Link>
        </nav>

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
            aria-label="Perfil"
            className="glass-hover flex h-10 w-10 items-center justify-center rounded-full text-zinc-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}