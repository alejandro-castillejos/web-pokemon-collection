"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CardSort =
  | "set"
  | "name"
  | "name-desc"
  | "number"
  | "number-desc"
  | "recent";

interface CardSortProps {
  currentSort: CardSort;
}

const options: { value: CardSort; label: string }[] = [
  { value: "set", label: "Predeterminado" },
  { value: "name", label: "Nombre A-Z" },
  { value: "name-desc", label: "Nombre Z-A" },
  { value: "number", label: "Número menor → mayor" },
  { value: "number-desc", label: "Número mayor → menor" },
  { value: "recent", label: "Agregado recientemente" },
];

export default function CardSort({
  currentSort,
}: CardSortProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    options.find((option) => option.value === currentSort)?.label ??
    "Predeterminado";

  function handleChange(value: CardSort) {
    const params = new URLSearchParams(window.location.search);

    params.set("view", "cards");
    params.set("cardSort", value);

    setOpen(false);
    router.push(`/collection?${params.toString()}`);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="glass-hover glass flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-medium text-zinc-700 transition"
      >
        <span>{selectedLabel}</span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m6 9 6 6 6-6"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-[200px] overflow-hidden rounded-[20px] border border-black/5 bg-white/95 p-1.5 shadow-xl shadow-black/10 backdrop-blur-xl"
        >
          {options.map((option) => {
            const active = currentSort === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleChange(option.value)}
                className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left text-xs transition ${
                  active
                    ? "bg-white/75 font-semibold text-zinc-900 shadow-sm"
                    : "text-zinc-600 hover:bg-white/50 hover:text-zinc-900"
                }`}
              >
                <span>{option.label}</span>

                {active && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3.5 w-3.5 text-zinc-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5 12 4 4L19 6"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}