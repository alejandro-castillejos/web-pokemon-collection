import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import SetDetailsPage from "@/components/pokemon/SetDetailsPage";
import { getSet } from "@/lib/tcgdex";
import { createClient } from "@/lib/supabase/server";

interface SetPageProps {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ filter?: string }>;
}

export default async function SetPage({
  params,
  searchParams,
}: SetPageProps) {
  const [{ setId }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  const validFilters = ["all", "missing", "collection", "wishlist"] as const;
  type SetFilter = (typeof validFilters)[number];

  const currentFilter: SetFilter = validFilters.includes(
    query.filter as SetFilter
  )
    ? (query.filter as SetFilter)
    : "all";
  const supabase = await createClient();

  const [set, authResult] = await Promise.all([
    getSet(setId),
    supabase.auth.getUser(),
  ]);

  if (!set) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-6">
        <GlassPanel className="max-w-md rounded-[28px] p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Error</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">Set no encontrado</h1>
          <p className="mt-3 text-sm text-zinc-500">El set que intentaste abrir no existe.</p>
          <Link href="/sets" className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">
            Volver a sets
          </Link>
        </GlassPanel>
      </main>
    );
  }

  const {
    data: { user },
  } = authResult;

  const ownedCardIds = new Set<string>();
  const wishlistCardIds = new Set<string>();

  if (user && set.cards?.length) {
    const cardIds = set.cards.map((card) => card.id);

    const [collectionResult, wishlistResult] = await Promise.all([
      supabase
        .from("collection")
        .select("card_id")
        .eq("user_id", user.id)
        .in("card_id", cardIds),
      supabase
        .from("wishlist")
        .select("card_id")
        .eq("user_id", user.id)
        .in("card_id", cardIds),
    ]);

    if (collectionResult.error) {
      throw new Error(
        `Error obteniendo la colección: ${collectionResult.error.message}`
      );
    }

    if (wishlistResult.error) {
      throw new Error(
        `Error obteniendo la wishlist: ${wishlistResult.error.message}`
      );
    }

    collectionResult.data?.forEach((row) => ownedCardIds.add(row.card_id));
    wishlistResult.data?.forEach((row) => wishlistCardIds.add(row.card_id));
  }

  return (
    <SetDetailsPage
      set={set}
      basePath="/sets"
      ownedCardIds={ownedCardIds}
      wishlistCardIds={wishlistCardIds}
      filter={currentFilter}
    />
  );
}
