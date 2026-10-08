"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isSets = pathname.startsWith("/sets");
  const isCollection = pathname.startsWith("/collection");
  const isWishlist = pathname.startsWith("/wishlist");
  const isAccount = pathname.startsWith("/account");

  const searchScope = isSets
    ? pathname === "/sets"
      ? "sets"
      : "set-cards"
    : isCollection
      ? "collection"
      : isWishlist
        ? "wishlist"
        : "all";

  const searchSetId =
    isSets && pathname !== "/sets"
      ? pathname.split("/")[2] ?? ""
      : "";

  let searchPlaceholder = "Buscar cartas, sets...";

  if (isSets) {
    searchPlaceholder = pathname === "/sets" ? "Buscar sets..." : "Buscar cartas...";
  }

  if (isCollection) searchPlaceholder = "Buscar en mi colección...";
  if (isWishlist) searchPlaceholder = "Buscar en mi wishlist...";

  const activeClass = "bg-white/70 font-semibold text-zinc-900 shadow-sm";
  const inactiveClass = "text-zinc-600 hover:bg-white/50 hover:text-zinc-900";

  return (
    <header className="glass-strong sticky top-4 z-30 mx-4 mb-6 rounded-[28px] px-4 py-3 sm:mx-6 sm:px-5 lg:mx-8">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-[10px] font-bold tracking-tight text-white">
            TCG
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">Pokémon TCG</p>
            <p className="mt-1 text-[11px] text-zinc-500">Collection</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 md:hidden">
          <Link href="/" aria-label="Inicio" title="Inicio" className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isHome ? activeClass : inactiveClass}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" /></svg>
          </Link>
          <Link href="/sets" aria-label="Sets" title="Sets" className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isSets ? activeClass : inactiveClass}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><rect x="4" y="4" width="16" height="16" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8M8 12h8M8 16h5" /></svg>
          </Link>
          <Link href="/collection" aria-label="Colección" title="Colección" className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isCollection ? activeClass : inactiveClass}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><rect x="3" y="7" width="18" height="13" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 11h18" /></svg>
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" title="Wishlist" className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isWishlist ? activeClass : inactiveClass}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.3 4.3 0 0 1 12 6.6a4.3 4.3 0 0 1 8.8 2.2Z" /></svg>
          </Link>
        </nav>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" className={`rounded-full px-4 py-2 text-sm transition ${isHome ? activeClass : inactiveClass}`}>Inicio</Link>
          <Link href="/sets" className={`rounded-full px-4 py-2 text-sm transition ${isSets ? activeClass : inactiveClass}`}>Sets</Link>
          <Link href="/collection" className={`rounded-full px-4 py-2 text-sm transition ${isCollection ? activeClass : inactiveClass}`}>Colección</Link>
          <Link href="/wishlist" className={`rounded-full px-4 py-2 text-sm transition ${isWishlist ? activeClass : inactiveClass}`}>Wishlist</Link>
        </nav>

        <div className="flex items-center gap-2">
          <form
            action="/search"
            method="get"
            className="hidden items-center rounded-full border border-black/5 bg-white/65 px-4 py-2.5 lg:flex"
          >
            <span className="mr-2 text-sm text-zinc-400">⌕</span>
            <input
              type="search"
              name="q"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              autoComplete="off"
              className="w-44 bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
            <input type="hidden" name="scope" value={searchScope} />
            {searchSetId && (
              <input type="hidden" name="setId" value={searchSetId} />
            )}
          </form>

          <Link
            href="/account"
            aria-label="Cuenta"
            title="Cuenta"
            className={`glass-hover flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition ${
              isAccount ? activeClass : ""
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
                d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1-7.5 0 3.75 3.75 1 1 1 15.75 6.75ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
