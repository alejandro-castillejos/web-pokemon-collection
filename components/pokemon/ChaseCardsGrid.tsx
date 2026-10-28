"use client";

import { useEffect, useState } from "react";
import PokemonCard from "@/components/pokemon/PokemonCard";

type Currency = "EUR" | "USD" | "MXN";
interface ChaseCardItem { id: string; localId: string; name: string; image?: string; priceEur: number; owned: boolean; wishlist: boolean; }
interface ChaseCardsGridProps { setId: string; setName: string; officialCount: number; cards: ChaseCardItem[]; }
const currencyInfo: Record<Currency, { locale: string; label: string }> = { EUR: { locale: "de-DE", label: "EUR (€)" }, USD: { locale: "en-US", label: "USD ($)" }, MXN: { locale: "es-MX", label: "MXN ($)" } };

export default function ChaseCardsGrid({ setId, setName, officialCount, cards }: ChaseCardsGridProps) {
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [rates, setRates] = useState<Partial<Record<Currency, number>>>({ EUR: 1 });
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [rateError, setRateError] = useState(false);

  useEffect(() => {
    if (currency === "EUR" || rates[currency]) return;
    let cancelled = false;
    async function loadRate() {
      try {
        const response = await fetch(`https://api.frankfurter.dev/v2/rate/eur/${currency.toLowerCase()}`);
        if (!response.ok) throw new Error("No se pudo obtener el tipo de cambio");
        const result = (await response.json()) as { rate: number; date?: string };
        if (cancelled || !Number.isFinite(result.rate)) return;
        setRates((current) => ({ ...current, [currency]: result.rate }));
        setRateDate(result.date ?? null); setRateError(false);
      } catch { if (!cancelled) setRateError(true); }
    }
    void loadRate(); return () => { cancelled = true; };
  }, [currency, rates]);

  function formatPrice(priceEur: number): string {
    const rate = rates[currency];
    if (!rate) return currency === "EUR" ? `€${priceEur.toFixed(2)} EUR` : "Cargando cambio…";
    return `${new Intl.NumberFormat(currencyInfo[currency].locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(priceEur * rate)} ${currency}`;
  }

  return <>
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <label htmlFor="chase-currency" className="text-sm font-medium text-zinc-600">Mostrar precios en</label>
      <select id="chase-currency" value={currency} onChange={(event) => setCurrency(event.target.value as Currency)} className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-800 outline-none focus:border-zinc-400">
        {(["EUR", "USD", "MXN"] as Currency[]).map((value) => <option key={value} value={value}>{currencyInfo[value].label}</option>)}
      </select>
      <span className="text-xs text-zinc-400">{currency === "EUR" ? "Precio original de Cardmarket" : rateError ? "No se pudo consultar el tipo de cambio" : rateDate ? `Tipo de cambio de referencia · ${rateDate}` : "Conversión aproximada con tipo de cambio de referencia"}</span>
    </div>
    <section className="grid grid-cols-2 gap-4 pb-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {cards.map((card, index) => <PokemonCard key={card.id} setId={setId} cardId={card.id} number={`${card.localId}/${officialCount}`} name={card.name} image={card.image} priority={index < 4} marketPrice={`#${index + 1} · ${formatPrice(card.priceEur)}`} setName={setName} owned={card.owned} wishlist={card.wishlist} />)}
    </section>
  </>;
}