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
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#x([\da-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10))
    )
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCardNumber(value: string): string {
  return value.replace(/[a-z]+$/i, "").replace(/^0+/, "") || "0";
}

function parseChaseSection(
  html: string,
  sourceUrl: string,
  localIds: string[]
): ChasePrice[] {
  const text = stripHtml(html);
  const normalizedWanted = new Set(localIds.map(normalizeCardNumber));

  // TCG Vault places the chase ranking on the regular set page. The heading
  // wording and count vary, so don't require a fixed "15 most valuable" phrase.
  const heading = /(?:most valuable cards in|chase cards)/i.exec(text);
  if (!heading) return [];

  const sectionStart = heading.index;
  const remaining = text.slice(sectionStart);
  const nextSection = remaining.search(/\bcard list\b/i);
  const section = nextSection >= 0
    ? remaining.slice(0, nextSection)
    : remaining.slice(0, 12000);

  const numberPattern = /\b(\d{1,4}[a-z]?)\s*\/\s*\d{1,4}\b/gi;
  const found: ChasePrice[] = [];
  let match: RegExpExecArray | null;

  while ((match = numberPattern.exec(section)) !== null) {
    const cardNumber = normalizeCardNumber(match[1]);
    if (!normalizedWanted.has(cardNumber)) continue;

    // The price follows the card number and rarity in TCG Vault's rendered
    // text. Keep the search window short to avoid capturing the next card.
    const afterNumber = section.slice(numberPattern.lastIndex, numberPattern.lastIndex + 100);
    const priceMatch = afterNumber.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
    if (!priceMatch) continue;

    const priceUsd = Number(priceMatch[1].replace(/,/g, ""));
    if (!Number.isFinite(priceUsd) || priceUsd < 0) continue;

    if (!found.some((card) => card.cardNumber === cardNumber)) {
      found.push({
        cardNumber,
        priceUsd,
        rank: found.length + 1,
        sourceUrl,
      });
    }
  }

  return found.sort((a, b) => a.rank - b.rank).slice(0, 15);
}

export async function getChasePrices(
  setName: string,
  localIds: string[]
): Promise<{ cards: ChasePrice[]; sourceUrl: string }> {
  // TCG Vault's chase list is embedded on the standard set page; there is no
  // separate /chase-cards/ page for the sets checked.
  const sourceUrl = `https://tcgvault.io/pokemon/sets/${slugifySetName(setName)}/`;

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "PokemonTCGCollection/0.1 (set chase card display)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 21600 },
    });

    if (!response.ok) return { cards: [], sourceUrl };

    const html = await response.text();
    const cards = parseChaseSection(html, sourceUrl, localIds);

    return { cards, sourceUrl };
  } catch {
    return { cards: [], sourceUrl };
  }
}
