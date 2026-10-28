import "server-only";

export interface ChasePrice {
  cardNumber: string;
  cardName: string;
  priceEur: number;
  rank: number;
  sourceUrl: string;
}

function slugifySetName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
    .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
    .replace(/<svg[\\s\\S]*?<\\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#x([\\da-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\\d+);/g, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10))
    )
    .replace(/\\s+/g, " ")
    .trim();
}

function normalizeCardNumber(value: string): string {
  return value.replace(/^0+/, "") || "0";
}

function parseChaseSection(
  html: string,
  sourceUrl: string,
  localIds: string[]
): ChasePrice[] {
  const text = stripHtml(html);
  const heading = /cartas chase de/i.exec(text) ?? /las cartas más valiosas de/i.exec(text);
  if (!heading) return [];

  const fromHeading = text.slice(heading.index);
  const listHeading = /lista de cartas de/i.exec(fromHeading);
  const section = listHeading
    ? fromHeading.slice(0, listHeading.index)
    : fromHeading.slice(0, 14000);

  const wanted = new Set(localIds.map(normalizeCardNumber));
  const numberPattern = /\\b(\\d{1,4})\\s*\\/\\s*\\d{1,4}\\b/g;
  const matches = [...section.matchAll(numberPattern)];
  const found: ChasePrice[] = [];
  const seen = new Set<string>();

  matches.forEach((match, index) => {
    const cardNumber = normalizeCardNumber(match[1]);
    if (!wanted.has(cardNumber) || seen.has(cardNumber)) return;

    const entryStart = Math.max(0, match.index ?? 0 - 180);
    const entryEnd = matches[index + 1]?.index ?? Math.min(section.length, (match.index ?? 0) + 260);
    const entry = section.slice(entryStart, entryEnd);
    const priceMatch = entry.match(/([0-9]+(?:[.,][0-9]{2})?)\\s*€/);
    if (!priceMatch) return;

    const priceEur = Number(priceMatch[1].replace(/\\./g, "").replace(",", "."));
    if (!Number.isFinite(priceEur) || priceEur <= 0) return;

    const cardName = entry
      .replace(/.*?\\b(?:\\d{1,4})\\s*\\/\\s*\\d{1,4}\\b/, "")
      .replace(/[0-9]+(?:[.,][0-9]{2})?\\s*€.*/, "")
      .replace(/Special Illustration Rare|Futuristic Rare|Illustration Rare|Ultra Rare|Secret Rare|Holo Rare|Double Rare|Common|Uncommon/gi, "")
      .replace(/[#·|]/g, " ")
      .replace(/\\s+/g, " ")
      .trim();

    found.push({
      cardNumber,
      cardName,
      priceEur,
      rank: matches.indexOf(match) + 1,
      sourceUrl,
    });
    seen.add(cardNumber);
  });

  return found.sort((a, b) => a.rank - b.rank).slice(0, 10);
}

export async function getChasePrices(
  setName: string,
  localIds: string[],
  setId?: string
): Promise<{ cards: ChasePrice[]; sourceUrl: string }> {
  const knownSlugs: Record<string, string> = {
    base1: "base-set",
    base2: "base-set-2",
  };
  const slug = (setId && knownSlugs[setId]) || slugifySetName(setName);
  // Use TCG Vault's Spanish page: its chase ranking and prices are in euros
  // from Cardmarket, matching the values displayed on the reference page.
  const sourceUrl = `https://tcgvault.io/es/pokemon/expansiones/${slug}/`;

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
    return { cards: parseChaseSection(html, sourceUrl, localIds), sourceUrl };
  } catch {
    return { cards: [], sourceUrl };
  }
}
