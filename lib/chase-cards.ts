import "server-only";

export interface ChasePrice {
  cardNumber: string;
  priceUsd: number;
  rank: number;
  sourceUrl: string;
}

function slugifySetName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getChasePrices(
  setName: string,
  localIds: string[]
): Promise<{ cards: ChasePrice[]; sourceUrl: string }> {
  const slug = slugifySetName(setName);
  const sourceUrl = `https://tcgvault.io/pokemon/sets/${slug}/chase-cards/`;

  try {
    const response = await fetch(sourceUrl, {
      headers: { "User-Agent": "PokemonTCGCollection/0.1 (set chase card display)" },
      next: { revalidate: 21600 },
    });

    if (!response.ok) return { cards: [], sourceUrl };

    const html = await response.text();
    const headingMatch = html.match(/The\s+15\s+most\s+valuable[^<]*/i);
    const headingIndex = headingMatch?.index ?? -1;
    if (headingIndex < 0) return { cards: [], sourceUrl };

    const afterHeading = html.slice(headingIndex);
    const nextHeading = afterHeading.search(/<h2\b/i);
    const section = nextHeading > 0 ? afterHeading.slice(0, nextHeading) : afterHeading;
    const text = stripHtml(section);
    const wanted = new Set(localIds.map((id) => id.replace(/^0+/, "")));
    const cards: ChasePrice[] = [];
    const numberPattern = /\b(\d{1,3})\s*\/\s*\d{2,3}\b/g;
    let match: RegExpExecArray | null;

    while ((match = numberPattern.exec(text)) !== null) {
      const cardNumber = match[1].replace(/^0+/, "");
      if (!wanted.has(cardNumber)) continue;

      const trailingText = text.slice(numberPattern.lastIndex, numberPattern.lastIndex + 180);
      const priceMatch = trailingText.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
      if (!priceMatch) continue;

      const priceUsd = Number(priceMatch[1].replace(/,/g, ""));
      if (!Number.isFinite(priceUsd)) continue;

      if (!cards.some((card) => card.cardNumber === cardNumber)) {
        cards.push({
          cardNumber,
          priceUsd,
          rank: cards.length + 1,
          sourceUrl,
        });
      }
    }

    return {
      cards: cards.sort((a, b) => a.rank - b.rank).slice(0, 15),
      sourceUrl,
    };
  } catch {
    return { cards: [], sourceUrl };
  }
}
