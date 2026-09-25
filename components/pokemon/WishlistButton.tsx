"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/app/sets/[setId]/[cardId]/actions";

interface WishlistButtonProps {
  cardId: string;
  setId: string;
  initialWishlist: boolean;
}

export default function WishlistButton({
  cardId,
  setId,
  initialWishlist,
}: WishlistButtonProps) {
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  function handleClick() {
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
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-full px-6 py-3.5 text-sm font-semibold transition ${
        wishlist
          ? "border border-pink-500 bg-pink-500 text-white shadow-sm"
          : "glass-hover glass text-zinc-800"
      } ${
        isPending ? "cursor-wait opacity-60" : ""
      }`}
    >
      {isPending
        ? "Guardando..."
        : wishlist
          ? "♥ En mi wishlist"
          : "♡ Agregar a wishlist"}
    </button>
  );
}