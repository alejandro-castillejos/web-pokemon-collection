import { getCard, getSet } from "@/lib/tcgdex";
import CardDetailsPage from "@/components/pokemon/CardDetailsPage";

interface CardPageProps {
  params: Promise<{ setId: string; cardId: string }>;
}

export default async function CardPage({ params }: CardPageProps) {
  const { setId, cardId } = await params;
  const [set, card] = await Promise.all([getSet(setId), getCard(cardId)]);

  return (
    <CardDetailsPage
      setId={setId}
      cardId={cardId}
      set={set}
      card={card}
      basePath="/sets"
    />
  );
}
