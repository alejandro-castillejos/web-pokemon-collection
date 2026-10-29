"use client";

import { useRouter } from "next/navigation";

export type SearchSortValue =
  | "relevance"
  | "name"
  | "name-desc"
  | "set"
  | "number"
  | "number-desc";

const options: { value: SearchSortValue; label: string }[] = [
  { value: "relevance", label: "Más relevantes" },
  { value: "name", label: "Nombre A-Z" },
  { value: "name-desc", label: "Nombre Z-A" },
  { value: "set", label: "Set A-Z" },
  { value: "number", label: "Número menor → mayor" },
  { value: "number-desc", label: "Número mayor → menor" },
];

export default function SearchSort({
  currentSort,
}: {
  currentSort: SearchSortValue;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-xs text-zinc-500">
      <span className="hidden sm:inline">Ordenar:</span>
      <select
        aria-label="Ordenar cartas encontradas"
        value={currentSort}
        onChange={(event) => {
          const params = new URLSearchParams(window.location.search);
          params.set("sort", event.target.value);
          params.delete("page");
          router.push(`/search?${params.toString()}`);
        }}
        className="max-w-[calc(100vw-2rem)] rounded-full border border-black/5 bg-white/75 px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-black/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
