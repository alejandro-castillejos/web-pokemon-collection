import Link from "next/link";
import { redirect } from "next/navigation";

import GlassPanel from "@/components/ui/GlassPanel";
import SetDetailsPage from "@/components/pokemon/SetDetailsPage";
import { getSet } from "@/lib/tcgdex";
import { createClient } from "@/lib/supabase/server";

interface WishlistSetPageProps {
  params: Promise<{ setId: string }>;
}

export default async function WishlistSetPage({
  params,
}: WishlistSetPageProps) {
  const { setId } = await params;
  const supabase = await createClient();

  const [set, authResult] = await Promise.all([
    getSet(setId),
    supabase.auth.getUser(),
  ]);

  if (!set) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-6">
        <GlassPanel className="max-w-md rounded-[28px] p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Error
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            Set no encontrado
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            El set que intentaste abrir no existe.
          </p>
          <Link
            href="/wishlist"
            className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Volver a wishlist
          </Link>
        </GlassPanel>
      </main>
    );
  }

  const {
    data: { user },
  } = authResult;

  if (!user) {
    redirect("/login?reason=wishlist");
  }

  const cardIds = (set.cards ?? []).map((card) => card.id);
  const wishlistCardIds = new Set<string>();
  const ownedCardIds = new Set<string>();

  if (cardIds.length > 0) {
    const [wishlistResult, collectionResult] = await Promise.all([
      supabase
        .from("wishlist")
        .select("card_id")
        .eq("user_id", user.id)
        .in("card_id", cardIds),
      supabase
        .from("collection")
        .select("card_id")
        .eq("user_id", user.id)
        .in("card_id", cardIds),
    ]);

    if (wishlistResult.error) {
      throw new Error(
        `Error obteniendo la wishlist: ${wishlistResult.error.message}`
      );
    }

    if (collectionResult.error) {
      throw new Error(
        `Error obteniendo la colección: ${collectionResult.error.message}`
      );
    }

    wishlistResult.data?.forEach((row) =>
      wishlistCardIds.add(row.card_id)
    );
    collectionResult.data?.forEach((row) =>
      ownedCardIds.add(row.card_id)
    );
  }

  return (
    <SetDetailsPage
      set={set}
      basePath="/wishlist"
      ownedCardIds={ownedCardIds}
      wishlistCardIds={wishlistCardIds}
    />
  );
}
