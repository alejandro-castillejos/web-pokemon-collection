import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import CardImage from "@/components/pokemon/CardImage";
import CardActionButtons from "@/components/pokemon/CardActionButtons";

interface PokemonCardProps {
  setId: string;
  cardId: string;
  number: string;
  name: string;
  image?: string;
  owned?: boolean;
  wishlist?: boolean;
  basePath?: "/sets" | "/collection" | "/wishlist";
}

export default function PokemonCard({
  setId,
  cardId,
  number,
  name,
  image,
  owned = false,
  wishlist = false,
  basePath = "/sets",
}: PokemonCardProps) {
  return (
    <GlassPanel className="group overflow-hidden rounded-[24px] p-3 transition duration-200 hover:-translate-y-1">
      <Link href={`${basePath}/${setId}/${cardId}`} className="block">
        <div className="relative overflow-hidden rounded-[18px] bg-zinc-100">
          <CardImage
            src={image}
            alt={`${name} #${number}`}
            name={name}
            number={number}
            quality="low"
            className="block w-full transition duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="px-1 pb-1 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-zinc-900">{name}</p>
              <p className="mt-1 text-xs text-zinc-400">#{number}</p>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex justify-end px-1 pb-1 pt-2">
        <CardActionButtons
          cardId={cardId}
          setId={setId}
          initialOwned={owned}
          initialWishlist={wishlist}
        />
      </div>
    </GlassPanel>
  );
}
