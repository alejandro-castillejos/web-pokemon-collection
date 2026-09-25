import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";

interface SetCardProps {
  name: string;
  code: string;
  cards: number;
  progress: number;
}

export default function SetCard({
  name,
  code,
  cards,
  progress,
}: SetCardProps) {
  return (
    <Link href={`/sets/${code}`} className="group block">
      <GlassPanel
        className="glass-hover overflow-hidden rounded-[28px] p-3"
      >
        {/* Imagen / logo del set */}
        <div className="flex aspect-[4/3] items-center justify-center rounded-[22px] bg-gradient-to-br from-white via-zinc-100 to-zinc-200">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Pokémon TCG
            </p>

            <p className="mt-2 px-5 text-lg font-bold leading-tight text-zinc-800">
              {name}
            </p>
          </div>
        </div>

        {/* Información */}
        <div className="px-2 pb-2 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                {name}
              </h2>

              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-zinc-400">
                {code}
              </p>
            </div>

            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-zinc-500">
              {cards} cartas
            </span>
          </div>

          {/* Progreso */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Progreso</span>

              <span className="font-semibold text-zinc-800">
                {progress}%
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/6">
              <div
                className="h-full rounded-full bg-[#f2c72e] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Acción */}
          <div className="mt-5 flex items-center justify-between text-sm font-semibold text-zinc-700">
            <span>Ver cartas</span>

            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </GlassPanel>
    </Link>
  );
}