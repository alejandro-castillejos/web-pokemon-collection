"use client";

import Link from "next/link";
import type { SetSort } from "@/lib/tcgdex";

interface SetSortProps {
  currentSort: SetSort;
  basePath?: string;
}

const options: { value: SetSort; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "name", label: "Nombre A-Z" },
  { value: "progress", label: "Mayor progreso" },
];

export default function SetSort({
  currentSort,
  basePath = "/sets",
}: SetSortProps) {
  return (
    <div className="glass inline-flex items-center gap-1 rounded-full p-1">
      <span className="px-3 text-xs font-medium text-zinc-500">
        Ordenar
      </span>

      {options.map((option) => (
        <Link
          key={option.value}
          href={`${basePath}?sort=${option.value}`}
          className={`rounded-full px-3 py-2 text-xs transition ${
            currentSort === option.value
              ? "bg-white/80 font-semibold text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:bg-white/50 hover:text-zinc-900"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}