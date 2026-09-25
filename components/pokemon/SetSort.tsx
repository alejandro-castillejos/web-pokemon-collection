import Link from "next/link";
import type { SetSort } from "@/lib/tcgdex";

interface SetSortProps {
  currentSort: SetSort;
}

const options: {
  value: SetSort;
  label: string;
}[] = [
  {
    value: "recent",
    label: "Más recientes",
  },
  {
    value: "oldest",
    label: "Más antiguos",
  },
  {
    value: "name",
    label: "Nombre A-Z",
  },
];

export default function SetSort({
  currentSort,
}: SetSortProps) {
  return (
    <GlassSortContainer currentSort={currentSort}>
      {options.map((option) => (
        <Link
          key={option.value}
          href={`/sets?sort=${option.value}`}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            currentSort === option.value
              ? "bg-[#f2c72e] text-[#111111] shadow-sm"
              : "text-zinc-500 hover:bg-white/70 hover:text-zinc-900"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </GlassSortContainer>
  );
}

function GlassSortContainer({
  children,
  currentSort,
}: {
  children: React.ReactNode;
  currentSort: SetSort;
}) {
  return (
    <div className="glass flex w-fit items-center gap-1 rounded-full p-1.5">
      <span className="px-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
        Ordenar
      </span>

      {children}
    </div>
  );
}