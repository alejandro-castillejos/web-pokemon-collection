"use client";

import GlassPanel from "@/components/ui/GlassPanel";

interface CardPricingPanelProps {
  searchQuery: string;
  cardmarketSearchQuery: string;
  marketPrice?: {
    amount: number;
    currency: "USD";
    sourceUrl: string;
  } | null;
}

const priceSources = [
  {
    name: "TCGplayer",
    description: "Mercado estadounidense",
    href: (query: string) =>
      `https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(query)}&productLineName=pokemon`,
    className:
      "border-blue-200/80 bg-blue-50/80 hover:border-blue-300 hover:bg-blue-100/80",
    iconColor: "text-blue-700",
    icon: "cards",
  },
  {
    name: "Cardmarket",
    description: "Mercado europeo",
    href: (query: string) =>
      `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(query)}`,
    className:
      "border-violet-200/80 bg-violet-50/80 hover:border-violet-300 hover:bg-violet-100/80",
    iconColor: "text-violet-700",
    icon: "store",
  },
  {
    name: "eBay",
    description: "Publicaciones y ventas",
    href: (query: string) =>
      `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=183454&LH_Sold=1&LH_Complete=1`,
    className:
      "border-amber-200/80 bg-amber-50/80 hover:border-amber-300 hover:bg-amber-100/80",
    iconColor: "text-amber-800",
    icon: "ebay",
  },
];

function SourceIcon({ icon }: { icon: string }) {
  if (icon === "ebay") {
    return (
      <span aria-hidden="true" className="flex items-center text-lg font-extrabold tracking-[-0.09em]">
        <span className="text-[#e53238]">e</span>
        <span className="text-[#0064d2]">B</span>
        <span className="text-[#f5af02]">a</span>
        <span className="text-[#86b817]">y</span>
      </span>
    );
  }

  if (icon === "cards") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect x="7" y="3.5" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5 7H4.5A1.5 1.5 0 0 0 3 8.5v11A1.5 1.5 0 0 0 4.5 21h9a1.5 1.5 0 0 0 1.5-1.5V19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M10 8h6M10 11h6M10 14h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M4 9.5 5.5 5h13L20 9.5M4 9.5h16M4 9.5v9A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-9M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CardPricingPanel({ searchQuery, cardmarketSearchQuery, marketPrice }: CardPricingPanelProps) {
  return (
    <GlassPanel strong className="mt-6 rounded-[24px] p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-zinc-900">
        Busca precio de carta
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Consulta esta carta en una tienda o mercado externo.
      </p>

      <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
          Precio de mercado estimado
        </p>
        {marketPrice ? (
          <>
            <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: marketPrice.currency,
              }).format(marketPrice.amount)} USD
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Precio Near Mint de TCGplayer, obtenido de TCG Vault. Puede variar según la condición y la versión de la carta.
            </p>
            <a
              href={marketPrice.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex text-xs font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
            >
              Ver precio en la fuente
            </a>
          </>
        ) : (
          <p className="mt-1 text-sm text-zinc-600">
            No se encontró un precio coincidente para esta carta. Puedes consultar los mercados externos.
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {priceSources.map((source) => (
          <a
            key={source.name}
            href={source.href(source.name === "Cardmarket" ? cardmarketSearchQuery : searchQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm ${source.className}`}
            aria-label={`Buscar ${source.name === "Cardmarket" ? cardmarketSearchQuery : searchQuery} en ${source.name}`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm ${source.iconColor}`}>
              <SourceIcon icon={source.icon} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-zinc-900">
                {source.name}
              </span>
              <span className="mt-0.5 block text-xs leading-4 text-zinc-600">
                {source.description}
              </span>
            </span>
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:translate-x-0.5">
              <path d="M7 4H4.75A1.75 1.75 0 0 0 3 5.75v9.5A1.75 1.75 0 0 0 4.75 17h9.5A1.75 1.75 0 0 0 16 15.25V13M11 3h6v6M17 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ))}
      </div>
    </GlassPanel>
  );
}
