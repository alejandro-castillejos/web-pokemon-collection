"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleCollection,
  toggleWishlist,
} from "@/app/sets/[setId]/[cardId]/actions";

interface CardActionButtonsProps {
  cardId: string;
  setId: string;
  initialOwned: boolean;
  initialWishlist: boolean;
}

export default function CardActionButtons({
  cardId,
  setId,
  initialOwned,
  initialWishlist,
}: CardActionButtonsProps) {
  const [owned, setOwned] = useState(initialOwned);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  function handleCollection() {
    startTransition(async () => {
      const result = await toggleCollection(cardId, setId);

      if (!result.success) {
        alert(result.error);
        return;
      }

      setOwned(result.owned);
      router.refresh();
    });
  }

  function handleWishlist() {
    startTransition(async () => {
      const result = await toggleWishlist(cardId, setId);

      if (!result.success) {
        alert(result.error);
        return;
      }

      setWishlist(result.wishlist);
      router.refresh();
    });
  }

  return (
    <div className="flex w-full items-center gap-2">
      {/* Colección */}
      <button
        type="button"
        onClick={handleCollection}
        disabled={isPending}
        aria-label={
          owned
            ? "Quitar de mi colección"
            : "Agregar a mi colección"
        }
        title={
          owned
            ? "En mi colección"
            : "Agregar a colección"
        }
        className={`flex h-10 flex-1 items-center justify-center rounded-full border text-base font-bold transition ${
          owned
            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
            : "border-black/5 bg-white/70 text-zinc-500 hover:bg-white hover:text-zinc-900"
        } ${isPending ? "cursor-wait opacity-60" : ""}`}
      >
        {owned ? "✓" : "+"}
      </button>

      {/* Wishlist */}
      <button
        type="button"
        onClick={handleWishlist}
        disabled={isPending}
        aria-label={
          wishlist
            ? "Quitar de mi wishlist"
            : "Agregar a mi wishlist"
        }
        title={
          wishlist
            ? "En mi wishlist"
            : "Agregar a wishlist"
        }
        className={`flex h-10 flex-1 items-center justify-center rounded-full border text-base font-bold transition ${
          wishlist
            ? "border-pink-500 bg-pink-500 text-white shadow-sm"
            : "border-black/5 bg-white/70 text-zinc-500 hover:bg-white hover:text-zinc-900"
        } ${isPending ? "cursor-wait opacity-60" : ""}`}
      >
        {wishlist ? "♥" : "♡"}
      </button>
    </div>
  );
}