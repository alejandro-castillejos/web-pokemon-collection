"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import LoginRequiredModal from "@/components/ui/LoginRequiredModal";
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
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleCollection(cardId, setId);

      if (!result.success) {
        setActionError(result.requiresLogin ? null : result.error);
        setLoginModalOpen(true);
        return;
      }

      setOwned(result.owned);
      setActionError(null);
      setLoginModalOpen(false);
      router.refresh();
    });
  }

  function closeModal() {
    setLoginModalOpen(false);
    setActionError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={owned ? "Quitar de mi colección" : "Agregar a mi colección"}
        className={`rounded-full px-6 py-3.5 text-sm font-bold transition ${
          owned
            ? "border border-emerald-500 bg-emerald-500 text-white shadow-sm"
            : "glass-hover glass text-zinc-800"
        } ${isPending ? "cursor-wait opacity-60" : ""}`}
      >
        {isPending
          ? "Guardando..."
          : owned
            ? "✓ En mi colección"
            : "+ Agregar a colección"}
      </button>

      <LoginRequiredModal
        open={loginModalOpen}
        action="collection"
        errorMessage={actionError}
        onClose={closeModal}
      />
    </>
  );
}
