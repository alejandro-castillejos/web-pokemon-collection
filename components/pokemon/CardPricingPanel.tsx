"use client";

import GlassPanel from "@/components/ui/GlassPanel";
import type {
  TCGdexCardmarketPricing,
  TCGdexPricing,
  TCGdexPriceVariant,
  TCGdexTCGPlayerPricing,
} from "@/lib/tcgdex";

interface CardPricingPanelProps {
  pricing?: TCGdexPricing | null;
}

interface PriceRow {
  label: string;
  value: number;
  unit: string;
  detail: string;
}

function formatPrice(value: number, unit: string) {
  const currency = unit.toUpperCase();

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function formatUpdatedDate(value?: string | number) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  let date: Date;

  if (typeof value === "number") {
    date = new Date(value < 1_000_000_000_000 ? value * 1000 : value);
  } else {
    const numericValue = Number(value);
    date = Number.isFinite(numericValue) && value.trim() !== ""
      ? new Date(numericValue < 1_000_000_000_000 ? numericValue * 1000 : numericValue)
      : new Date(value);
  }

  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getVariantLabel(key: string) {
  const labels: Record<string, string> = {
    normal: "Normal",
    holo: "Holográfica",
    holofoil: "Holográfica",
    reverse: "Reverse holo",
    "reverse-holofoil": "Reverse holo",
    "1st-edition": "Primera edición",
    "1st-edition-holofoil": "Primera edición holo",
    unlimited: "Unlimited",
    "unlimited-holofoil": "Unlimited holo",
  };

  return labels[key] ?? key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function isPriceVariant(value: unknown): value is TCGdexPriceVariant {
  return typeof value === "object" && value !== null;
}

function getTCGPlayerRows(pricing?: TCGdexTCGPlayerPricing | null): PriceRow[] {
  if (!pricing) return [];

  const rows: PriceRow[] = [];
  const unit = typeof pricing.unit === "string" ? pricing.unit : "USD";

  for (const [key, rawValue] of Object.entries(pricing)) {
    if (key === "updated" || key === "unit" || !isPriceVariant(rawValue)) {
      continue;
    }

    const variant = rawValue;
    const choices: Array<{ value: number | null | undefined; detail: string }> = [
      { value: variant.marketPrice, detail: "Precio de mercado" },
      { value: variant.midPrice, detail: "Precio medio" },
      { value: variant.lowPrice, detail: "Precio mínimo" },
    ];
    const chosen = choices.find(
      (choice) => typeof choice.value === "number" && Number.isFinite(choice.value)
    );

    if (chosen?.value === undefined || chosen?.value === null) {
      continue;
    }

    rows.push({
      label: getVariantLabel(key),
      value: chosen.value,
      unit,
      detail: chosen.detail,
    });
  }

  return rows;
}

function getCardmarketRows(
  pricing?: TCGdexCardmarketPricing | null
): PriceRow[] {
  if (!pricing) return [];

  const unit = typeof pricing.unit === "string" ? pricing.unit : "EUR";
  const normalValue =
    typeof pricing.trend === "number"
      ? { value: pricing.trend, detail: "Precio de tendencia" }
      : typeof pricing.avg === "number"
        ? { value: pricing.avg, detail: "Precio promedio" }
        : null;
  const holoValue =
    typeof pricing["trend-holo"] === "number"
      ? { value: pricing["trend-holo"], detail: "Tendencia holográfica" }
      : typeof pricing["avg-holo"] === "number"
        ? { value: pricing["avg-holo"], detail: "Promedio holográfico" }
        : null;

  return [
    normalValue
      ? {
          label: "Normal",
          value: normalValue.value,
          unit,
          detail: normalValue.detail,
        }
      : null,
    holoValue
      ? {
          label: "Holográfica",
          value: holoValue.value,
          unit,
          detail: holoValue.detail,
        }
      : null,
  ].filter((row): row is PriceRow => row !== null);
}

export default function CardPricingPanel({ pricing }: CardPricingPanelProps) {
  const tcgPlayer = pricing?.tcgplayer;
  const cardmarket = pricing?.cardmarket;
  const tcgPlayerRows = getTCGPlayerRows(tcgPlayer);
  const cardmarketRows = getCardmarketRows(cardmarket);
  const tcgPlayerUpdated = formatUpdatedDate(tcgPlayer?.updated);
  const cardmarketUpdated = formatUpdatedDate(cardmarket?.updated);
  const hasPrices = tcgPlayerRows.length > 0 || cardmarketRows.length > 0;

  return (
    <GlassPanel strong className="mt-8 rounded-[28px] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Mercado
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900">
            Precio de la carta
          </h2>
        </div>
        <span className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-zinc-500">
          Referencia internacional
        </span>
      </div>

      {!hasPrices ? (
        <p className="mt-4 text-sm leading-6 text-zinc-500">
          No hay datos de precio disponibles para esta carta.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {tcgPlayerRows.length > 0 && (
            <PriceSource
              title="TCGplayer"
              subtitle="Mercado norteamericano · USD"
              updated={tcgPlayerUpdated}
              rows={tcgPlayerRows}
            />
          )}

          {cardmarketRows.length > 0 && (
            <PriceSource
              title="Cardmarket"
              subtitle="Mercado europeo · EUR"
              updated={cardmarketUpdated}
              rows={cardmarketRows}
            />
          )}
        </div>
      )}

      <p className="mt-5 border-t border-black/5 pt-4 text-xs leading-5 text-zinc-400">
        Precios de referencia proporcionados por TCGdex. Pueden no reflejar el
        mercado mexicano, el idioma, la condición o la variante exacta de tu
        carta. No constituyen una cotización ni una oferta de venta.
      </p>
    </GlassPanel>
  );
}

function PriceSource({
  title,
  subtitle,
  updated,
  rows,
}: {
  title: string;
  subtitle: string;
  updated: string | null;
  rows: PriceRow[];
}) {
  return (
    <div className="rounded-[20px] border border-black/5 bg-white/55 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
          <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
        </div>
        {updated && (
          <p className="text-right text-[10px] leading-4 text-zinc-400">
            Actualizado
            <span className="block">{updated}</span>
          </p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div
            key={`${row.label}-${row.detail}`}
            className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-800">
                {row.label}
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-400">{row.detail}</p>
            </div>
            <p className="shrink-0 text-sm font-bold tabular-nums text-zinc-900">
              {formatPrice(row.value, row.unit)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
