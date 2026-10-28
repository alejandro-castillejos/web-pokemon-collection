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
  return value.replace(/^0+/, "") || "0";
}

function parseChaseSection(
  html: string,
  sourceUrl: string,
  localIds: string[]
): ChasePrice[] {
  const text = stripHtml(html);
  const heading = /cartas chase de/i.exec(text);
  if (!heading) return [];

  const fromHeading = text.slice(heading.index);
  const listHeading = /lista de cartas de/i.exec(fromHeading);
  const section = listHeading
    ? fromHeading.slice(0, listHeading.index)
    : fromHeading.slice(0, 16000);

  const wanted = new Set(localIds.map(normalizeCardNumber));
  const numberPattern = /\b(\d{1,4})\s*\/\s*\d{1,4}\b/g;
  const matches = [...section.matchAll(numberPattern)];
  const byNumber = new Map<string, ChasePrice>();

  for (const [index, match] of matches.entries()) {
    const cardNumber = normalizeCardNumber(match[1]);
    if (!wanted.has(cardNumber) || byNumber.has(cardNumber)) continue;

    const position = match.index ?? 0;
    const before = section.slice(Math.max(0, position - 100), position);
    const nearby = section.slice(Math.max(0, position - 100), Math.min(section.length, position + 180));
    const rankMatches = [...nearby.matchAll(/#\s*(\d{1,2})\b/g)];
    const rank = rankMatches.length
      ? Number(rankMatches[rankMatches.length - 1][1])
      : index + 1;

    const nextNumberPosition = matches[index + 1]?.index ?? section.length;
    const after = section.slice(position, Math.min(nextNumberPosition + 100, position + 500));
    const priceMatch = after.match(/(\d[\d.]*,\d{2})\s*€/);
    if (!priceMatch) continue;

    const priceEur = Number(priceMatch[1].replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(priceEur) || priceEur <= 0) continue;

    const cardNameMatch = before.match(/([A-ZÀ-ÿ][\wÀ-ÿ' -]+(?:ex)?)[\s–-]*n[.º°]?\s*$/i);
    byNumber.set(cardNumber, {
      cardNumber,
      cardName: cardNameMatch?.[1]?.trim() ?? "",
      priceEur,
      rank,
      sourceUrl,
    });
  }

  return [...byNumber.values()].slice(0, 10);
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
