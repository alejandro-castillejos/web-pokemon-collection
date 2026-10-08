"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type SearchScope =
  | "all"
  | "sets"
  | "set-cards"
  | "collection"
  | "wishlist";

interface SearchResult {
  type: "card" | "set";
  id: string;
  name: string;
  localId?: string;
  image?: string;
  setName?: string;
  logo?: string;
  href: string;
}

interface SearchBoxProps {
  scope: SearchScope;
  setId?: string;
  placeholder: string;
}

export default function SearchBox({
  scope,
  setId = "",
  placeholder,
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const router = useRouter();

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    inputRef.current?.focus();
  }, [mobileOpen]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();

    setLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: normalizedQuery,
          scope,
        });

        if (setId) {
          params.set("setId", setId);
        }

        const response = await fetch(
          `/api/search-preview?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Error en la búsqueda");
        }

        const data = (await response.json()) as SearchResult[];

        if (requestId !== requestIdRef.current) {
          return;
        }

        setResults(data.slice(0, 3));
        setOpen(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
          setOpen(false);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, scope, setId]);

  function closeSearch() {
    setQuery("");
    setResults([]);
    setOpen(false);
    setMobileOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    const params = new URLSearchParams({
      q: query.trim(),
      scope,
    });

    if (setId) {
      params.set("setId", setId);
    }

    setOpen(false);
    setMobileOpen(false);
    router.push(`/search?${params.toString()}`);
  }

  const input = (
    <input
      ref={inputRef}
      type="search"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      onFocus={() => {
        if (results.length > 0) {
          setOpen(true);
        }
      }}
      placeholder={placeholder}
      aria-label={placeholder}
      autoComplete="off"
      className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
    />
  );

  return (
    <>
      {/* Escritorio */}
      <div
        ref={containerRef}
        className="relative hidden lg:block"
      >
        <form
          onSubmit={handleSubmit}
          className="flex w-[230px] items-center rounded-full border border-black/5 bg-white/65 px-4 py-2.5 transition focus-within:bg-white/80"
        >
          <span className="mr-2 text-sm text-zinc-400">⌕</span>
          {input}
          {loading && (
            <span className="ml-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
          )}
        </form>

        {open && (
          <SearchDropdown
            results={results}
            onClose={closeSearch}
          />
        )}
      </div>

      {/* Móvil / tablet */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buscar"
          title="Buscar"
          className="glass-hover flex h-10 w-10 items-center justify-center rounded-full text-zinc-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path
              d="m16 16 4.5 4.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {mobileOpen && (
          <div
            ref={containerRef}
            className="absolute inset-2 z-50 flex items-center rounded-[22px] border border-black/5 bg-white/92 px-3 shadow-lg shadow-black/10 backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar búsqueda"
              className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  d="m6 6 12 12M18 6 6 18"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <form
              onSubmit={handleSubmit}
              className="flex min-w-0 flex-1 items-center"
            >
              <span className="mr-2 text-sm text-zinc-400">
                ⌕
              </span>
              {input}
              {loading && (
                <span className="ml-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
              )}
            </form>

            {open && (
              <SearchDropdown
                results={results}
                onClose={closeSearch}
                mobile
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}

function SearchDropdown({
  results,
  mobile = false,
  onClose,
}: {
  results: SearchResult[];
  mobile?: boolean;
  onClose: () => void;
}) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div
      className={`absolute left-0 z-[60] overflow-hidden rounded-[22px] border border-black/5 bg-white/95 p-1.5 shadow-xl shadow-black/10 backdrop-blur-xl ${
        mobile
          ? "right-0 top-[calc(100%+8px)]"
          : "right-0 top-[calc(100%+8px)]"
      }`}
    >
      {results.map((result) => (
        <Link
          key={`${result.type}-${result.id}`}
          href={result.href}
          onClick={onClose}
          className="flex items-center gap-3 rounded-[16px] px-2.5 py-2.5 transition hover:bg-black/5"
        >
          <div className="flex h-11 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-zinc-100">
            {result.type === "card" && result.image ? (
              <img
                src={`${result.image}/low.webp`}
                alt={result.name}
                className="h-full w-full object-cover"
              />
            ) : result.logo ? (
              <img
                src={`${result.logo}.webp`}
                alt={result.name}
                className="max-h-8 max-w-[70px] object-contain"
              />
            ) : (
              <span className="text-[10px] font-semibold text-zinc-400">
                TCG
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {result.name}
            </p>

            {result.type === "card" ? (
              <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                {result.setName} · #{result.localId}
              </p>
            ) : (
              <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                {result.id}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
