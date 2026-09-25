"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleCollection } from "@/app/sets/[setId]/[cardId]/actions";

interface CollectionButtonProps {
  cardId: string;
  setId: string;
  initialOwned: boolean;
}

export default function CollectionButton({
  cardId,
  setId,
  initialOwned,
}: CollectionButtonProps) {
  const [owned, setOwned] = useState(initialOwned);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  function handleClick() {
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

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-full px-6 py-3.5 text-sm font-bold transition ${
        owned
          ? "border border-emerald-500 bg-emerald-500 text-white shadow-sm"
          : "glass-hover glass text-zinc-800"
      } ${
        isPending ? "cursor-wait opacity-60" : ""
      }`}
    >
      {isPending
        ? "Guardando..."
        : owned
          ? "✓ En mi colección"
          : "+ Agregar a colección"}
    </button>
  );
}