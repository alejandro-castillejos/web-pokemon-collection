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

function normalizeSetName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function resolveSetSlug(setName: string, setId?: string): Promise<string | null> {
  const knownNames: Record<string, string[]> = {
    sv3pt5: ["Scarlet & Violet 151", "151"],
    base1: ["Base Set"],
    base2: ["Base Set 2"],
    swsh12pt5: ["Crown Zenith"],
    swsh12: ["Silver Tempest"],
    swsh11: ["Lost Origin"],
    swsh10: ["Astral Radiance"],
    swsh9: ["Brilliant Stars"],
    swsh8: ["Fusion Strike"],
    swsh7: ["Evolving Skies"],
    swsh6: ["Chilling Reign"],
    swsh5: ["Battle Styles"],
    swsh4: ["Vivid Voltage"],
    swsh3: ["Darkness Ablaze"],
    swsh2: ["Rebel Clash"],
    swsh1: ["Sword & Shield Base Set"],
    sm12: ["Cosmic Eclipse"],
    sm11: ["Unified Minds"],
    sm10: ["Unbroken Bonds"],
    sm9: ["Team Up"],
    sm8: ["Lost Thunder"],
    sm7: ["Celestial Storm"],
    sm6: ["Forbidden Light"],
    sm5: ["Ultra Prism"],
    sm4: ["Crimson Invasion"],
    sm3: ["Burning Shadows"],
    sm2: ["Guardians Rising"],
    xy12: ["Evolutions"],
    xy11: ["Steam Siege"],
    xy10: ["Fates Collide"],
    xy9: ["BREAKpoint"],
    xy8: ["BREAKthrough"],
    xy7: ["Ancient Origins"],
    xy6: ["Roaring Skies"],
    xy5: ["Primal Clash"],
    xy4: ["Phantom Forces"],
    xy3: ["Furious Fists"],
    xy2: ["Flashfire"],
    xy1: ["XY Base Set"],
  };
  const normalizedInput = normalizeSetName(setName);
  const nameAliases: Record<string, string[]> = {
    "151": ["Scarlet & Violet 151"],
    "scarlet violet 151": ["Scarlet & Violet 151"],
    "base": ["Base Set"],
    "sword shield": ["Sword & Shield Base Set"],
  };
  const candidates = [
    setName,
    ...(setId ? knownNames[setId] ?? [] : []),
    ...(nameAliases[normalizedInput] ?? []),
  ]
    .map(normalizeSetName)
    .filter(Boolean);

  const response = await fetch("https://tcgvault.io/es/pokemon/expansiones/", {
    headers: {
      "User-Agent": "PokemonTCGCollection/0.1 (set slug lookup)",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 86400 },
  });
  if (!response.ok) return null;

  const html = await response.text();
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']*\/es\/pokemon\/expansiones\/([^/"']+)\/?)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const entries = links.map((match) => ({
    slug: match[2],
    name: normalizeSetName(stripHtml(match[3])),
  }));

  for (const candidate of candidates) {
    const exact = entries.find((entry) => entry.name === candidate);
    if (exact) return exact.slug;
  }

  // Match unique name prefixes only; avoid confusing similarly named sets.
  for (const candidate of candidates) {
    const partial = entries.filter((entry) =>
      entry.name.startsWith(candidate + " ") || candidate.startsWith(entry.name + " ")
    );
    if (partial.length === 1) return partial[0].slug;
  }
  return null;
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
    // The source list is already ordered by market value. Assign a unique,
    // consecutive rank instead of reading nearby badges that can duplicate.
    const rank = byNumber.size + 1;

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
  let slug: string | null = null;
  try {
    slug = await resolveSetSlug(setName, setId);
  } catch {
    slug = null;
  }
  // Fall back to the generated slug only if the catalogue lookup fails.
  const resolvedSlug = slug || (setId === "sv3pt5" ? "scarlet-and-violet-151" : slugifySetName(setName));
  const sourceUrl = `https://tcgvault.io/es/pokemon/expansiones/${resolvedSlug}/`;

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
