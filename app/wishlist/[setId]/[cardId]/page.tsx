import { getCard, getSet } from "@/lib/tcgdex";
import CardDetailsPage from "@/components/pokemon/CardDetailsPage";

interface WishlistCardPageProps {
  params: Promise<{
    setId: string;
    cardId: string;
  }>;
}

export default async function WishlistCardPage({
  params,
}: WishlistCardPageProps) {
  const { setId, cardId } = await params;

  const [set, card] = await Promise.all([
    getSet(setId),
    getCard(cardId),
  ]);

  return (
    <CardDetailsPage
      setId={setId}
      cardId={cardId}
      set={set}
      card={card}
      basePath="/wishlist"
    />
  );
}
