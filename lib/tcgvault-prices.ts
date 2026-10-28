import "server-only";

interface SetLink {
  name: string;
  href: string;
}

export interface ScrapedCardPrice {
  amount: number;
  currency: "USD";
  sourceUrl: string;
  updatedLabel?: string;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
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
    .replace(/&#x([\da-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10))
    )
    .replace(/\s+/g, " ")
    .trim();
}

async function getSetLinks(): Promise<SetLink[]> {
  const response = await fetch("https://tcgvault.io/pokemon/sets/", {
    headers: { "User-Agent": "PokemonTCGCollection/0.1 (card price lookup)" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`TCG Vault sets request failed: ${response.status}`);
  }

  const html = await response.text();
  const links: SetLink[] = [];
  const linkPattern = /<a\b[^>]*href=["'](https:\/\/tcgvault\.io\/pokemon\/sets\/[^"'?#]+\/|\/pokemon\/sets\/[^"'?#]+\/)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1].startsWith("http")
      ? match[1]
      : new URL(match[1], "https://tcgvault.io").toString();
    const name = stripHtml(match[2]);
    if (name) links.push({ name, href });
  }

  return links;
}

function getCardNumber(value: string): string | null {
  const match = value.trim().match(/^(\d+)/);
  return match ? String(Number(match[1])) : null;
}

function parsePriceRows(html: string): Array<{ name: string; number: string; amount: number }> {
  const rows: Array<{ name: string; number: string; amount: number }> = [];
  const rowPattern = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const text = stripHtml(rowHtml);
    const numberMatch = text.match(/\b(\d{1,4}(?:[a-z])?)\s*\/\s*\d{1,4}\b/i);
    const priceMatches = [...text.matchAll(/\$\s*([\d,]+(?:\.\d{1,2})?)/g)];
    if (!numberMatch || priceMatches.length === 0) continue;

    const amount = Number(priceMatches[priceMatches.length - 1][1].replace(/,/g, ""));
    if (!Number.isFinite(amount)) continue;

    const nameFromImage = rowHtml.match(/alt=["'][^"']*?:\s*([^–-]+?)\s*[–-]/i);
    const nameFromLink = rowHtml.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i);
    const name = stripHtml(nameFromImage?.[1] ?? (nameFromLink ? nameFromLink[1] : ""));
    if (!name) continue;

    rows.push({
      name: normalize(name),
      number: getCardNumber(numberMatch[1]) ?? "",
      amount,
    });
  }

  return rows;
}

export async function getTcgvaultCardPrice(
  setName: string,
  cardName: string,
  localId: string | number
): Promise<ScrapedCardPrice | null> {
  try {
    const links = await getSetLinks();
    const targetSet = normalize(setName);
    const matchingSet = links.find((link) => normalize(link.name) === targetSet);
    const fallbackSlug = setName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const sourceUrl =
      matchingSet?.href ?? `https://tcgvault.io/pokemon/sets/${fallbackSlug}/`;

    const response = await fetch(sourceUrl, {
      headers: { "User-Agent": "PokemonTCGCollection/0.1 (card price lookup)" },
      next: { revalidate: 21600 },
    });
    if (!response.ok) return null;

    const html = await response.text();
    const rows = parsePriceRows(html);
    const targetName = normalize(cardName);
    const targetNumber = getCardNumber(String(localId));

    const exact = rows.find(
      (row) => row.name === targetName && row.number === targetNumber
    );
    const nameOnly = rows.find((row) => row.name === targetName);
    const selected = exact ?? (targetNumber ? null : nameOnly);
    if (!selected) return null;

    return {
      amount: selected.amount,
      currency: "USD",
      sourceUrl,
    };
  } catch {
    return null;
  }
}
