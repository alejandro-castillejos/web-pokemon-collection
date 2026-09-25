import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import CardImage from "@/components/pokemon/CardImage";

interface PokemonCardProps {
  setId: string;
  cardId: string;
  number: string;
  name: string;
  rarity: string;
  image?: string;
  owned?: boolean;
  wishlist?: boolean;
}

export default function PokemonCard({
  setId,
  cardId,
  number,
  name,
  rarity,
  image,
  owned = false,
  wishlist = false,
}: PokemonCardProps) {
  return (
    <Link
      href={`/sets/${setId}/${cardId}`}
      className="group block"
    >
      <GlassPanel className="glass-hover overflow-hidden rounded-[24px] p-3">
        {/* Imagen de la carta */}
        <div className="relative overflow-hidden rounded-[18px] bg-zinc-100">
          <CardImage
            src={image}
            alt={`${name} #${number}`}
            name={name}
            number={number}
            quality="low"
            className="block w-full transition duration-300 group-hover:scale-[1.02]"
          />

          {/* Colección */}
          {owned && (
            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow-lg">
              ✓
            </span>
          )}

          {/* Wishlist */}
          {wishlist && (
            <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-sm font-bold text-white shadow-lg">
              ♥
            </span>
          )}
        </div>

        {/* Información */}
        <div className="px-1 pb-1 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-zinc-900">
                {name}
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                #{number}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-semibold text-zinc-500">
              {rarity}
            </span>
          </div>

          <div className="mt-4 flex h-9 items-center justify-center rounded-xl bg-black/[0.025] text-xs font-semibold text-zinc-500 transition group-hover:bg-black/5">
            Ver carta →
          </div>
        </div>
      </GlassPanel>
    </Link>
  );
}